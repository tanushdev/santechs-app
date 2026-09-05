"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trash2,
  Loader2,
  Package,
  AlertTriangle,
  Lock,
  Unlock,
} from "lucide-react";

export interface DeleteProductTarget {
  id: string;
  name: string;
  referenceNumber?: string;
  image?: string;
}

interface DeleteProductConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: DeleteProductTarget | null;
  onConfirm: (productId: string) => Promise<void>;
  isDeleting?: boolean;
}

export default function DeleteProductConfirmModal({
  open,
  onOpenChange,
  product,
  onConfirm,
  isDeleting = false,
}: DeleteProductConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setConfirmText("");
      setError(null);
    }
  }, [open]);

  if (!product) return null;

  const isConfirmed = confirmText.trim().toUpperCase() === "DELETE";

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return;
    try {
      setError(null);
      await onConfirm(product.id);
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Failed to delete product. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isDeleting && onOpenChange(val)}>
      <DialogContent className="w-[94vw] sm:w-full max-w-md p-0 overflow-hidden bg-white rounded-2xl border-slate-200 shadow-2xl">
        {/* Header - Matches AdminProductModal */}
        <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-slate-200 shrink-0 bg-slate-50/50">
          <DialogTitle className="text-base sm:text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Delete Product</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            This action cannot be undone. The listing will be permanently removed from the catalog.
          </DialogDescription>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Warning Banner */}
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Permanently deleting this machinery item will immediately delist it from search and buyer enquiries.
            </p>
          </div>

          {/* Product Summary Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3.5">
            <div className="relative w-13 h-13 rounded-lg bg-white overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <Package className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 text-xs truncate">
                {product.name}
              </p>
              {product.referenceNumber && (
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Ref: {product.referenceNumber}
                </p>
              )}
            </div>
          </div>

          {/* Type Confirmation Input */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-slate-900 text-xs">
                Type <span className="font-mono font-bold text-rose-600">DELETE</span> to confirm
              </Label>
              <span className="text-[11px] font-mono font-semibold text-slate-400">
                {isConfirmed ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Required
                  </span>
                )}
              </span>
            </div>

            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Type DELETE"
              disabled={isDeleting}
              autoFocus
              className={`h-10 text-xs font-mono font-bold tracking-wider rounded-xl transition-all ${
                isConfirmed
                  ? "border-rose-500 bg-rose-50/20 text-rose-900 ring-1 ring-rose-400"
                  : "border-slate-200 bg-white text-slate-900 focus:border-slate-400"
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isConfirmed && !isDeleting) {
                  e.preventDefault();
                  handleDelete();
                }
              }}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Footer Actions - Matches Santechs Admin Modals */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="h-9 px-4 text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-100 text-slate-700"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={!isConfirmed || isDeleting}
            onClick={handleDelete}
            className={`h-9 px-4 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              isConfirmed
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer"
                : "bg-slate-200 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed"
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
