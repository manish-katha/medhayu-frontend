
import mongoose, { Schema, Document } from 'mongoose';
import { sharedSchema } from './shared.schema';
import { _collections } from '@/lib/constants/collection.constant';

export interface IClinic extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  practiceCenterType?: string;
  workspaceType?: string;
  practiceCenterName?: string;
  practiceCenterAddress?: string;
  isShared?: boolean;
  sharedClinic?: any[]; // Array of user IDs or other relevant info
}

const ClinicSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  practiceCenterType: {
    type: String,
  },
  workspaceType: {
    type: String,
  },
  practiceCenterName: {
    type: String,
  },
  practiceCenterAddress: {
    type: String,
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  sharedClinic: {
    type: Schema.Types.Mixed, // Can store an array of user IDs or other structures
    default: [],
  },
  ...sharedSchema,
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


export default mongoose.models.Clinic || mongoose.model<IClinic>('Clinic', ClinicSchema);
