import { connectToDatabase } from "@/lib/db/connection";
import Category from "@/lib/db/models/Category.model";
import ProductForm from "@/components/seller/ProductForm";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { UserRole } from "@/types";

export default async function NewProductPage() {
  const session = await auth();
  if (!session || session.user.role !== UserRole.SELLER) {
    redirect("/login");
  }

  await connectToDatabase();

  const categories = await Category.find({ isActive: true })
    .select("name type parent")
    .sort({ name: 1 })
    .lean();

  // Normalize category object IDs to strings for clientside form
  const serializedCategories = categories.map((cat: any) => ({
    _id: cat._id.toString(),
    name: cat.name,
    type: cat.type,
    parent: cat.parent ? cat.parent.toString() : null,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading">Add New Product</h1>
        <p className="text-muted-foreground text-sm mt-1">
          List your textile machinery or raw materials on the Santechs platform.
        </p>
      </div>

      <ProductForm categories={serializedCategories} />
    </div>
  );
}
