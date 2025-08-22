
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Patient from '@/models/patient.model';
import { createPatient as createPatientAction } from '@/actions/patient.actions';
import { createUser as createUserAction } from '@/actions/auth.actions';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Distinguish between user and patient creation based on payload
  if (body.password && body.role) { // User registration
      return await createUserAction(body);
  } else { // Patient creation
      const result = await createPatientAction(body);
      if (result.success) {
          return NextResponse.json({ success: true, data: result.data }, { status: 201 });
      } else {
          return NextResponse.json({ success: false, message: result.error, errors: result.fieldErrors }, { status: 400 });
      }
  }
}
