import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBrandDocument extends Document {
  name: string;
  slug: string;
  logo?: string;
  country?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
}

const BrandSchema = new Schema<IBrandDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: { type: String },
    country: { type: String },
    website: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BrandSchema.index({ isActive: 1 });

const Brand: Model<IBrandDocument> =
  mongoose.models.Brand || mongoose.model<IBrandDocument>("Brand", BrandSchema);

export default Brand;
