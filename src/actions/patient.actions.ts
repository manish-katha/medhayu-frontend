

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import Patient from '@/models/patient.model';
import connectToDatabase from '@/lib/db/mongoose';
import type { PatientData } from '@/types/patient';
import { getSession } from '@/utils/common/authHelper';

const patientFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.coerce.number().min(0, 'Age must be a positive number'),
  gender: z.string().min(1, 'Gender is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  chiefComplaint: z.string().optional(),
  medicalHistory: z.string().optional(),
  cin: z.string().optional(),
  oid: z.string().optional(),
  clinicId: z.string().optional(), // Added clinicId
});

export async function createPatient(
  data: unknown
): Promise<{ success: boolean; data?: PatientData; error?: string; fieldErrors?: any; }> {
  
  const validatedFields = patientFormSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Validation failed.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const session = await getSession();
    if (!session?.userDetail?._id) {
        return { success: false, error: 'User not authenticated.' };
    }
    const userId = session.userDetail._id;

    await connectToDatabase();
    
    const newPatient = new Patient({
      ...validatedFields.data,
      createdBy: userId,
    });
    
    const savedPatient = await newPatient.save();
    
    revalidatePath('/patients');

    return { success: true, data: JSON.parse(JSON.stringify(savedPatient)) };
  } catch (error: any) {
    console.error("Error creating patient:", error);
    return {
      success: false,
      error: 'An unexpected error occurred while creating the patient.',
    };
  }
}

interface GetPatientsResponse {
    success: boolean;
    data?: {
        totalPatients: number;
        totalPages: number;
        currentPage: number;
        patients: PatientData[];
    };
    error?: string;
}

export const getPatients = async (
  page: number = 1,
  limit: number = 10,
  filters: { [key: string]: any } = {}
): Promise<GetPatientsResponse> => {
  try {
    await connectToDatabase();
    
    const { gender, age, ...searchFilters } = filters;
    let query: any = {};

    if (gender) {
        query.gender = gender;
    }
    
    if (age) {
        const [min, max] = age.split('-').map(Number);
        if(!isNaN(min) && !isNaN(max)) {
            query.age = { $gte: min, $lte: max };
        }
    }
    
    const totalPatients = await Patient.countDocuments(query);
    const totalPages = Math.ceil(totalPatients / limit);
    const patients = await Patient.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    return {
        success: true,
        data: {
            totalPatients,
            totalPages,
            currentPage: page,
            patients: JSON.parse(JSON.stringify(patients)),
        },
    };

  } catch (error) {
    console.error("Error fetching patients:", error);
    return {
      success: false,
      error: (error as Error)?.message || "An unexpected error occurred",
    };
  }
};


export const getPatientById = async (id: string): Promise<PatientData | null> => {
    try {
        await connectToDatabase();
        const patient = await Patient.findById(id);
        return patient ? JSON.parse(JSON.stringify(patient)) : null;
    } catch (error) {
        console.error("Error fetching patient by ID:", error);
        return null;
    }
};


export const deletePatient = async (patientId: string): Promise<{ success: boolean; error?: string }> => {
  try {
      await connectToDatabase();
      const result = await Patient.findByIdAndDelete(patientId);
      if (!result) {
          return { success: false, error: "Patient not found." };
      }
      revalidatePath('/patients');
      return { success: true };
  } catch (error: any) {
    console.error("Error deleting patient:", error);
    return { 
      success: false, 
      error: "Failed to delete patient record."
    };
  }
};


export const generateNextPatientId = async (): Promise<{ oid: string, cin: string }> => {
    try {
        await connectToDatabase();
        const patientCount = await Patient.countDocuments();
        const nextId = patientCount + 1;
        const cin = `OPDO-${nextId}`;
        const oid = `OID/OSD-1001-${new Date().toISOString().slice(2,10).replace(/-/g,"")}${nextId}`;
        return { oid, cin };
    } catch (error) {
        console.error("Failed to generate patient ID:", error);
        const fallbackId = `OPDO-ERR-${Date.now()}`;
        return { oid: fallbackId, cin: fallbackId };
    }
};



