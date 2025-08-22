
import mongoose, { Schema, Document } from 'mongoose';
import { sharedSchema } from './shared.schema';
import { _collections } from '@/lib/constants/collection.constant';

export interface IMedicine {
  name: string;
  dosage: string;
  timing: string;
  anupaan: string;
  customTiming?: string;
  customAnupaan?: string;
}

export interface IPrescription extends Document {
  patientId: mongoose.Schema.Types.ObjectId;
  clinicId: mongoose.Schema.Types.ObjectId;
  medicines: IMedicine[];
  diagnosticTests: string[];
  specialInstructions?: string;
  dietInstructions?: string;
  nextVisitDate?: Date;
  trackProgress?: boolean;
}

const MedicineSchema: Schema = new Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  timing: { type: String, required: true },
  anupaan: { type: String, required: true },
  customTiming: { type: String },
  customAnupaan: { type: String },
}, { _id: false });

const PrescriptionSchema: Schema = new Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  medicines: [MedicineSchema],
  diagnosticTests: [String],
  specialInstructions: String,
  dietInstructions: String,
  nextVisitDate: Date,
  trackProgress: { type: Boolean, default: false },
  ...sharedSchema
}, { timestamps: true });

export default mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
