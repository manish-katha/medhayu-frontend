
import mongoose, { Schema, Document } from 'mongoose';

export interface ITest extends Document {
  timestamp: Date;
  message: string;
}

const TestSchema: Schema = new Schema({
  timestamp: { type: Date, default: Date.now },
  message: { type: String, required: true },
});

// To prevent model overwrite error in Next.js HMR
export default mongoose.models.Test || mongoose.model<ITest>('Test', TestSchema);
