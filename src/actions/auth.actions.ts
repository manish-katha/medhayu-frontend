'use server';

import { z } from 'zod';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/user.model';
import Clinic from '@/models/clinic.model';
import jwt from 'jsonwebtoken';
import { setSession } from '@/utils/common/authHelper';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough';

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export async function loginUser(prevState: any, formData: FormData) {
  const validatedFields = loginFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: "Invalid fields.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await connectToDatabase();
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return { error: 'Invalid credentials.' };
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return { error: 'Invalid credentials.' };
    }

    const userPayload = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isStudent: user.isStudent,
      isDoctor: user.isDoctor,
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1d' });
    await setSession(token);
    
    // We pass back the user details along with the token for the client to use.
    return { success: true, user: { ...userPayload, token } };

  } catch (error: any) {
    return { error: `An internal server error occurred: ${error.message}` };
  }
}

export async function registerUser(prevState: any, formData: FormData) {
  try {
    await connectToDatabase();

    const data = Object.fromEntries(formData.entries());

    // Basic validation
    if (data.password !== data.confirmPassword) {
      return { error: "Passwords do not match." };
    }

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return { error: 'A user with this email already exists.' };
    }
    
    const newUser = new User({
        firstname: data.firstname,
        lastname: data.lastname,
        phone: data.phone,
        email: data.email,
        password: data.password, // Hashing is handled by pre-save hook
        isStudent: data.professionalRole === 'student',
        isDoctor: data.professionalRole === 'doctor',
        isBams: data.isBams ,
        isMdMs: data.isMdMs,
        ugCLgName: data.ugCLgName,
        ugPincode: data.ugPincode,
        Batch: data.Batch,
        pgClgName: data.pgClgName,
        pgPinCode: data.pgPinCode,
        specialization: data.specialization,
        isPracticener: data.isPracticener,
        workType: data.workType,
        futurePlan: data.futurePlan,
        registerationNo: data.registerationNo,
    });
    
    const savedUser = await newUser.save();

    if (savedUser.isPracticener) {
        const newClinic = new Clinic({
            userId: savedUser._id,
            practiceCenterType: data.practiceCenterType,
            workspaceType: data.workspaceType,
            practiceCenterName: data.practiceCenterName,
            practiceCenterAddress: data.practiceCenterAddress,
            createdBy: savedUser._id,
        });
        await newClinic.save();
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Registration Error:", error);
    return { error: `An internal server error occurred: ${error.message}` };
  }
}
