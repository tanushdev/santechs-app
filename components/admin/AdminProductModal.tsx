"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Trash2,
  Building2,
  Package,
  Upload,
  Search,
  Check,
  Mail,
  UserCheck,
} from "lucide-react";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { ProductCondition, ProductStatus } from "@/types";

import { CONTINENTS } from "@/lib/utils/continent";

interface AdminProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: any | null;
  onSuccess?: () => void;
}

export default function AdminProductModal({
  open,
  onOpenChange,
  productToEdit,
  onSuccess,
}: AdminProductModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!productToEdit;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [sellerId, setSellerId] = useState<string>("");
  const [sellerSearch, setSellerSearch] = useState<string>("");
  const [showSellerSearch, setShowSellerSearch] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [condition, setCondition] = useState<string>(ProductCondition.USED);
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [unit, setUnit] = useState<string>("Unit");
  const [quantity, setQuantity] = useState<string>("1");
  const [status, setStatus] = useState<string>(ProductStatus.APPROVED);
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [continent, setContinent] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  // Query categories with tree structure
  const { data: categories } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: async () => {
      const res = await fetch("/api/categories?tree=true");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const selectedCatObj = (categories ?? []).find(
    (c: any) => c._id === category || c.slug === category
  );
  const availableSubcategories = selectedCatObj?.subcategories ?? [];

  // Query sellers for assignment
  const { data: sellers } = useQuery({
    queryKey: ["admin", "all-sellers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/sellers?status=ALL");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: open,
  });

  // Type-ahead top 3 seller search matches
  const top3Sellers = (sellers ?? [])
    .filter((s: any) => {
      const name = String(s.name ?? "").toLowerCase();
      const email = String(s.email ?? "").toLowerCase();
      const company = String(s.company?.name ?? "").toLowerCase();
      const q = sellerSearch.toLowerCase();
      return name.includes(q) || email.includes(q) || company.includes(q);
    })
    .slice(0, 3);

  // Populate when editing or opening
  useEffect(() => {
    if (productToEdit) {
      setSellerId(productToEdit.seller?._id || productToEdit.seller || "");
      setName(productToEdit.name || "");
      setDescription(productToEdit.description || "");
      setCategory(productToEdit.category?._id || productToEdit.category || "");
      setSubCategory(productToEdit.subCategory?._id || productToEdit.subCategory || "");
      setBrand(productToEdit.brand?._id || productToEdit.brand || "");
      setModel(productToEdit.machineModel || productToEdit.model || "");
      setCondition(productToEdit.condition || ProductCondition.USED);
      setPrice(productToEdit.price !== undefined ? String(productToEdit.price) : "");
      setCurrency(productToEdit.currency || "USD");
      setUnit(productToEdit.unit || "Unit");
      setQuantity(productToEdit.quantity ? String(productToEdit.quantity) : "1");
      setStatus(productToEdit.status || ProductStatus.APPROVED);
      setCity(productToEdit.location?.city || "");
      setState(productToEdit.location?.state || "");
      setCountry(productToEdit.location?.country || "");
      setContinent(productToEdit.location?.continent || "");
      setImages(productToEdit.images || []);
      setShowSellerSearch(false);
    } else {
      setSellerId("");
      setName("");
      setDescription("");
      setCategory(categories?.[0]?._id || "");
      setSubCategory("");
      setBrand("");
      setModel("");
      setCondition(ProductCondition.USED);
      setPrice("");
      setCurrency("USD");
      setUnit("Unit");
      setQuantity("1");
      setStatus(ProductStatus.APPROVED);
      setCity("");
      setState("");
      setCountry("");
      setImages([]);
      setShowSellerSearch(true);
    }
  }, [productToEdit, open, categories]);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleAdminFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }
        return data.url as string;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setError(err?.message || "Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleAddImage = () => {
    if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (description.length < 20) {
      setError("Description must be at least 20 characters long.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (images.length === 0) {
      setError("At least one product image URL is required.");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, any> = {
        name,
        description,
        category,
        subCategory: subCategory || undefined,
        brand: brand || undefined,
        model: model || undefined,
        condition,
        price: price ? parseFloat(price) : 0,
        currency,
        unit: unit || "Unit",
        quantity: parseInt(quantity) || 1,
        location: {
          city: city || "Global",
          state: state || "State",
          country: country || "India",
          continent: continent || undefined,
        },
        images,
        sellerId: sellerId || undefined,
        status,
      };

      const res = isEdit
        ? await updateProduct(productToEdit._id, payload)
        : await createProduct(payload);

      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["admin", "all-products"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "sellers"] });
        onSuccess?.();
        onOpenChange(false);
      } else {
        setError(res.error || "Failed to save product details.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const sellerEmailDisplay = productToEdit?.seller?.email;
  const sellerNameDisplay = productToEdit?.seller?.name;
  const sellerCompanyDisplay = productToEdit?.company?.name || productToEdit?.seller?.company?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] sm:w-full max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-slate-200 shadow-2xl">
        <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-slate-200 shrink-0 bg-slate-50/50">
          <DialogTitle className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <span>{isEdit ? "Edit Product Details" : "Add New Product (Super Admin)"}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {/* Seller Assignment Box */}
          {isEdit && !showSellerSearch ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Mail className="w-4 h-4 text-primary" /> Posted By Seller (Email ID)
                </Label>
                <button
                  type="button"
                  onClick={() => setShowSellerSearch(true)}
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Reassign Seller
                </button>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{sellerEmailDisplay || "Admin Account"}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Owner Name: {sellerNameDisplay || "N/A"}
                    {sellerCompanyDisplay ? ` • Storefront: ${sellerCompanyDisplay}` : ""}
                  </p>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold shrink-0 self-start sm:self-auto">
                  Verified Seller Post
                </Badge>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Building2 className="w-4 h-4 text-primary" /> Assign Seller / Storefront
                </Label>
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => setShowSellerSearch(false)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel Reassign
                  </button>
                )}
              </div>

              {/* Type-Ahead Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={sellerSearch}
                  onChange={(e) => setSellerSearch(e.target.value)}
                  placeholder="Type seller email ID to search ahead (e.g. seller@company.com)..."
                  className="pl-9 text-xs h-9 bg-white border-slate-300 rounded-xl"
                />
              </div>

              {/* Type-Ahead Top 3 Suggested Seller Cards */}
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  {sellerSearch ? `Top 3 Matches for "${sellerSearch}"` : "Suggested Sellers (Type ahead to search)"}
                </p>

                {top3Sellers.length === 0 ? (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                    No matching sellers found for &quot;{sellerSearch}&quot;
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {top3Sellers.map((s: any) => {
                      const isSelected = sellerId === s._id;
                      return (
                        <div
                          key={s._id}
                          onClick={() => setSellerId(s._id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                            isSelected
                              ? "bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-xs"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                          }`}
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 truncate">
                                {s.email}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium truncate">
                                ({s.name})
                              </span>
                            </div>
                            {s.company?.name && (
                              <p className="text-[11px] text-slate-500 font-medium truncate">
                                Storefront: <strong>{s.company.name}</strong>
                              </p>
                            )}
                          </div>

                          {isSelected ? (
                            <Badge className="bg-emerald-600 text-white border-0 text-[10px] font-bold flex items-center gap-1 shrink-0">
                              <Check className="w-3 h-3" /> Selected
                            </Badge>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] font-semibold rounded-lg shrink-0 border-slate-200"
                            >
                              Select
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title, Category & Sub-Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">Product Title *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Barmag DTY Texturizing Machine FK6-1000"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">Category *</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800"
              >
                <option value="">Select Category</option>
                {(categories ?? []).map((cat: any) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">Sub-Category</Label>
              <select
                disabled={availableSubcategories.length === 0}
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 disabled:opacity-50"
              >
                <option value="">
                  {availableSubcategories.length > 0 ? "Select Sub-Category" : "No sub-categories"}
                </option>
                {availableSubcategories.map((sub: any) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price, Currency, Unit & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">
                Price {unit ? `(per ${unit})` : ""}
              </Label>
              <Input
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">Currency</Label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">Unit</Label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800"
              >
                <option value="Kg">Kg (Kilograms)</option>
                <option value="Ton">Ton (Metric Tons)</option>
                <option value="Unit">Unit (Machine / Asset)</option>
                <option value="Set">Set (Complete Line)</option>
                <option value="Piece">Piece (Spare Part)</option>
                <option value="Meter">Meter (Fabric / Yarn)</option>
                <option value="Lot">Lot (Bulk Package)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800"
              >
                <option value={ProductStatus.APPROVED}>APPROVED (Live)</option>
                <option value={ProductStatus.PENDING}>PENDING (Under Review)</option>
                <option value={ProductStatus.REJECTED}>REJECTED</option>
                <option value={ProductStatus.ARCHIVED}>ARCHIVED</option>
              </select>
            </div>
          </div>

          {/* Condition, Model, Inventory / Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">Condition</Label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800"
              >
                <option value={ProductCondition.USED}>USED</option>
                <option value={ProductCondition.REFURBISHED}>REFURBISHED</option>
                <option value={ProductCondition.GOOD}>GOOD</option>
                <option value={ProductCondition.EXCELLENT}>EXCELLENT</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">Model #</Label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. FK6-1000"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">
                Inventory ({unit ? `${unit}s` : "Quantity"})
              </Label>
              <Input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="text-xs font-mono"
                placeholder={unit === "Kg" ? "50000" : "1"}
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">City</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Surat"
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">State</Label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Gujarat"
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">Country</Label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="India"
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800">Continent</Label>
              <select
                value={continent}
                onChange={(e) => setContinent(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800"
              >
                <option value="">Auto-detect or select</option>
                {CONTINENTS.map((cont) => (
                  <option key={cont} value={cont}>
                    {cont}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-slate-800">Product Images *</Label>
              <label className={`inline-flex items-center gap-1 text-xs font-bold text-[#ff7759] hover:underline cursor-pointer ${isUploadingImage ? "opacity-50 pointer-events-none" : ""}`}>
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  disabled={isUploadingImage}
                  accept="image/*"
                  onChange={handleAdminFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)"
                className="text-xs"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddImage}
                className="shrink-0 bg-slate-900 hover:bg-black text-white font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add URL
              </Button>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {images.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={url} alt="Product" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5 pt-1">
            <Label className="font-semibold text-slate-800">Product Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed technical specifications, operating condition, component details, power rating..."
              className="h-28 text-xs leading-relaxed"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-9 text-xs font-bold bg-[#ff7759] hover:bg-[#ff7759]/90 text-white rounded-xl px-5 flex items-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Package className="w-4 h-4" />
              )}
              <span>{isEdit ? "Save Changes" : "Create Product"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
