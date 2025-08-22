


import type { CaseStudyFormValues } from "@/components/CaseStudy/Form/formSchema";
import type { InvoiceItem } from "./erp";
import type { ExtractedLabData } from "@/ai/flows/extract-lab-report-data";

export interface PatientData {
  id: string; // Changed to string for MongoDB _id
  oid?: string | null;
  cin?: string | null;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  condition?: string;
  chiefComplaint?: string;
  associatedComplaints?: string;
  lastVisit?: string;
  profilePic?: string;
  createdAt?: string;
}

export interface Visit {
  id: number;
  patientId: number;
  date: string;
  doctor: string;
  complaint: string;
  diagnosis: string;
  prescriptionId: string;
  trackProgress?: boolean;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    patientId: number;
    date: string;
    items: InvoiceItem[];
    subtotal: number;
    totalAmount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
}

export interface LabTestResult {
    testName: string;
    value: string;
    unit: string;
    referenceRange: string;
}

export interface LabReport {
  id: number;
  patientId: number;
  date: string;
  name: string;
  fileUrl?: string;
  results?: LabTestResult[];
  summary?: string; // Add summary field for narrative reports
}

// Use the detailed form values type for case studies to ensure all fields are available
export interface CaseStudy extends CaseStudyFormValues {
  id: string;
  date: string;
}


export interface PatientProfileData {
  patient: PatientData;
  visits: Visit[];
  invoices: Invoice[];
  labReports: LabReport[];
  caseStudies: CaseStudy[];
  lifetimeValue: number;
}
