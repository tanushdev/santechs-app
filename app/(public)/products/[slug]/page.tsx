import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import { ProductStatus } from "@/types";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const product = await Product.findOne({ slug, status: ProductStatus.APPROVED }).select("name description").lean();

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} — Textile Machinery & Materials`,
    description: product.description.substring(0, 160),
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  await connectToDatabase();

  const product = await Product.findOne({
    slug,
    status: ProductStatus.APPROVED,
  })
    .populate("category", "name slug")
    .populate("company", "name logo establishedYear isVerified")
    .lean();

  if (!product) {
    notFound();
  }

  // Increment views in database (fire & forget style)
  Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } }).exec().catch((err) => {
    console.error("Failed to increment product views:", err);
  });

  // Serialize Document fields for Client Components
  const serializedProduct = JSON.parse(JSON.stringify(product));

  return <ProductDetailClient product={serializedProduct} />;
}
