
'use server';

import User from '@/models/user.model';
import Clinic from '@/models/clinic.model';
import connectToDatabase from '@/lib/db/mongoose';
import { OnboardingFormValues, onboardingFormSchema } from '@/components/onboarding/formSchema';
import { revalidatePath } from 'next/cache';

export async function onboardUser(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; error?: string; fieldErrors?: any }> {
  
  const jsonData = formData.get('jsonData') as string;

  if (!jsonData) {
    return { success: false, error: "Missing form data." };
  }

  let data: OnboardingFormValues;
  
  try {
    data = JSON.parse(jsonData);
  } catch (error) {
    return { success: false, error: "Invalid form data format." };
  }

  const validatedFields = onboardingFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Validation failed on the server.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { role } = validatedFields.data;

  try {
    await connectToDatabase();

    if (validatedFields.data.role === 'student') {
        const { account, student } = validatedFields.data;
        const existingUser = await User.findOne({ email: account.email });
        if (existingUser) {
            return { success: false, error: 'A user with this email already exists.' };
        }
        
        const newUser = new User({
            name: account.name,
            email: account.email,
            phone: account.phone,
            password: account.password,
            isStudent: true,
            isDoctor: false,
            ugCLgName: student.collegeName,
            // ...map other student fields
        });
        await newUser.save();
    } else if (validatedFields.data.role === 'doctor') {
        const { account, doctor } = validatedFields.data;
        const existingUser = await User.findOne({ email: account.email });
        if (existingUser) {
            return { success: false, error: 'A user with this email already exists.' };
        }

        const newUser = new User({
            name: account.name,
            email: account.email,
            phone: account.phone,
            password: account.password,
            isStudent: false,
            isDoctor: true,
            // ...map other doctor fields from `doctor` object
        });
        const savedUser = await newUser.save();
        
        if (doctor.clinics.length > 0) {
            const clinicPromises = doctor.clinics.map(clinicInfo => {
                const newClinic = new Clinic({
                clinicName: clinicInfo.name,
                location: clinicInfo.address,
                doctorId: savedUser._id,
                });
                return newClinic.save();
            });
            await Promise.all(clinicPromises);
        }
    }
    
    revalidatePath('/erp/clinics');

    return { success: true };

  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, error: 'A user with this email already exists.' };
    }
    return {
      success: false,
      error: 'An unexpected error occurred during registration.',
    };
  }
}
