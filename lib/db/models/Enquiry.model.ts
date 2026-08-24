import mongoose, { Schema, Document, Model } from "mongoose";
import { EnquiryStatus } from "@/types";

export interface IEnquiryDocument extends Document {
  referenceNumber: string;
  product: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  originalSeller?: mongoose.Types.ObjectId;
  assignedSeller?: mongoose.Types.ObjectId;
  isForwardedToSeller: boolean;
  status: EnquiryStatus;
  buyerName: string;
  buyerCompany: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCountry: string;
  requirement: string;
  budget?: string;
  timeline?: string;
  quantity?: number;
  assignedTo?: mongoose.Types.ObjectId;
  adminNotes?: string;
  buyerContactShared: boolean;
  sellerContactShared: boolean;
  contactedBuyerAt?: Date;
  sellerAssignedAt?: Date;
  forwardedAt?: Date;
  dealClosedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiryDocument>(
  {
    referenceNumber: { type: String, required: true, unique: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    originalSeller: { type: Schema.Types.ObjectId, ref: "User" },
    assignedSeller: { type: Schema.Types.ObjectId, ref: "User" },
    isForwardedToSeller: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(EnquiryStatus),
      default: EnquiryStatus.NEW,
    },
    buyerName: { type: String, required: true },
    buyerCompany: { type: String, required: true },
    buyerEmail: { type: String, required: true, lowercase: true },
    buyerPhone: { type: String, required: true },
    buyerCountry: { type: String, required: true },
    requirement: { type: String, required: true },
    budget: { type: String },
    timeline: { type: String },
    quantity: { type: Number },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    adminNotes: { type: String },
    buyerContactShared: { type: Boolean, default: false },
    sellerContactShared: { type: Boolean, default: false },
    contactedBuyerAt: { type: Date },
    sellerAssignedAt: { type: Date },
    forwardedAt: { type: Date },
    dealClosedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

(EnquirySchema as any).set("strictPopulate", false);

EnquirySchema.index({ status: 1, createdAt: -1 });
EnquirySchema.index({ buyer: 1, createdAt: -1 });
EnquirySchema.index({ seller: 1, createdAt: -1 });
EnquirySchema.index({ assignedSeller: 1, createdAt: -1 });
EnquirySchema.index({ isForwardedToSeller: 1 });
EnquirySchema.index({ product: 1 });
EnquirySchema.index({ assignedTo: 1 });

if (process.env.NODE_ENV === "development" && mongoose.models?.Enquiry) {
  delete (mongoose.models as any).Enquiry;
}

const Enquiry: Model<IEnquiryDocument> =
  mongoose.models.Enquiry ||
  mongoose.model<IEnquiryDocument>("Enquiry", EnquirySchema);

export default Enquiry;
