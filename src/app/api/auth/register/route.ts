
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/user.model';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const newUser = new User({
      name,
      email,
      password, // The pre-save hook will hash this
      role,
      isStudent: role === 'student',
      isDoctor: role === 'doctor',
    });

    await newUser.save();
    
    // Don't return password
    const userObj = newUser.toObject();
    delete userObj.password;

    return NextResponse.json({ message: 'User created successfully', user: userObj }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
