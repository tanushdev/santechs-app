import mongoose, { Schema, Document, Model } from "mongoose";

interface IAddress {
  street?: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
}

interface IDocument {
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

export interface ICompanyDocument extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  phone: string;
  email: string;
  address: IAddress;
  gstNumber?: string;
  panNumber?: string;
  establishedYear?: number;
  employeeCount?: string;
  turnover?: string;
  isVerified: boolean;
  isApproved: boolean;
  rejectionReason?: string;
  documents: IDocument[];
  subscriptionTier: "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
  subscriptionExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String },
  },
  { _id: false }
);

const DocumentSchema = new Schema<IDocument>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CompanySchema = new Schema<ICompanyDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    logo: { type: String },
    website: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    address: { type: AddressSchema, required: true },
    gstNumber: { type: String },
    panNumber: { type: String },
    establishedYear: { type: Number },
    employeeCount: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
    },
    turnover: {
      type: String,
      enum: [
        "Under 1Cr",
        "1-5Cr",
        "5-25Cr",
        "25-100Cr",
        "100Cr+",
      ],
    },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    rejectionReason: { type: String },
    documents: [DocumentSchema],
    subscriptionTier: {
      type: String,
      enum: ["FREE", "BASIC", "PRO", "ENTERPRISE"],
      default: "FREE",
    },
    subscriptionExpiry: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
CompanySchema.index({ isApproved: 1 });
CompanySchema.index({ isVerified: 1 });
CompanySchema.index({ "address.country": 1 });
CompanySchema.index({ createdAt: -1 });

const Company: Model<ICompanyDocument> =
  mongoose.models.Company ||
  mongoose.model<ICompanyDocument>("Company", CompanySchema);

export default Company;
