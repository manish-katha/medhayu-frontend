
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addVendor } from '@/services/vendor.service';
import { vendorSchema } from '@/types/vendor';

export async function createVendor(prevState: any, formData: FormData) {
    const data = {
        name: formData.get('name'),
        contactPerson: formData.get('contactPerson'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        gstin: formData.get('gstin'),
        pan: formData.get('pan'),
        upiId: formData.get('upiId'),
        bankDetails: {
            accountHolderName: formData.get('bankDetails.accountHolderName'),
            accountNumber: formData.get('bankDetails.accountNumber'),
            bankName: formData.get('bankDetails.bankName'),
            ifscCode: formData.get('bankDetails.ifscCode'),
        }
    };
    
    // Clean up empty bank details
    if (!data.bankDetails.accountHolderName && !data.bankDetails.accountNumber) {
        data.bankDetails = undefined;
    }

    const validatedFields = vendorSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            error: "Validation failed.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const newVendor = await addVendor(validatedFields.data);
        revalidatePath('/erp/vendors');
        return { success: true, data: newVendor };
    } catch (error: any) {
        return { error: `Failed to create vendor: ${error.message}` };
    }
}
