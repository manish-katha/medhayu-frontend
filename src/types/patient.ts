


export interface PatientData {
  id: string; // Changed to string for MongoDB _id
  userId?: number;
  ouid?: string | null;
  cin?: string | null;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  chiefComplaint?: string;
  medicalHistory?: string;
  lastVisit?: string | null;
  createdBy?: number;
  updatedBy?: number | null;
  deletedBy?: number | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
 
  condition?: string; // Main condition
 
  associatedComplaints?: string;
 
  profilePic?: string;
  trackProgress?: boolean; // New field
}



export interface PatientProfileData {
    patient: PatientData;
    visits: any[];
    invoices: any[];
    labReports: any[];
    caseStudies: any[];
    lifetimeValue: number;
}
