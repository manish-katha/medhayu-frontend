
'use server';

import connectToDatabase from "@/lib/db/mongoose";
import Prescription from "@/models/prescription.model";
import Visit from "@/models/visit.model";
import { getSession } from "@/utils/common/authHelper";

interface PrescriptionData {
  patientId: string;
  clinicId: string;
  medicines: any[];
  diagnosticTests: string[];
  specialInstructions: string;
  dietInstructions: string;
  nextVisitDate?: Date;
  trackProgress?: boolean;
}

export async function createPrescriptionAndVisit(data: PrescriptionData) {
  try {
    const session = await getSession();
    if (!session?.userDetail?._id) {
      return { success: false, error: 'User not authenticated.' };
    }
    const userId = session.userDetail._id;

    await connectToDatabase();

    // 1. Create the Prescription
    const newPrescription = new Prescription({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });
    const savedPrescription = await newPrescription.save();

    // 2. Create the Visit, linking it to the new prescription
    const newVisit = new Visit({
      patientId: data.patientId,
      clinicId: data.clinicId,
      prescriptionId: savedPrescription._id,
      createdBy: userId,
      updatedBy: userId,
    });
    await newVisit.save();

    return { success: true, data: { prescriptionId: savedPrescription._id, visitId: newVisit._id } };

  } catch (error: any) {
    console.error("Error creating prescription and visit:", error);
    return { success: false, error: `Failed to save records: ${error.message}` };
  }
}
