"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormValues } from "@/lib/validations";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { ProductCondition } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  Loader2,
  ChevronRight,
  Info,
  DollarSign,
  Package,
  Wrench,
  Sparkles,
} from "lucide-react";
import { CONTINENTS } from "@/lib/utils/continent";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
  type: string;
  parent?: any;
}

interface ProductFormProps {
  categories: Category[];
  brands?: { _id: string; name: string }[];
  initialData?: any; // If provided, we are in edit mode
}

export default function ProductForm({ categories, brands = [], initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          category: initialData.category?._id || initialData.category,
          subCategory: initialData.subCategory?._id || initialData.subCategory || "",
          brand: initialData.brand?._id || initialData.brand || "",
          condition: initialData.condition,
          machineType: initialData.machineType || "",
          model: initialData.machineModel || initialData.model || "",
          manufacturer: initialData.manufacturer || "",
          yearOfManufacture: initialData.yearOfManufacture,
          productionCapacity: initialData.productionCapacity || "",
          numberOfPositions: initialData.numberOfPositions,
          numberOfSpindles: initialData.numberOfSpindles,
          price: initialData.price,
          priceNegotiable: initialData.priceNegotiable ?? false,
          currency: initialData.currency ?? "INR",
          unit: initialData.unit ?? "Unit",
          quantity: initialData.quantity ?? 1,
          location: {
            street: initialData.location?.street || "",
            city: initialData.location?.city || "",
            state: initialData.location?.state || "",
            country: initialData.location?.country || "",
            continent: initialData.location?.continent || "",
            pincode: initialData.location?.pincode || "",
          },
          images: initialData.images || [],
          videos: initialData.videos || [],
          brochurePdf: initialData.brochurePdf || "",
          utilitiesIncluded: initialData.utilitiesIncluded ?? false,
          accessoriesIncluded: initialData.accessoriesIncluded ?? false,
          sparePartsIncluded: initialData.sparePartsIncluded ?? false,
          accessoriesDescription: initialData.accessoriesDescription || "",
          installationSupport: initialData.installationSupport ?? false,
          commissioningSupport: initialData.commissioningSupport ?? false,
          relocationSupport: initialData.relocationSupport ?? false,
          dismantlingSupport: initialData.dismantlingSupport ?? false,
          inspectionAvailable: initialData.inspectionAvailable ?? false,
          tags: initialData.tags || [],
        }
      : {
          name: "",
          description: "",
          category: "",
          subCategory: "",
          brand: "",
          condition: ProductCondition.USED,
          machineType: "",
          model: "",
          manufacturer: "",
          yearOfManufacture: undefined,
          productionCapacity: "",
          numberOfPositions: undefined,
          numberOfSpindles: undefined,
          price: undefined,
          currency: "USD",
          unit: "Unit",
          quantity: 1,
          images: [],
          videos: [],
          priceNegotiable: false,
          utilitiesIncluded: false,
          accessoriesIncluded: false,
          sparePartsIncluded: false,
          installationSupport: false,
          commissioningSupport: false,
          relocationSupport: false,
          dismantlingSupport: false,
          inspectionAvailable: false,
          tags: [],
          location: {
            street: "",
            city: "",
            state: "",
            country: "",
            continent: "",
            pincode: "",
          },
        },
  });

  const selectedCategory = watch("category");
  const selectedUnit = watch("unit") || "Unit";
  const selectedCategoryObj = categories.find((c) => String(c._id) === String(selectedCategory));
  const isRawMaterial = selectedCategoryObj?.type === "RAW_MATERIAL";

  const subCategories = categories.filter((c) => {
    const parentId = typeof c.parent === "object" ? c.parent?._id : c.parent;
    return parentId && String(parentId) === String(selectedCategory);
  });
  const rootCategories = categories.filter((c) => !c.parent);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setImages((prev) => {
        const updated = [...prev, ...uploadedUrls];
        setValue("images", updated, { shouldValidate: true });
        return updated;
      });
    } catch (err: any) {
      setError(err?.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setValue("images", updated, { shouldValidate: true });
      return updated;
    });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim().toLowerCase())) {
        const updated = [...tags, newTag.trim().toLowerCase()];
        setTags(updated);
        setValue("tags", updated);
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    setValue("tags", updated);
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = initialData
        ? await updateProduct(initialData._id, data)
        : await createProduct(data);

      if (res.success) {
        router.push("/seller/products");
        router.refresh();
      } else {
        setError(res.error || "An error occurred");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto pb-16 space-y-8">
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-destructive/20 animate-in fade-in-50">
          <Info className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Basic Details */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">Basic Product Information</h2>
              <p className="text-xs text-muted-foreground">General details and listing category</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g. Barmag FK6 DTY Texturizing Machine"
                className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                {...register("category")}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select a category</option>
                {(rootCategories.length > 0 ? rootCategories : categories).map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} ({cat.type})
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCategory">Sub-Category</Label>
              <select
                id="subCategory"
                {...register("subCategory")}
                disabled={subCategories.length === 0}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
              >
                <option value="">
                  {subCategories.length > 0 ? "Select a sub-category (Optional)" : "Select Category first"}
                </option>
                {subCategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <select
                id="condition"
                {...register("condition")}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {Object.values(ProductCondition).map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.condition.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Product Description *</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={5}
                placeholder="Provide a detailed description of the machine status, history, modifications, etc. Minimum 20 characters."
                className={errors.description ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.description.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Technical Specifications */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">Technical Specifications</h2>
              <p className="text-xs text-muted-foreground">Detailed parameters of the machinery</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" {...register("manufacturer")} placeholder="e.g. Barmag" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model / Machine Model</Label>
              <Input id="model" {...register("model")} placeholder="e.g. FK6-1000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearOfManufacture">Year of Manufacture</Label>
              <Input
                id="yearOfManufacture"
                type="number"
                {...register("yearOfManufacture", { valueAsNumber: true })}
                placeholder="e.g. 2018"
              />
              {errors.yearOfManufacture && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.yearOfManufacture.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="productionCapacity">Production Capacity</Label>
              <Input id="productionCapacity" {...register("productionCapacity")} placeholder="e.g. 250 kg/hr" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfPositions">Number of Positions</Label>
              <Input
                id="numberOfPositions"
                type="number"
                {...register("numberOfPositions", { valueAsNumber: true })}
                placeholder="e.g. 24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfSpindles">Number of Spindles</Label>
              <Input
                id="numberOfSpindles"
                type="number"
                {...register("numberOfSpindles", { valueAsNumber: true })}
                placeholder="e.g. 288"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Media Upload */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">Product Images *</h2>
              <p className="text-xs text-muted-foreground">Upload at least one image showing product condition</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((image, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <Image src={image} alt={`Product image ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <label className={`border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 rounded-xl flex flex-col items-center justify-center aspect-square transition-all duration-200 ${isUploadingImage ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                    <span className="text-xs font-semibold text-primary">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary mb-2" />
                    <span className="text-xs font-semibold text-muted-foreground">Upload Photo</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  disabled={isUploadingImage}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            {errors.images && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.images.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4. Pricing & Inventory */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">Pricing & Inventory</h2>
              <p className="text-xs text-muted-foreground">Set product cost and quantity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Price {selectedUnit ? `(per ${selectedUnit})` : "(per Unit)"}
              </Label>
              <Input
                id="price"
                type="number"
                step="any"
                {...register("price", { valueAsNumber: true })}
                placeholder={isRawMaterial || selectedUnit === "Kg" ? "e.g. 110" : "e.g. 85000"}
              />
              {errors.price && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                {...register("currency")}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Price &amp; Inventory Unit</Label>
              <select
                id="unit"
                {...register("unit")}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-semibold text-slate-800 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Available Inventory ({selectedUnit ? `${selectedUnit}s` : "Units"})
              </Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                {...register("quantity", { valueAsNumber: true })}
                placeholder={isRawMaterial || selectedUnit === "Kg" ? "e.g. 50000" : "1"}
              />
            </div>

            <div className="flex items-center space-x-2 sm:col-span-2 lg:col-span-4 pt-2">
              <input
                id="priceNegotiable"
                type="checkbox"
                {...register("priceNegotiable")}
                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
              />
              <Label htmlFor="priceNegotiable" className="text-sm font-medium leading-none cursor-pointer">
                Price is Negotiable / Open to Offers
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Location details */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ChevronRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">Location</h2>
              <p className="text-xs text-muted-foreground">Where the product/machinery is currently located</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="location.street">Street Address</Label>
              <Input id="location.street" {...register("location.street")} placeholder="e.g. 123 Industrial Area" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location.city">City *</Label>
              <Input id="location.city" {...register("location.city")} placeholder="e.g. Surat" />
              {errors.location?.city && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.location.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location.state">State *</Label>
              <Input id="location.state" {...register("location.state")} placeholder="e.g. Gujarat" />
              {errors.location?.state && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.location.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location.country">Country *</Label>
              <Input id="location.country" {...register("location.country")} placeholder="e.g. India" />
              {errors.location?.country && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.location.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location.continent">Continent</Label>
              <select
                id="location.continent"
                {...register("location.continent")}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Auto-detect from country or select</option>
                {CONTINENTS.map((cont) => (
                  <option key={cont} value={cont}>
                    {cont}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location.pincode">Pincode</Label>
              <Input id="location.pincode" {...register("location.pincode")} placeholder="e.g. 395003" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. Included items & Support */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">Add-ons & Service Support</h2>
              <p className="text-xs text-muted-foreground">What services/supports are included with this purchase</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Included Deliverables</p>
              <div className="flex items-center space-x-2">
                <input
                  id="utilitiesIncluded"
                  type="checkbox"
                  {...register("utilitiesIncluded")}
                  className="rounded border-gray-300 text-primary h-4 w-4"
                />
                <Label htmlFor="utilitiesIncluded" className="text-sm cursor-pointer">Utilities Included</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="accessoriesIncluded"
                  type="checkbox"
                  {...register("accessoriesIncluded")}
                  className="rounded border-gray-300 text-primary h-4 w-4"
                />
                <Label htmlFor="accessoriesIncluded" className="text-sm cursor-pointer">Accessories Included</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="sparePartsIncluded"
                  type="checkbox"
                  {...register("sparePartsIncluded")}
                  className="rounded border-gray-300 text-primary h-4 w-4"
                />
                <Label htmlFor="sparePartsIncluded" className="text-sm cursor-pointer">Spare Parts Included</Label>
              </div>

              <div className="pt-2">
                <Label htmlFor="accessoriesDescription">Accessories/Spare parts description</Label>
                <Input
                  id="accessoriesDescription"
                  {...register("accessoriesDescription")}
                  placeholder="e.g. Includes spare motors, godet rolls..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Sellers Support Services</p>
              <div className="flex items-center space-x-2">
                <input
                  id="installationSupport"
                  type="checkbox"
                  {...register("installationSupport")}
                  className="rounded border-gray-300 text-primary h-4 w-4"
                />
                <Label htmlFor="installationSupport" className="text-sm cursor-pointer">Installation Support</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="commissioningSupport"
                  type="checkbox"
                  {...register("commissioningSupport")}
                  className="rounded border-gray-300 text-primary h-4 w-4"
                />
                <Label htmlFor="commissioningSupport" className="text-sm cursor-pointer">Commissioning Support</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="relocationSupport"
                  type="checkbox"
                  {...register("relocationSupport")}
                  className="rounded border-gray-300 text-primary h-4 w-4"
                />
                <Label htmlFor="relocationSupport" className="text-sm cursor-pointer">Relocation Support</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="dismantlingSupport"
                  type="checkbox"
                  {...register("dismantlingSupport")}
                  className="rounded border-gray-300 text-primary h-4 w-4"
                />
                <Label htmlFor="dismantlingSupport" className="text-sm cursor-pointer">Dismantling Support</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="inspectionAvailable"
                  type="checkbox"
                  {...register("inspectionAvailable")}
                  className="rounded border-gray-300 text-primary h-4 w-4"
                />
                <Label htmlFor="inspectionAvailable" className="text-sm cursor-pointer">On-site Inspection Available</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-6 lg:p-8 space-y-4">
          <Label htmlFor="tags-input">Search Tags (Press Enter to add)</Label>
          <Input
            id="tags-input"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag and press Enter"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1 py-1.5 px-3 rounded-full text-xs">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/seller/products")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="orange-gradient text-white border-0 hover:opacity-90 font-semibold"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : initialData ? (
            "Update Product"
          ) : (
            "Submit Product"
          )}
        </Button>
      </div>
    </form>
  );
}
