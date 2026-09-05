import { cache } from "react";
import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import { ProductStatus } from "@/types";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// React cache deduplicates DB queries between generateMetadata and ProductDetailPage
const getCachedProduct = cache(async (slug: string) => {
  await connectToDatabase();
  return Product.findOne({
    slug,
    status: ProductStatus.APPROVED,
  })
    .populate("category", "name slug")
    .populate("company", "name logo establishedYear isVerified")
    .lean();
});

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProduct(slug);

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} — Textile Machinery & Materials`,
    description: (product.description || "").substring(0, 160),
    openGraph: {
      title: product.name,
      description: (product.description || "").substring(0, 160),
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCachedProduct(slug);

  if (!product) {
    notFound();
  }

  // Serialize Document fields for Client Components
  const serializedProduct = JSON.parse(JSON.stringify(product));

  return <ProductDetailClient product={serializedProduct} />;
}
