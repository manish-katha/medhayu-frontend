
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/user.model';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
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

    cookies().set('user_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        userDetail: userPayload,
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
