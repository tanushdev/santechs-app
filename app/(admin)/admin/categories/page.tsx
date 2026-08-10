"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Tag, Loader2, Trash2, ShieldAlert, FolderOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const types = [
  { value: "MACHINE", label: "Industrial Machinery" },
  { value: "RAW_MATERIAL", label: "Raw Materials" },
  { value: "SPARE_PART", label: "Spare Parts & Accessories" },
  { value: "SERVICE", label: "Industrial Services" },
];

const badgeColors: Record<string, string> = {
  MACHINE: "bg-blue-50 text-blue-700 border-blue-200",
  RAW_MATERIAL: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SPARE_PART: "bg-purple-50 text-purple-700 border-purple-200",
  SERVICE: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function CategoriesAdminPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("MACHINE");
  const [description, setDescription] = useState("");
  
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, type, description }),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setOpen(false);
        setName("");
        setSlug("");
        setDescription("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this category? It will no longer show in public menus.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCategories = (categories ?? []).filter((cat: any) => {
    const matchesType = selectedTypeFilter === "ALL" || cat.type === selectedTypeFilter;
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cat.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 sm:p-8 space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#75758a]">
          <Tag className="w-4 h-4 text-black" />
          <span>Taxonomy Controller</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-black">
              Category Management
            </h1>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              Define global machinery, raw materials, and spare parts categories. Additions instantly propagate to public browse pages and search dropdown filters.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="rounded-full bg-black text-white hover:bg-neutral-800 font-semibold px-6 py-2.5 text-xs uppercase tracking-wider shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        
        {/* Type Pills */}
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
            All Types
          </Button>
          {types.map((t) => (
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
              {t.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter categories..."
            className="h-9 rounded-full bg-white border-slate-200 focus-visible:ring-black text-xs"
          />
        </div>

      </div>

      {/* Category Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-400 font-mono text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-black" />
          Loading category database...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-20 border border-[#e5e7eb] rounded-2xl bg-[#eeece7]/20">
          <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-black font-sans mb-1">No Categories Discovered</h3>
          <p className="text-xs text-slate-500">
            No active categories match the selected filtering rules.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat: any) => {
            const badgeStyle = badgeColors[cat.type] || "bg-slate-100 text-slate-700 border-slate-200";
            const displayType = types.find((t) => t.value === cat.type)?.label || cat.type;

            return (
              <div
                key={cat._id.toString()}
                className="bg-white border border-[#e5e7eb] rounded-2xl p-5 flex flex-col justify-between hover:border-slate-350 hover:shadow-xs transition-all space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-500">
                        <Tag className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-900 font-heading truncate">
                        {cat.name}
                      </span>
                    </div>
                    <Badge variant="outline" className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeStyle}`}>
                      {displayType}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 block">
                      slug: {cat.slug}
                    </span>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {cat.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === cat._id.toString()}
                    className="h-8 rounded-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 flex items-center gap-1.5 font-bold"
                    onClick={() => handleDelete(cat._id.toString())}
                  >
                    {deletingId === cat._id.toString() ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" /> Deactivate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category in Santechs global search catalog taxonomy.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Category Name *</label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Laser Cutting Machines"
                required
                className="h-10 text-sm focus-visible:ring-[#ff7759] border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Slug *</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="laser-cutting-machines"
                required
                className="h-10 text-sm focus-visible:ring-[#ff7759] border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Category Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 text-sm border border-slate-200 rounded-lg px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff7759]/20 focus:border-[#ff7759] transition-all cursor-pointer"
              >
                {types.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add brief details about the types of listings in this category..."
                className="min-h-[80px] text-sm resize-none focus-visible:ring-[#ff7759] border-slate-200"
              />
            </div>
            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 mt-2">
              <Button type="button" variant="outline" className="rounded-full px-5 text-xs font-semibold uppercase hover:bg-slate-50" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full orange-gradient text-white hover:opacity-90 border-0 font-semibold px-6 text-xs uppercase tracking-wider" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
