import { connectToDatabase } from "@/lib/db/connection";
import Category from "@/lib/db/models/Category.model";
import Product from "@/lib/db/models/Product.model";
import ProductForm from "@/components/seller/ProductForm";
import { auth } from "@/lib/auth/config";
import { redirect, notFound } from "next/navigation";
import { UserRole } from "@/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== UserRole.SELLER) {
    redirect("/login");
  }

  const { id } = await params;

  await connectToDatabase();

  const [product, categories] = await Promise.all([
    Product.findById(id).lean(),
    Category.find({ isActive: true }).select("name type parent").sort({ name: 1 }).lean(),
  ]);

  if (!product) {
    notFound();
  }

  // Ensure the seller owns the product
  if (product.seller.toString() !== session.user.id) {
    redirect("/unauthorized");
  }

  // Serialize IDs for React client components
  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedCategories = categories.map((cat: any) => ({
    _id: cat._id.toString(),
    name: cat.name,
    type: cat.type,
    parent: cat.parent ? cat.parent.toString() : null,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading">Edit Product</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Modify your machinery listing or update product specifications.
        </p>
      </div>

      <ProductForm categories={serializedCategories} initialData={serializedProduct} />
    </div>
  );
}
