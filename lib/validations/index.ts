import { z } from "zod";
import { ProductCondition, UserRole } from "@/types";

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required and must be at least 10 digits"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and a number"
      ),
    confirmPassword: z.string(),
    role: z.enum([UserRole.BUYER, UserRole.SELLER]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must contain uppercase, lowercase, and number"
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ============================================================
// COMPANY SCHEMA
// ============================================================

export const companySchema = z.object({
  name: z.string().min(2, "Company name is required"),
  description: z.string().optional(),
  phone: z.string().min(7, "Valid phone number required"),
  email: z.string().email("Valid company email required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  establishedYear: z
    .number()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  employeeCount: z
    .enum(["1-10", "11-50", "51-200", "201-500", "500+"])
    .optional(),
  turnover: z
    .enum(["Under 1Cr", "1-5Cr", "5-25Cr", "25-100Cr", "100Cr+"])
    .optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    pincode: z.string().optional(),
  }),
});

// ============================================================
// PRODUCT SCHEMA
// ============================================================

export const productSchema = z.object({
  name: z.string().min(5, "Product name must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().optional(),
  brand: z.string().optional(),
  condition: z.nativeEnum(ProductCondition),
  machineType: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  yearOfManufacture: z
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  productionCapacity: z.string().optional(),
  numberOfPositions: z.number().min(1).optional(),
  numberOfSpindles: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  priceNegotiable: z.boolean().default(false),
  currency: z.string().default("USD"),
  quantity: z.number().min(1).default(1),
  location: z.object({
    street: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    continent: z.string().optional(),
    pincode: z.string().optional(),
  }),
  images: z.array(z.string()).min(1, "At least one image is required"),
  videos: z.array(z.string()).optional().default([]),
  brochurePdf: z.string().optional(),
  utilitiesIncluded: z.boolean().default(false),
  accessoriesIncluded: z.boolean().default(false),
  sparePartsIncluded: z.boolean().default(false),
  accessoriesDescription: z.string().optional(),
  installationSupport: z.boolean().default(false),
  commissioningSupport: z.boolean().default(false),
  relocationSupport: z.boolean().default(false),
  dismantlingSupport: z.boolean().default(false),
  inspectionAvailable: z.boolean().default(false),
  tags: z.array(z.string()).optional().default([]),
});

// ============================================================
// ENQUIRY SCHEMA
// ============================================================

export const enquirySchema = z.object({
  buyerName: z.string().min(2, "Name is required"),
  buyerCompany: z.string().min(2, "Company name is required"),
  buyerEmail: z.string().email("Valid email is required"),
  buyerPhone: z.string().min(7, "Valid phone number is required"),
  buyerCountry: z.string().min(1, "Country is required"),
  requirement: z
    .string()
    .min(20, "Please describe your requirement in at least 20 characters"),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  quantity: z.number().min(1).optional(),
});

// ============================================================
// CATEGORY / BRAND SCHEMA (Admin)
// ============================================================

export const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  type: z.enum(["MACHINE", "RAW_MATERIAL", "SPARE_PART", "SERVICE"]),
  description: z.string().optional(),
  parent: z.string().optional(),
  order: z.number().default(0),
});

export const brandSchema = z.object({
  name: z.string().min(2, "Name is required"),
  country: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type CompanyFormValues = z.infer<typeof companySchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
export type EnquiryFormValues = z.infer<typeof enquirySchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
export type BrandFormValues = z.infer<typeof brandSchema>;
