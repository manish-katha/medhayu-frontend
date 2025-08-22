
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addCaseStudy } from '@/services/case-study.service';
import { CaseStudyFormValues, caseStudyFormSchema } from '@/components/CaseStudy/Form/formSchema';
import { PatientData } from '@/types/patient';

export async function createCaseStudy(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; error?: string; fieldErrors?: any }> {
  
  // A better approach is to receive stringified JSON from the client
  const jsonData = formData.get('jsonData') as string;
  if (!jsonData) {
    return { success: false, error: "Missing form data." };
  }
  
  const data: CaseStudyFormValues = JSON.parse(jsonData);

  // Re-validate on the server
  const validatedFields = caseStudyFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Validation failed on the server.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { isPublic, patientDetails, ...restOfData } = validatedFields.data;
  
  let finalPatientDetails = { ...patientDetails };
  
  // Anonymize patient name if shared publicly
  if (isPublic && finalPatientDetails.name) {
    const { name, ...anonymousDetails } = finalPatientDetails;
    finalPatientDetails = anonymousDetails;
  }
  
  const caseStudyData = {
    ...restOfData,
    patientDetails: finalPatientDetails,
    isPublic,
  };


  try {
    const newCaseStudy = await addCaseStudy(caseStudyData);
    revalidatePath('/case-studies');
    if (patientDetails?.id) {
        revalidatePath(`/patients/${patientDetails.id}`);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: `Failed to create case study: ${error.message}` };
  }
}

    
