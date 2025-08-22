
import mongoose, { Schema, Document } from 'mongoose';
import { sharedSchema } from './shared.schema';
import { _collections } from '@/lib/constants/collection.constant';

export interface IVisit extends Document {
  patientId: mongoose.Schema.Types.ObjectId;
  clinicId: mongoose.Schema.Types.ObjectId;
  prescriptionId: mongoose.Schema.Types.ObjectId;
}

const VisitSchema: Schema = new Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: true },
  ...sharedSchema
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.models.Visit || mongoose.model<IVisit>('Visit', VisitSchema);
