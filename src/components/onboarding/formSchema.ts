
'use client';

import { z } from 'zod';
import { User, GraduationCap, Stethoscope, Building, Briefcase } from 'lucide-react';

// Step 1: Account Info Schema (Common to both)
export const accountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  profilePictureUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

// Step 2 & 3: Schemas specific to roles
export const studentSchema = z.object({
  collegeName: z.string().min(3, 'College name is required.'),
  courseType: z.enum(['BAMS', 'MD_MS', 'PhD']),
  yearOfStudy: z.string().min(1, 'Year of study is required.'),
});

export const clinicSchema = z.object({
  name: z.string().min(2, 'Clinic name is required.'),
  address: z.string().min(5, 'Clinic address is required.'),
});

export const doctorSchema = z.object({
  collegeName: z.string().min(3, 'College name is required.'),
  practitionerId: z.string().min(1, 'Practitioner ID is required.'),
  isPgStudent: z.boolean().default(false),
  specialization: z.string().optional(),
  pgCollegeName: z.string().optional(),
  clinics: z.array(clinicSchema).min(1, 'At least one clinic is required.'),
}).refine(data => {
    if (data.isPgStudent) {
        return !!data.pgCollegeName && data.pgCollegeName.length > 2;
    }
    return true;
}, {
    message: "PG College name is required for PG students.",
    path: ['pgCollegeName'],
});

// Main schema using discriminated union for robust conditional validation
export const onboardingFormSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('student'),
    account: accountSchema,
    student: studentSchema,
    doctor: doctorSchema.optional(),
  }),
  z.object({
    role: z.literal('doctor'),
    account: accountSchema,
    student: studentSchema.optional(),
    doctor: doctorSchema,
  }),
]);


export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;


export const onboardingStepsConfig = {
  student: [
    { id: 'role', label: 'Role', icon: User, fields: ['role'] },
    { id: 'account', label: 'Account', icon: User, fields: ['account'] },
    { id: 'studentDetails', label: 'Education', icon: GraduationCap, fields: ['student'] },
  ],
  doctor: [
    { id: 'role', label: 'Role', icon: Stethoscope, fields: ['role'] },
    { id: 'account', label: 'Account', icon: User, fields: ['account'] },
    { id: 'doctorDetails', label: 'Medical Details', icon: Briefcase, fields: ['doctor.collegeName', 'doctor.practitionerId', 'doctor.isPgStudent', 'doctor.specialization', 'doctor.pgCollegeName'] },
    { id: 'practiceDetails', label: 'Practice', icon: Building, fields: ['doctor.clinics'] },
  ],
};
