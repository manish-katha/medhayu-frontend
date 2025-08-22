
'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import path from 'path';
import type { Clinic } from '@/types/user';
import connectToDatabase from '@/lib/db/mongoose';
import ClinicModel from '@/models/clinic.model';

const clinicLogoFilePath = path.join(corpusPath, 'clinic-logo.json');

interface LogoData {
    dataUrl: string;
}

export async function saveClinicLogo(dataUrl: string): Promise<{ success: boolean }> {
    try {
        await writeJsonFile<LogoData>(clinicLogoFilePath, { dataUrl });
        return { success: true };
    } catch (error) {
        console.error('Failed to save clinic logo:', error);
        throw new Error('Could not save logo.');
    }
}

export async function getClinicLogo(): Promise<string | null> {
    try {
        const logoData = await readJsonFile<LogoData>(clinicLogoFilePath, { dataUrl: '' });
        return logoData.dataUrl || null;
    } catch (error) {
        return null;
    }
}

// New functions to manage clinics from MongoDB
export async function getClinics(): Promise<Clinic[]> {
    await connectToDatabase();
    const clinics = await ClinicModel.find({}).sort({ clinicName: 1 });
    return JSON.parse(JSON.stringify(clinics));
}

export async function getClinicsByDoctorId(doctorId: string): Promise<Clinic[]> {
    await connectToDatabase();
    // Find clinics either owned by the doctor OR shared with them
    const clinics = await ClinicModel.find({
        $or: [
            { doctorId: doctorId },
            { sharedWith: doctorId }
        ]
    }).sort({ clinicName: 1 });
    return JSON.parse(JSON.stringify(clinics));
}


export async function addClinic(clinicData: Omit<Clinic, 'clinicId'>): Promise<Clinic> {
    await connectToDatabase();
    const newClinic = new ClinicModel(clinicData);
    await newClinic.save();
    return JSON.parse(JSON.stringify(newClinic));
}

export async function updateClinic(id: string, updates: Partial<Clinic>): Promise<Clinic> {
    await connectToDatabase();
    const updatedClinic = await ClinicModel.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedClinic) {
        throw new Error("Clinic not found");
    }
    return JSON.parse(JSON.stringify(updatedClinic));
}
