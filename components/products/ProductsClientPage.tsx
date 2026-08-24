"use client";

import { use, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  Globe,
  Layers,
  Filter,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
  PackageX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/common/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { CONTINENTS } from "@/lib/utils/continent";

interface ProductsClientPageProps {
  searchParams: Promise<Record<string, string>>;
}

const conditions = [
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "USED", label: "Used" },
  { value: "REFURBISHED", label: "Refurbished" },
];

const sorts = [
  { value: "newest", label: "Newest First" },
  { value: "views", label: "Most Viewed" },
];

export default function ProductsClientPage({ searchParams }: ProductsClientPageProps) {
  const resolvedParams = use(searchParams);
  const router = useRouter();
  const pathname = usePathname();

  const [localSearch, setLocalSearch] = useState(resolvedParams.search ?? "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Left Sidebar Open/Close toggles
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Active filter values (arrays for multi-select)
  const selectedCategories = (resolvedParams.category ?? "").split(",").filter(Boolean);
  const selectedSubcategories = (resolvedParams.subCategory ?? "").split(",").filter(Boolean);
  const selectedContinents = (resolvedParams.continent ?? "").split(",").filter(Boolean);
  const selectedConditions = (resolvedParams.condition ?? "").split(",").filter(Boolean);
  const selectedType = resolvedParams.type ?? "";

  // Fetch category tree
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: async () => {
      const res = await fetch("/api/categories?tree=true");
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const categories = categoriesData ?? [];

  // Build query params from URL for products query
  const queryParams = new URLSearchParams(resolvedParams as Record<string, string>);

  const { data, isLoading } = useQuery({
    queryKey: ["products", resolvedParams],
    queryFn: async () => {
      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const json = await res.json();
      return json.data;
    },
  });

  // Toggle multi-select values (checkbox handler)
  const toggleMultiFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(resolvedParams as Record<string, string>);
      const currentValues = (resolvedParams[key] ?? "").split(",").filter(Boolean);
      let updatedValues: string[];

      if (currentValues.includes(value)) {
        updatedValues = currentValues.filter((v) => v !== value);
      } else {
        updatedValues = [...currentValues, value];
      }

      if (updatedValues.length > 0) {
        params.set(key, updatedValues.join(","));
      } else {
        params.delete(key);
      }

      params.delete("page"); // reset page on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [resolvedParams, pathname, router]
  );

  const updateSingleFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(resolvedParams as Record<string, string>);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [resolvedParams, pathname, router]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSingleFilter("search", localSearch || null);
  };

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: prev[catId] === undefined ? false : !prev[catId],
    }));
  };

  const activeFiltersCount = Object.entries(resolvedParams).filter(
    ([k]) => !["page", "limit", "sort", "isFeatured"].includes(k) && resolvedParams[k]
  ).length;

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const currentPage = Number(resolvedParams.page ?? 1);

  // Left Sidebar Content Component
  const SidebarFilters = (
    <div className="space-y-6 text-slate-800">
      {/* Header with Close option */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 className="font-bold font-heading text-sm text-slate-900 flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" /> Filter Machinery
        </h3>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={() => router.push(pathname)}
              className="text-xs font-bold text-destructive hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
          <button
            onClick={() => setDesktopSidebarOpen(false)}
            className="hidden lg:flex p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Categories & Nested Sub-Categories Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-700" /> Categories & Sub-Categories
          </h4>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => updateSingleFilter("category", null)}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              ← View All
            </button>
          )}
        </div>

        <div className="space-y-4">
          {(() => {
            let filteredCats = categories;
            if (selectedType) {
              filteredCats = filteredCats.filter((c: any) => c.type === selectedType);
            }
            const displayCats = selectedCategories.length > 0
              ? filteredCats.filter((c: any) =>
                  selectedCategories.some(
                    (param) =>
                      param.toLowerCase() === c.slug?.toLowerCase() ||
                      param === String(c._id)
                  )
                )
              : filteredCats;

            const catsToRender = displayCats.length > 0 ? displayCats : filteredCats;

            return catsToRender.map((cat: any) => {
              const subcats = cat.subcategories ?? [];
              const itemsToRender = subcats.length > 0 ? subcats : [cat];
              const isExpanded = expandedCategories[cat._id] ?? true;

              return (
                <div key={cat._id} className="space-y-2 pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  {/* Category Title & Expand Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 font-heading tracking-tight flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff7759]" />
                      {cat.name}
                    </span>
                    {subcats.length > 0 && (
                      <button
                        onClick={() => toggleCategoryExpand(cat._id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Sub-Category Checkboxes List */}
                  {isExpanded && (
                    <div className="pl-3 space-y-1.5 border-l-2 border-slate-100 ml-1">
                      {itemsToRender.map((sub: any) => {
                        const isSubSelected =
                          selectedSubcategories.includes(sub.slug) ||
                          selectedSubcategories.includes(sub._id) ||
                          selectedCategories.includes(sub.slug) ||
                          selectedCategories.includes(sub._id);

                        const filterKey = sub.parent ? "subCategory" : "category";

                        return (
                          <label
                            key={sub._id}
                            className={`flex items-center gap-2 text-xs font-medium cursor-pointer p-1.5 rounded-lg transition-all select-none ${
                              isSubSelected
                                ? "bg-orange-50 text-[#ff7759] font-bold"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSubSelected}
                              onChange={() => toggleMultiFilter(filterKey, sub.slug || sub._id)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-[#ff7759] focus:ring-[#ff7759] cursor-pointer"
                            />
                            <span className="truncate">{sub.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* 2. Continents Filter (Checkboxes) */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-slate-700" /> Continent
        </h4>
        <div className="space-y-1.5">
          {CONTINENTS.map((cont) => {
            const isSelected = selectedContinents.includes(cont);
            return (
              <label
                key={cont}
                className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer p-1 rounded-md hover:bg-slate-50 transition-colors select-none"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleMultiFilter("continent", cont)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-black focus:ring-black cursor-pointer"
                />
                <span>{cont}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Condition Filter (Checkboxes) */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Condition</h4>
        <div className="space-y-1.5">
          {conditions.map((c) => {
            const isSelected = selectedConditions.includes(c.value);
            return (
              <label
                key={c.value}
                className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer p-1 rounded-md hover:bg-slate-50 transition-colors select-none"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleMultiFilter("condition", c.value)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-black focus:ring-black cursor-pointer"
                />
                <span>{c.label}</span>
              </label>
            );
          })}
        </div>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Search Bar & Controls Header (Static, does not follow on scroll) */}
      <div className="bg-white border-b border-slate-200 py-4 shadow-xs">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
            
            {/* Left Side: Visible Filter Toggle Button + Search Bar */}
            <div className="flex items-center gap-3 w-full md:max-w-3xl">
              {/* Visible Left Filter Toggle Button */}
              <Button
                type="button"
                variant={desktopSidebarOpen ? "default" : "outline"}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setMobileFilterOpen(true);
                  } else {
                    setDesktopSidebarOpen(!desktopSidebarOpen);
                  }
                }}
                className={`flex items-center gap-2 font-bold h-10 px-4 rounded-xl text-xs shrink-0 transition-all ${
                  desktopSidebarOpen
                    ? "bg-slate-900 text-white hover:bg-black"
                    : "bg-white text-slate-900 border-slate-300 hover:bg-slate-100"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 text-[#ff7759]" />
                <span>{desktopSidebarOpen ? "Filter" : "Open Filters"}</span>
                {activeFiltersCount > 0 && (
                  <Badge className="h-5 w-5 p-0 text-[10px] flex items-center justify-center bg-[#ff7759] text-white rounded-full">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* Search Bar Input */}
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="products-search"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Search machinery by name, DTY, FDY, POY, brand..."
                    className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs focus:bg-white"
                  />
                </div>
                <Button type="submit" className="bg-[#ff7759] hover:bg-[#ff7759]/90 text-white font-bold h-10 px-4 rounded-xl text-xs shrink-0">
                  Search
                </Button>
              </form>
            </div>

            {/* Right Side: Sort & View Mode Toggle */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Sort:</span>
                <select
                  value={resolvedParams.sort ?? "newest"}
                  onChange={(e) => updateSingleFilter("sort", e.target.value)}
                  className="text-xs font-bold border border-slate-200 rounded-xl bg-white px-3 py-2 text-slate-800 focus:outline-none shadow-xs cursor-pointer"
                >
                  {sorts.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Catalog CSV */}
              <a href="/api/admin/products/export" download>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-100/70 text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
              </a>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Type Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 no-scrollbar">
            {[
              { label: "All Inventory", value: null },
              { label: "Machines", value: "MACHINE" },
              { label: "Spare Parts", value: "SPARE_PART" },
              { label: "Raw Materials", value: "RAW_MATERIAL" },
              { label: "Services", value: "SERVICE" },
            ].map((tab) => {
              const isSelected = (!selectedType && tab.value === null) || selectedType === tab.value;
              return (
                <button
                  key={tab.label}
                  onClick={() => updateSingleFilter("type", tab.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid + Left Sidebar Layout */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">
          {/* Left Desktop Collapsible Sidebar (Static layout, stays at top, does not float down on scroll) */}
          {desktopSidebarOpen && (
            <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              {SidebarFilters}
            </aside>
          )}

          {/* Mobile Drawer Overlay */}
          <AnimatePresence>
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileFilterOpen(false)}
                  className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                />
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 250 }}
                  className="relative z-50 w-80 bg-white h-full p-6 overflow-y-auto shadow-2xl"
                >
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                    <h3 className="font-bold text-base text-slate-900">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={() => setMobileFilterOpen(false)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  {SidebarFilters}
                </motion.aside>
              </div>
            )}
          </AnimatePresence>

          {/* Right Product Grid */}
          <main className="flex-1 min-w-0">
            {/* Header stats */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-xl font-bold font-heading text-slate-900">
                  {selectedType === "RAW_MATERIAL"
                    ? "Raw Materials Exchange"
                    : selectedType === "SERVICE"
                    ? "Industrial Technical Services"
                    : selectedType === "SPARE_PART"
                    ? "Machinery Spare Parts & Components"
                    : selectedType === "MACHINE"
                    ? "Industrial Machinery Catalog"
                    : "Industrial Machinery & Materials Catalog"}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Showing {products.length} of {total} verified listings
                </p>
              </div>

              {!desktopSidebarOpen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDesktopSidebarOpen(true)}
                  className="hidden lg:flex items-center gap-1.5 text-xs font-bold rounded-xl border-slate-200"
                >
                  <PanelLeftOpen className="w-4 h-4 text-[#ff7759]" /> Show Filters
                </Button>
              )}
            </div>

            {/* Loading / Empty / Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8 max-w-lg mx-auto space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <PackageX className="w-7 h-7 stroke-[1.5]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-lg text-slate-900 font-heading">
                    {selectedType === "RAW_MATERIAL"
                      ? "No Raw Materials Currently Listed"
                      : selectedType === "SERVICE"
                      ? "No Services Currently Listed"
                      : selectedType === "SPARE_PART"
                      ? "No Spare Parts Found"
                      : "No Matching Machinery Found"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    {selectedType === "RAW_MATERIAL"
                      ? "There are currently no active raw material lots in this section. Verified polymer & feedstock suppliers onboard inventory regularly. You can submit a custom sourcing RFQ to our procurement desk."
                      : selectedType === "SERVICE"
                      ? "There are currently no engineering service providers listed in this category. Contact our technical desk to request erection, dismantling, or plant relocation support."
                      : selectedType === "SPARE_PART"
                      ? "No precision spare parts match your selected filters. Try broadening your criteria or submit a part RFQ."
                      : "No machinery listings match your active filters. Try clearing specific category or continent selections."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link href="/sell">
                    <Button size="sm" className="bg-[#ff7759] hover:bg-[#ff7759]/90 text-white font-bold rounded-xl text-xs h-9 px-4 cursor-pointer">
                      Submit Sourcing Request / RFQ
                    </Button>
                  </Link>
                  {(activeFiltersCount > 0 || selectedType) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(pathname)}
                      className="rounded-xl text-xs font-bold border-slate-200 h-9 px-4 cursor-pointer"
                    >
                      View All Inventory
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? desktopSidebarOpen
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => updateSingleFilter("page", String(currentPage - 1))}
                  className="rounded-xl text-xs font-semibold"
                >
                  Previous
                </Button>
                <span className="text-xs font-mono font-bold text-slate-600 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => updateSingleFilter("page", String(currentPage + 1))}
                  className="rounded-xl text-xs font-semibold"
                >
                  Next
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
