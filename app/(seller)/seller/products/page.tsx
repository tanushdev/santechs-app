import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import Category from "@/lib/db/models/Category.model";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Search, Eye, Archive, MessageSquare, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductStatus, UserRole } from "@/types";
import Image from "next/image";
import ProductRowActions from "@/components/seller/ProductRowActions";

export default async function SellerProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== UserRole.SELLER) {
    redirect("/login");
  }

  const { page, status } = await searchParams;
  const currentPage = Number(page ?? 1);
  const selectedStatus = status || "";

  await connectToDatabase();

  const filter: Record<string, any> = { seller: session.user.id };
  if (selectedStatus) {
    filter.status = selectedStatus;
  }

  const limit = 10;
  const skip = (currentPage - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  const startItem = total > 0 ? skip + 1 : 0;
  const endItem = Math.min(skip + limit, total);

  const filterTabs = [
    { label: "All Products", value: "" },
    { label: "Approved (Live)", value: ProductStatus.APPROVED },
    { label: "Pending Review", value: ProductStatus.PENDING },
    { label: "Drafts", value: ProductStatus.DRAFT },
    { label: "Rejected", value: ProductStatus.REJECTED },
    { label: "Archived", value: ProductStatus.ARCHIVED },
  ];

  // Numbered page calculation
  const getPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 sm:p-8 space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#75758a]">
          <Package className="w-4 h-4 text-black" />
          <span>Listing Inventory</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-black">
              My Products
            </h1>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              Publish and manage your industrial machinery and materials catalog listings. Verify status reviews and update specifications.
            </p>
          </div>
          <Link href="/seller/products/new" className="shrink-0 w-full sm:w-auto">
            <Button className="w-full sm:w-auto rounded-full bg-black text-white hover:bg-neutral-800 font-semibold px-6 py-2.5 text-xs uppercase tracking-wider">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs - Responsive Horizontal Scroll */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = selectedStatus === tab.value;
          return (
            <Link
              key={tab.label}
              href={`/seller/products?status=${tab.value}`}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all shrink-0 ${
                isActive
                  ? "bg-black border-black text-white shadow-xs"
                  : "bg-white border-[#e5e7eb] text-slate-600 hover:border-slate-400 hover:text-black"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Total count status bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono border-b border-slate-200 pb-2">
        <span>Showing {startItem}–{endItem} of {total} listings</span>
        {selectedStatus && <span>Filtered by: {selectedStatus}</span>}
      </div>

      {/* Products list */}
      {products.length === 0 ? (
        <div className="text-center py-20 border border-[#e5e7eb] rounded-2xl bg-[#eeece7]/20 p-6">
          <Search className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-black font-sans mb-1">No products found</h3>
          <p className="text-xs text-slate-500 mb-6">
            {selectedStatus
              ? `You don't have any products in ${selectedStatus.toLowerCase()} status.`
              : "Create your first machinery or material listing to get started."}
          </p>
          <Link href="/seller/products/new">
            <Button className="rounded-full bg-black text-white hover:bg-neutral-800 font-semibold px-6 py-2 text-xs uppercase tracking-wider">
              Add New Product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product: any) => (
            <div
              key={product._id.toString()}
              className="bg-white border border-[#e5e7eb] rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-all shadow-xs"
            >
              {/* Product Info Column */}
              <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                <div className="relative w-16 h-16 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 border border-[#e5e7eb] flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-slate-300">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-black truncate tracking-tight">{product.name}</h3>
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                        product.status === ProductStatus.APPROVED ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        product.status === ProductStatus.PENDING ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-100 text-slate-650 border-slate-200"
                      }`}
                    >
                      {product.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>Ref: {product.referenceNumber}</span>
                    <span>•</span>
                    <span>Category: {product.category?.name || "N/A"}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-500 font-semibold">
                    <span className="text-black">
                      {product.price ? `${product.currency === "INR" ? "₹" : product.currency} ${product.price.toLocaleString("en-IN")}` : "Price on Request"}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                      <Eye className="w-3.5 h-3.5" /> {product.views} views
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                      <MessageSquare className="w-3.5 h-3.5" /> {product.enquiryCount || 0} enquiries
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Column */}
              <ProductRowActions
                productId={product._id.toString()}
                status={product.status}
              />
            </div>
          ))}
        </div>
      )}

      {/* Numbered Interactive Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-6">
          <Link
            href={`/seller/products?status=${selectedStatus}&page=${currentPage - 1}`}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              currentPage <= 1
                ? "pointer-events-none opacity-50 bg-white border-[#e5e7eb] text-slate-400"
                : "bg-white border-[#e5e7eb] text-black hover:border-black"
            }`}
          >
            Previous
          </Link>

          {getPages().map((p, idx) =>
            typeof p === "number" ? (
              <Link
                key={idx}
                href={`/seller/products?status=${selectedStatus}&page=${p}`}
                className={`w-8 h-8 rounded-full border text-xs font-semibold flex items-center justify-center transition-all ${
                  p === currentPage
                    ? "bg-black border-black text-white shadow-xs"
                    : "bg-white border-[#e5e7eb] text-slate-700 hover:border-black"
                }`}
              >
                {p}
              </Link>
            ) : (
              <span key={idx} className="px-1 text-xs text-slate-400 font-mono">
                ...
              </span>
            )
          )}

          <Link
            href={`/seller/products?status=${selectedStatus}&page=${currentPage + 1}`}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              currentPage >= totalPages
                ? "pointer-events-none opacity-50 bg-white border-[#e5e7eb] text-slate-400"
                : "bg-white border-[#e5e7eb] text-black hover:border-black"
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
