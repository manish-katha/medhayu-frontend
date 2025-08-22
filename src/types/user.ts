
export interface User {
  _id: string; // MongoDB primary key
  uid: string; // Firebase Auth UID
  name: string;
  email: string;
  role: 'doctor' | 'student';
  degree?: string;
  specialization?: string;
  medhayuHandle: string;
  verified: boolean;
}

export interface Clinic {
  _id?: string;
  clinicId?: string; // Made optional as it might not be present on creation from frontend
  clinicName: string;
  location: string;
  doctorId: string; // This links back to the user's _id
  services?: string[];
  cin?: string; // Auto-generated clinic identification number
}
