// ============================================================
// ENUMS
// ============================================================

export enum UserRole {
  BUYER = "BUYER",
  SELLER = "SELLER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
}

export enum ProductStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED",
  SOLD = "SOLD",
}

export enum ProductCondition {
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  USED = "USED",
  REFURBISHED = "REFURBISHED",
}

export enum EnquiryStatus {
  NEW = "NEW",
  CONTACTED_BUYER = "CONTACTED_BUYER",
  SELLER_ASSIGNED = "SELLER_ASSIGNED",
  NEGOTIATION = "NEGOTIATION",
  QUOTATION_SENT = "QUOTATION_SENT",
  INSPECTION_SCHEDULED = "INSPECTION_SCHEDULED",
  DEAL_CLOSED = "DEAL_CLOSED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum NotificationType {
  PRODUCT_APPROVED = "PRODUCT_APPROVED",
  PRODUCT_REJECTED = "PRODUCT_REJECTED",
  PRODUCT_SUBMITTED = "PRODUCT_SUBMITTED",
  ENQUIRY_RECEIVED = "ENQUIRY_RECEIVED",
  ENQUIRY_UPDATED = "ENQUIRY_UPDATED",
  SELLER_APPROVED = "SELLER_APPROVED",
  SELLER_REJECTED = "SELLER_REJECTED",
  CONTACT_SHARED = "CONTACT_SHARED",
  MESSAGE_RECEIVED = "MESSAGE_RECEIVED",
  SYSTEM = "SYSTEM",
}

export enum CategoryType {
  MACHINE = "MACHINE",
  RAW_MATERIAL = "RAW_MATERIAL",
  SPARE_PART = "SPARE_PART",
  SERVICE = "SERVICE",
}

// ============================================================
// INTERFACES
// ============================================================

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  emailVerified?: Date;
  company?: string; // ref Company
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompany {
  _id: string;
  owner: string; // ref User
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

export interface IAddress {
  street?: string;
  city: string;
  state: string;
  country: string;
  continent?: string;
  pincode?: string;
}

export interface IDocument {
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  type: CategoryType;
  header?: string; // Level 1 Header (e.g. Non-Woven, Synthetic Filament, Plastic Extrusion, Spare Parts)
  description?: string;
  icon?: string;
  image?: string;
  parent?: string | ICategory; // ref Category
  subcategories?: ICategory[];
  isActive: boolean;
  order: number;
  createdAt: Date;
}

export interface IBrand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface IProduct {
  _id: string;
  referenceNumber: string;
  seller: string; // ref User
  company: string; // ref Company
  name: string;
  slug: string;
  description: string;
  category: string; // ref Category
  subCategory?: string; // ref Category
  brand?: string; // ref Brand
  status: ProductStatus;
  condition: ProductCondition;
  // Machine-specific
  machineType?: string;
  model?: string;
  manufacturer?: string;
  yearOfManufacture?: number;
  productionCapacity?: string;
  numberOfPositions?: number;
  numberOfSpindles?: number;
  // Pricing
  price?: number;
  priceNegotiable: boolean;
  currency: string;
  // Quantity
  quantity: number;
  // Location
  location: IAddress;
  // Media
  images: string[];
  videos: string[];
  brochurePdf?: string;
  // Included
  utilitiesIncluded: boolean;
  accessoriesIncluded: boolean;
  sparePartsIncluded: boolean;
  accessoriesDescription?: string;
  // Services
  installationSupport: boolean;
  commissioningSupport: boolean;
  relocationSupport: boolean;
  dismantlingSupport: boolean;
  inspectionAvailable: boolean;
  // Admin flags
  isFeatured: boolean;
  isVerifiedSeller: boolean;
  rejectionReason?: string;
  adminNotes?: string;
  // Analytics
  views: number;
  enquiryCount: number;
  wishlistCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface IEnquiry {
  _id: string;
  referenceNumber: string;
  product: string; // ref Product
  buyer: string; // ref User
  seller: string; // ref User (current/assigned)
  originalSeller?: string; // ref User (original product lister)
  assignedSeller?: string; // ref User (seller chosen by admin)
  isForwardedToSeller?: boolean;
  status: EnquiryStatus;
  // Buyer info
  buyerName: string;
  buyerCompany: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCountry: string;
  // Requirement
  requirement: string;
  budget?: string;
  timeline?: string;
  quantity?: number;
  // Admin workflow
  assignedTo?: string; // ref User (admin)
  adminNotes?: string;
  buyerContactShared: boolean;
  sellerContactShared: boolean;
  // Timestamps
  contactedBuyerAt?: Date;
  sellerAssignedAt?: Date;
  forwardedAt?: Date;
  dealClosedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  _id: string;
  thread: string; // ref MessageThread
  sender: string; // ref User
  content: string;
  attachments?: string[];
  readAt?: Date;
  createdAt: Date;
}

export interface IMessageThread {
  _id: string;
  enquiry?: string; // ref Enquiry
  participants: string[]; // ref User[]
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
}

export interface INotification {
  _id: string;
  recipient: string; // ref User
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
}

export interface IWishlist {
  _id: string;
  user: string; // ref User
  product: string; // ref Product
  createdAt: Date;
}

export interface IAnalytics {
  _id: string;
  product: string; // ref Product
  date: Date;
  views: number;
  enquiries: number;
  wishlistAdds: number;
  shares: number;
}

export interface IActivityLog {
  _id: string;
  actor: string; // ref User
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ISettings {
  _id: string;
  key: string;
  value: unknown;
  updatedBy: string; // ref User
  updatedAt: Date;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  condition?: ProductCondition;
  country?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  yearFrom?: number;
  yearTo?: number;
  isFeatured?: boolean;
  status?: ProductStatus;
  seller?: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc" | "views";
}

// ============================================================
// FORM TYPES
// ============================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole.BUYER | UserRole.SELLER;
  phone?: string;
}

export interface EnquiryFormData {
  buyerName: string;
  buyerCompany: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCountry: string;
  requirement: string;
  budget?: string;
  timeline?: string;
  quantity?: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  brand?: string;
  condition: ProductCondition;
  machineType?: string;
  model?: string;
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
  tags: string[];
  status: ProductStatus;
}
