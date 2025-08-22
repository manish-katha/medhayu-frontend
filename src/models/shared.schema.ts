
import mongoose from 'mongoose';
import { _collections } from '@/lib/constants/collection.constant';

export const sharedSchema = {
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: _collections.User, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: _collections.User, default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: _collections.User, default: null }
};
