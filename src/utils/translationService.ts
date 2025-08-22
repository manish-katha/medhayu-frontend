
export type LanguageCode = 'en' | 'hi' | 'sa' | 'ta' | 'te' | 'ml' | 'kn';

export const languageOptions: { code: LanguageCode; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'sa', name: 'Sanskrit' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'kn', name: 'Kannada' },
];

// Placeholder for a real translation service
export const translate = (text: string, to: LanguageCode): string => {
  if (to === 'en') return text;
  return `[${to}] ${text}`; // Simple mock translation
};

interface Medicine {
  id: number;
  name: string;
  anupaan: string;
  dosage: string;
  timing: string;
}

interface TranslatedPrescription {
  medicines: Medicine[];
  specialInstructions: string;
  dietInstructions: string;
}

// Placeholder for prescription translation
export const translatePrescription = (
  prescription: {
    medicines: Medicine[];
    specialInstructions: string;
    dietInstructions: string;
  },
  to: LanguageCode
): TranslatedPrescription => {
  if (to === 'en') return prescription;
  return {
    medicines: prescription.medicines.map(med => ({
      ...med,
      name: translate(med.name, to),
      anupaan: translate(med.anupaan, to),
      timing: translate(med.timing, to),
    })),
    specialInstructions: translate(prescription.specialInstructions, to),
    dietInstructions: translate(prescription.dietInstructions, to),
  };
};
