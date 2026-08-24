"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FolderOpen,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Layers,
  CornerDownRight,
  Search,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const types = [
  { value: "MACHINE", label: "Industrial Machinery" },
  { value: "SPARE_PART", label: "Spare Parts" },
  { value: "RAW_MATERIAL", label: "Raw Materials" },
  { value: "SERVICE", label: "Specialized Services" },
];

const badgeColors: Record<string, string> = {
  MACHINE: "bg-blue-50 text-blue-700 border-blue-200",
  RAW_MATERIAL: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SPARE_PART: "bg-amber-50 text-amber-700 border-amber-200",
  SERVICE: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function CategoriesAdminPage() {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("MACHINE");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Inline subcategory input state keyed by parent category ID
  const [inlineSubInputs, setInlineSubInputs] = useState<Record<string, string>>({});
  const [addingSubForCatId, setAddingSubForCatId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch hierarchical category tree
  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories-tree"],
    queryFn: async () => {
      const res = await fetch("/api/categories?tree=true");
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const handleCreateRootCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmitting(true);

    const generatedSlug = newCatName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          slug: generatedSlug,
          type: newCatType,
        }),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin-categories-tree"] });
        queryClient.invalidateQueries({ queryKey: ["categories-tree"] });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setCreateModalOpen(false);
        setNewCatName("");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to create category");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAddSubCategory = async (parentCat: any) => {
    const subName = (inlineSubInputs[parentCat._id] || "").trim();
    if (!subName) return;

    setAddingSubForCatId(parentCat._id);

    const generatedSlug = subName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subName,
          slug: generatedSlug,
          type: parentCat.type || "MACHINE",
          parent: parentCat._id,
        }),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin-categories-tree"] });
        queryClient.invalidateQueries({ queryKey: ["categories-tree"] });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setInlineSubInputs((prev) => ({ ...prev, [parentCat._id]: "" }));
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to add sub-category");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setAddingSubForCatId(null);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete "${catName}"?`)) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin-categories-tree"] });
        queryClient.invalidateQueries({ queryKey: ["categories-tree"] });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else {
        alert("Failed to delete category");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const allCategories = categories ?? [];

  // Filter root categories
  const filteredCategories = allCategories.filter((cat: any) => {
    const matchesType =
      selectedTypeFilter === "ALL" || cat.type === selectedTypeFilter;
    const matchesSearch =
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.subcategories ?? []).some((sub: any) =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesType && matchesSearch;
  });

  const totalSubcategories = allCategories.reduce(
    (acc: number, cat: any) => acc + (cat.subcategories?.length ?? 0),
    0
  );

  return (
    <div className="space-y-8 max-w-7xl pb-16">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#75758a]">
            <Layers className="w-4 h-4 text-[#ff7759]" />
            <span>Taxonomy Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black font-heading">
            Categories & Sub-Categories
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
            Manage your machinery categories and see all sub-categories directly nested under each category card.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
              Total Catalog
            </span>
            <span className="text-xs font-bold text-slate-900">
              {allCategories.length} Categories • {totalSubcategories} Sub-Categories
            </span>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="rounded-full bg-black text-white hover:bg-neutral-800 font-semibold px-6 py-2.5 text-xs uppercase tracking-wider shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            + Add New Category
          </Button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedTypeFilter === "ALL" ? "default" : "outline"}
            onClick={() => setSelectedTypeFilter("ALL")}
            className={`text-xs font-semibold rounded-full border transition-all ${
              selectedTypeFilter === "ALL"
                ? "bg-black border-black text-white"
                : "bg-transparent border-[#e5e7eb] text-slate-600 hover:border-slate-400 hover:text-black"
            }`}
          >
            All Types ({allCategories.length})
          </Button>
          {types.map((t) => {
            const count = allCategories.filter((c: any) => c.type === t.value).length;
            return (
              <Button
                key={t.value}
                size="sm"
                variant={selectedTypeFilter === t.value ? "default" : "outline"}
                onClick={() => setSelectedTypeFilter(t.value)}
                className={`text-xs font-semibold rounded-full border transition-all ${
                  selectedTypeFilter === t.value
                    ? "bg-black border-black text-white"
                    : "bg-transparent border-[#e5e7eb] text-slate-600 hover:border-slate-400 hover:text-black"
                }`}
              >
                {t.label} ({count})
              </Button>
            );
          })}
        </div>

        <div className="w-full md:w-80">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category or sub-category..."
            className="h-10 rounded-full bg-white border-slate-200 focus-visible:ring-black text-xs"
          />
        </div>
      </div>

      {/* Main Categories & Direct Nested Sub-Categories List */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-400 font-mono text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-black" />
          Loading category hierarchy...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-20 border border-[#e5e7eb] rounded-2xl bg-[#eeece7]/20">
          <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-black font-sans mb-1">
            No Categories Found
          </h3>
          <p className="text-xs text-slate-500">
            No categories match your search filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCategories.map((cat: any) => {
            const badgeStyle =
              badgeColors[cat.type] || "bg-slate-100 text-slate-700 border-slate-200";
            const displayType =
              types.find((t) => t.value === cat.type)?.label || cat.type;
            const subcategories = cat.subcategories ?? [];
            const inlineValue = inlineSubInputs[cat._id] || "";
            const isAddingThisSub = addingSubForCatId === cat._id;

            return (
              <div
                key={cat._id}
                className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all shadow-xs"
              >
                <div className="space-y-4">
                  {/* Category Header Bar */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                          Category
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeStyle}`}
                        >
                          {displayType}
                        </Badge>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 font-heading truncate">
                        {cat.name}
                      </h2>
                      <span className="text-[11px] font-mono text-slate-400">
                        slug: /{cat.slug}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="bg-orange-50 text-[#ff7759] border-orange-200 text-xs font-bold px-2.5 py-1 shrink-0">
                        {subcategories.length} Sub-Categories
                      </Badge>
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        disabled={deletingId === cat._id}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors ml-1"
                        title="Delete Category"
                      >
                        {deletingId === cat._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sub-Categories List Under Category */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-[#ff7759]" />
                        Sub-Categories ({subcategories.length})
                      </span>
                    </div>

                    {subcategories.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {subcategories.map((sub: any) => (
                          <div
                            key={sub._id}
                            className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-3 py-2 flex items-center justify-between gap-2 group hover:bg-orange-50/40 hover:border-orange-200 transition-all"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold text-slate-900 block truncate">
                                {sub.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 truncate block">
                                /{sub.slug}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDelete(sub._id, sub.name)}
                              disabled={deletingId === sub._id}
                              className="text-slate-400 hover:text-red-500 opacity-60 group-hover:opacity-100 transition-all p-1"
                              title="Delete Sub-Category"
                            >
                              {deletingId === sub._id ? (
                                <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                        <p className="text-xs text-slate-500 italic">
                          No sub-categories under this category yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Add Sub-Category Box Right Inside Card */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleQuickAddSubCategory(cat);
                  }}
                  className="pt-3 border-t border-slate-100 flex items-center gap-2"
                >
                  <Input
                    value={inlineValue}
                    onChange={(e) =>
                      setInlineSubInputs((prev) => ({
                        ...prev,
                        [cat._id]: e.target.value,
                      }))
                    }
                    placeholder={`+ Add sub-category under ${cat.name}...`}
                    className="h-9 text-xs rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#ff7759]"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!inlineValue.trim() || isAddingThisSub}
                    className="h-9 px-4 rounded-xl orange-gradient text-white text-xs font-bold shrink-0"
                  >
                    {isAddingThisSub ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Add Sub"
                    )}
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Category Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ff7759]" />
              Add New Category
            </DialogTitle>
            <DialogDescription>
              Create a main machinery or materials category. You can add sub-categories directly under it afterwards.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRootCategory} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Category Name *
              </label>
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Continuous Polymerization, Splitting Machine"
                required
                className="h-10 text-sm focus-visible:ring-[#ff7759] border-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Category Type *
              </label>
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value)}
                className="w-full h-10 text-sm border border-slate-200 rounded-lg px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff7759]/20 focus:border-[#ff7759] transition-all cursor-pointer font-medium"
              >
                {types.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 mt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-5 text-xs font-semibold uppercase hover:bg-slate-50"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full orange-gradient text-white hover:opacity-90 border-0 font-semibold px-6 text-xs uppercase tracking-wider"
                disabled={isSubmitting || !newCatName.trim()}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create Category"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
