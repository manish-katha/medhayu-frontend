'use server';

import Test from '@/models/test.model';
import connectToDatabase from '@/lib/db/mongoose';

export async function testDbConnection(prevState: any, formData: FormData) {
  console.log("[testDbConnection] Starting database test...");

  if (!process.env.MONGODB_URI) {
    console.error("[testDbConnection] MONGODB_URI is missing in .env file");
    return { error: 'MONGODB_URI is not configured. Please add it to your .env file.' };
  }

  try {
    console.log("[testDbConnection] Attempting to connect to database...");
    await connectToDatabase();
    console.log("[testDbConnection] ✅ Database connection established.");

    const message = `Test entry created at ${new Date().toISOString()}`;
    console.log(`[testDbConnection] Creating new Test document with message: "${message}"`);

    const newTestEntry = new Test({ message });
    
    console.log("[testDbConnection] Saving Test document...");
    await newTestEntry.save();
    console.log("[testDbConnection] ✅ Test document saved successfully.");

    return { success: true };
  } catch (error) {
    console.error("[testDbConnection] ❌ Error occurred:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred during the database test.' };
  }
}
