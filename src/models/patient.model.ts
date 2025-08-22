
import mongoose, { Schema, Document } from 'mongoose';
import type { PatientData } from '@/types/patient';
import { sharedSchema } from './shared.schema';

// Extending the Mongoose Document with our PatientData interface
export interface IPatient extends PatientData, Document {
  id: any; // Mongoose uses `_id`, but our type uses `id`. We'll handle this.
}

const PatientSchema: Schema = new Schema({
  userId: { type: Number },
  ouid: { type: String },
  cin: { type: String },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic' }, // Added clinicId reference
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  chiefComplaint: { type: String },
  medicalHistory: { type: String },
  lastVisit: { type: Date },
  condition: { type: String },
  associatedComplaints: { type: String },
  profilePic: { type: String },
  ...sharedSchema
}, { 
  timestamps: true,
  // This virtual 'id' field gets the a string version of the _id
  toJSON: {
      virtuals: true,
      transform(doc, ret) {
          ret.id = ret._id.toString();
          delete ret._id;
          delete ret.__v;
      }
  }
});

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
