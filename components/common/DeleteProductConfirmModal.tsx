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
import {
  Trash2,
  Loader2,
  Package,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  AlertOctagon,
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

  const targetWord = "DELETE";
  const normalizedInput = confirmText.trim().toUpperCase();
  const isConfirmed = normalizedInput === targetWord;
  const matchCount = normalizedInput
    .split("")
    .filter((char, i) => char === targetWord[i]).length;

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
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-slate-200/90 shadow-2xl rounded-3xl gap-0">
        {/* Top Header Banner with glowing accent */}
        <div className="relative overflow-hidden bg-gradient-to-b from-rose-50/90 via-red-50/40 to-white px-7 pt-7 pb-5 border-b border-rose-100/60">
          {/* Ambient decorative glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              {/* Layered glowing destructive icon */}
              <div className="w-13 h-13 rounded-2xl bg-rose-100/80 border border-rose-200/90 flex items-center justify-center p-1 shadow-xs">
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
                  <AlertOctagon className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>

              <div>
                <DialogTitle className="text-lg font-black text-slate-900 font-heading tracking-tight">
                  Delete Listing
                </DialogTitle>
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
                  <span>Irreversible Action</span>
                  <span>•</span>
                  <span>Cannot Be Undone</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-slate-100 border border-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <DialogDescription className="text-xs text-slate-600 mt-3 leading-relaxed">
            You are about to permanently purge this machinery listing, specifications, and associated media from the Santechs marketplace database.
          </DialogDescription>
        </div>

        {/* Modal Body */}
        <div className="p-7 space-y-5 bg-white">
          {/* Target Product Summary Box */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-xs">
            <div className="relative w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200/60 shadow-xs">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <Package className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {product.name}
              </p>
              <div className="flex items-center gap-2">
                {product.referenceNumber ? (
                  <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    Ref: {product.referenceNumber}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">
                    Product ID: {product.id.slice(-8)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Type Confirmation Input with real-time unlock indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Type</span>
                <span className="font-mono font-black text-red-600 bg-red-50 border border-red-200/80 px-1.5 py-0.5 rounded text-[11px] tracking-wider">
                  DELETE
                </span>
                <span>to confirm:</span>
              </label>

              {/* Progress Indicator */}
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
                {isConfirmed ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-in fade-in zoom-in-95 duration-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Unlocked
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {matchCount}/6 letters
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="TYPE 'DELETE'"
                disabled={isDeleting}
                autoFocus
                className={`h-11 text-xs font-mono font-black tracking-widest uppercase transition-all duration-200 pr-10 rounded-xl ${
                  isConfirmed
                    ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20 text-red-700"
                    : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-400 text-slate-800"
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isConfirmed && !isDeleting) {
                    e.preventDefault();
                    handleDelete();
                  }
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                {isConfirmed ? (
                  <Unlock className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-300" />
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl font-medium flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 px-7 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="text-xs font-bold h-10 px-5 rounded-xl border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={!isConfirmed || isDeleting}
            onClick={handleDelete}
            className={`text-xs font-bold h-10 px-5 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              isConfirmed
                ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/25 scale-100 hover:scale-[1.01] active:scale-[0.99]"
                : "bg-slate-100 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed"
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Purging Listing...</span>
              </>
            ) : isConfirmed ? (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Type DELETE to Confirm</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
