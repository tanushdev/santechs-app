"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2, Loader2, Package } from "lucide-react";

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
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white border-slate-200 shadow-2xl rounded-2xl">
        {/* Warning Accent Banner */}
        <div className="bg-red-50/80 border-b border-red-100 p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0 text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-base font-bold text-slate-900 font-heading">
              Permanently Delete Product
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 leading-relaxed">
              This action cannot be undone. The product listing and all associated media will be permanently removed.
            </DialogDescription>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Target Product Summary Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="relative w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
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
              <p className="text-xs font-bold text-slate-900 truncate">
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
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              To confirm deletion, type <span className="font-bold font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">DELETE</span> below:
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              disabled={isDeleting}
              autoFocus
              className="h-10 text-xs font-mono font-bold tracking-wider"
              onKeyDown={(e) => {
                if (e.key === "Enter" && isConfirmed && !isDeleting) {
                  e.preventDefault();
                  handleDelete();
                }
              }}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg">
              {error}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <DialogFooter className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="text-xs font-semibold h-9 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!isConfirmed || isDeleting}
            onClick={handleDelete}
            className="text-xs font-bold h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Permanently Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
