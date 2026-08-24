import mongoose, { Schema, Document, Model } from "mongoose";
import {
  ProductStatus,
  ProductCondition,
} from "@/types";

interface IAddress {
  street?: string;
  city: string;
  state: string;
  country: string;
  continent?: string;
  pincode?: string;
}

export interface IProductDocument extends Document {
  referenceNumber: string;
  seller: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  subCategory?: mongoose.Types.ObjectId;
  brand?: mongoose.Types.ObjectId;
  status: ProductStatus;
  condition: ProductCondition;
  machineType?: string;
  machineModel?: string;
  manufacturer?: string;
  yearOfManufacture?: number;
  productionCapacity?: string;
  numberOfPositions?: number;
  numberOfSpindles?: number;
  price?: number;
  priceNegotiable: boolean;
  currency: string;
  quantity: number;
  location: IAddress;
  images: string[];
  videos: string[];
  brochurePdf?: string;
  utilitiesIncluded: boolean;
  accessoriesIncluded: boolean;
  sparePartsIncluded: boolean;
  accessoriesDescription?: string;
  installationSupport: boolean;
  commissioningSupport: boolean;
  relocationSupport: boolean;
  dismantlingSupport: boolean;
  inspectionAvailable: boolean;
  isFeatured: boolean;
  isVerifiedSeller: boolean;
  rejectionReason?: string;
  adminNotes?: string;
  views: number;
  enquiryCount: number;
  wishlistCount: number;
  tags: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    continent: { type: String },
    pincode: { type: String },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    referenceNumber: { type: String, required: true, unique: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: Schema.Types.ObjectId, ref: "Category" },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.DRAFT,
    },
    condition: {
      type: String,
      enum: Object.values(ProductCondition),
      required: true,
    },
    machineType: { type: String },
    machineModel: { type: String },
    manufacturer: { type: String },
    yearOfManufacture: { type: Number, min: 1900, max: new Date().getFullYear() },
    productionCapacity: { type: String },
    numberOfPositions: { type: Number },
    numberOfSpindles: { type: Number },
    price: { type: Number, min: 0 },
    priceNegotiable: { type: Boolean, default: false },
    currency: { type: String, default: "USD" },
    quantity: { type: Number, default: 1, min: 1 },
    location: { type: AddressSchema, required: true },
    images: [{ type: String }],
    videos: [{ type: String }],
    brochurePdf: { type: String },
    utilitiesIncluded: { type: Boolean, default: false },
    accessoriesIncluded: { type: Boolean, default: false },
    sparePartsIncluded: { type: Boolean, default: false },
    accessoriesDescription: { type: String },
    installationSupport: { type: Boolean, default: false },
    commissioningSupport: { type: Boolean, default: false },
    relocationSupport: { type: Boolean, default: false },
    dismantlingSupport: { type: Boolean, default: false },
    inspectionAvailable: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isVerifiedSeller: { type: Boolean, default: false },
    rejectionReason: { type: String },
    adminNotes: { type: String },
    views: { type: Number, default: 0 },
    enquiryCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    tags: [{ type: String, lowercase: true }],
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for filtering (100k+ products)
ProductSchema.index({ status: 1, isFeatured: -1, publishedAt: -1 });
ProductSchema.index({ status: 1, category: 1 });
ProductSchema.index({ status: 1, subCategory: 1 });
ProductSchema.index({ status: 1, "location.country": 1 });
ProductSchema.index({ status: 1, "location.continent": 1 });
ProductSchema.index({ status: 1, condition: 1 });
ProductSchema.index({ status: 1, price: 1 });
ProductSchema.index({ seller: 1, status: 1 });
ProductSchema.index({ company: 1 });
ProductSchema.index({ views: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ tags: 1 });

// Atlas Search index (created via Atlas UI or migration script)
// { "mappings": { "dynamic": true, "fields": { "name": [{"type":"string"}], "description": [{"type":"string"}], "tags": [{"type":"string"}] } } }

const Product: Model<IProductDocument> =
  mongoose.models.Product ||
  mongoose.model<IProductDocument>("Product", ProductSchema);

export default Product;
