"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit2, Archive, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { archiveProduct, deleteProduct } from "@/lib/actions/product.actions";
import { ProductStatus } from "@/types";

interface ProductRowActionsProps {
  productId: string;
  status: string;
}

export default function ProductRowActions({ productId, status }: ProductRowActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"archive" | "delete" | null>(null);

  const handleArchive = async () => {
    if (status === ProductStatus.ARCHIVED) return;
    setLoading("archive");
    try {
      const res = await archiveProduct(productId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to archive product");
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this product? This action cannot be undone.")) {
      return;
    }
    setLoading("delete");
    try {
      const res = await deleteProduct(productId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to delete product");
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
      <Link href={`/seller/products/${productId}`}>
        <Button size="sm" variant="outline" className="text-xs h-9 rounded-full border-[#e5e7eb] hover:bg-[#eeece7]/60" disabled={loading !== null}>
          <Edit2 className="w-3 h-3 mr-1.5" /> Edit
        </Button>
      </Link>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="text-slate-500 hover:text-[#ff7759] hover:bg-slate-50 text-xs h-9 rounded-full px-3"
        disabled={status === ProductStatus.ARCHIVED || loading !== null}
        onClick={handleArchive}
      >
        {loading === "archive" ? (
          <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
        ) : (
          <Archive className="w-3 h-3 mr-1.5" />
        )}
        Archive
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-9 rounded-full px-3"
        disabled={loading !== null}
        onClick={handleDelete}
      >
        {loading === "delete" ? (
          <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
        ) : (
          <Trash2 className="w-3 h-3 mr-1.5" />
        )}
        Delete
      </Button>
    </div>
  );
}
