
'use server';

import type { Clinic } from '@/types/user';
import { getSession } from '@/utils/common/authHelper';
import connectToDatabase from '@/lib/db/mongoose';
import ClinicModel from '@/models/clinic.model';


interface GetClinicsResponse {
  success: boolean;
  data?: any[];
  error?: string;
}

// This action should be called from the client to get clinics for the logged-in user.
export const getClinicsForUser = async (): Promise<GetClinicsResponse> => {
    const session = await getSession(); 
    const userId = session?.userDetail?._id; 
    
    if (!userId) {
        return { success: false, error: "User not authenticated." };
    }
    
    try {
        await connectToDatabase();
        // This query finds clinics where the user is the owner OR is in the sharedWith array.
        // This replaces the more complex sequelize logic with a simple MongoDB $or query.
        const clinics = await ClinicModel.find({
            $or: [
                { userId: userId },
                { 'sharedClinic.userId': userId }
            ]
        }).sort({ clinicName: 1 });
        
        return {
            success: true,
            data: JSON.parse(JSON.stringify(clinics)),
        };
    } catch (error) {
        console.error("Error fetching clinics:", error);
        return {
            success: false,
            error: (error as Error)?.message || "An unexpected error occurred",
        };
    }
};
