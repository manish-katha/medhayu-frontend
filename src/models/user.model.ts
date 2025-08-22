
import mongoose, { Schema, Document } from 'mongoose';
import { sharedSchema } from './shared.schema';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firstname: string;
  lastname?: string;
  phone: string;
  email: string;
  password?: string;
  isStudent?: boolean;
  isAuthor?: boolean;
  isSuperadmin?: boolean;
  isBams?: boolean;
  isMdMs?: boolean;
  ugCLgName?: string;
  ugPincode?: string;
  Batch?: string;
  pgClgName?: string;
  pgPinCode?: string;
  specialization?: string;
  isDoctor?: boolean;
  isSpecialist?: boolean;
  isPracticener?: boolean;
  workType?: string;
  futurePlan?: string;
  registerationNo?: string;
  multiclinic?: boolean;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true, select: true },
  isStudent: { type: Boolean, default: false },
  isAuthor: { type: Boolean, default: false },
  isSuperadmin: { type: Boolean, default: false },
  isBams: { type: Boolean, default: false },
  isMdMs: { type: Boolean, default: false },
  ugCLgName: { type: String },
  ugPincode: { type: String },
  Batch: { type: String },
  pgClgName: { type: String },
  pgPinCode: { type: String },
  specialization: { type: String },
  isDoctor: { type: Boolean, default: true },
  isSpecialist: { type: Boolean, default: false },
  isPracticener: { type: Boolean, default: false },
  workType: { type: String },
  futurePlan: { type: String },
  registerationNo: { type: String },
  multiclinic: { type: Boolean, default: false },
  ...sharedSchema,
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

UserSchema.virtual('name').get(function() {
  return `${this.firstname} ${this.lastname || ''}`.trim();
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err: any) {
    return next(err);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
  if (!this.password) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
