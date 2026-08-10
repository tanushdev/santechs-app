import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole, UserStatus } from "@/types";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  emailVerified?: Date;
  company?: mongoose.Types.ObjectId;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  emailVerificationToken?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.BUYER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    emailVerified: { type: Date },
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiry: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ email: 1, role: 1 }, { unique: true });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ company: 1 });
UserSchema.index({ createdAt: -1 });

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
