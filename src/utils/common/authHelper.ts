'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const AUTH_TOKEN_ALIAS = 'user_auth';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough';


export const setSession = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_TOKEN_ALIAS, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 // 1 day
  });
};

export const getSession = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_ALIAS);

    if (token && token.value) {
        try {
            const decoded = jwt.verify(token.value, JWT_SECRET);
            return { 
                isLoggedIn: true,
                userDetail: decoded
            };
        } catch (error) {
            console.error("Invalid token:", error);
            return null;
        }
    }
    
    return null;
};

export const removeSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_TOKEN_ALIAS);
};
