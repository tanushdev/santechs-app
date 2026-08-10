import mongoose, { Schema, Document, Model } from "mongoose";
import { CategoryType } from "@/types";

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  type: CategoryType;
  description?: string;
  icon?: string;
  image?: string;
  parent?: mongoose.Types.ObjectId;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: {
      type: String,
      enum: Object.values(CategoryType),
      required: true,
    },
    description: { type: String },
    icon: { type: String },
    image: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: "Category" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

CategorySchema.index({ type: 1, isActive: 1, order: 1 });
CategorySchema.index({ parent: 1 });

const Category: Model<ICategoryDocument> =
  mongoose.models.Category ||
  mongoose.model<ICategoryDocument>("Category", CategorySchema);

export default Category;
