"use client";

import { use, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  ChevronDown,
  ArrowUp,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/common/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

interface ProductsClientPageProps {
  searchParams: Promise<Record<string, string>>;
}

const conditions = ["EXCELLENT", "GOOD", "USED", "REFURBISHED"];
const sorts = [
  { value: "newest", label: "Newest First" },
  { value: "views", label: "Most Viewed" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function ProductsClientPage({ searchParams }: ProductsClientPageProps) {
  const resolvedParams = use(searchParams);
  const router = useRouter();
  const pathname = usePathname();

  const [localSearch, setLocalSearch] = useState(resolvedParams.search ?? "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);

  // Build query params from URL
  const queryParams = new URLSearchParams(resolvedParams as Record<string, string>);

  const { data, isLoading } = useQuery({
    queryKey: ["products", resolvedParams],
    queryFn: async () => {
      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const json = await res.json();
      return json.data;
    },
  });

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(resolvedParams as Record<string, string>);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset page on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [resolvedParams, pathname, router]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", localSearch || null);
  };

  const handlePageChange = (newPage: number) => {
    updateFilter("page", String(newPage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilters = Object.entries(resolvedParams)
    .filter(([k]) => !["page", "limit", "sort", "isFeatured"].includes(k) && resolvedParams[k])
    .map(([key, value]) => ({ key, value: value as string }));

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const currentPage = Number(resolvedParams.page ?? 1);
  const limit = Number(resolvedParams.limit ?? 12);
  const startItem = total > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, total);

  // Generate numbered page buttons (1 2 3 ... N)
  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

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

    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-10 sm:mt-12">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="rounded-full px-3.5 text-xs font-semibold"
        >
          Previous
        </Button>

        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <Button
              key={idx}
              size="sm"
              variant={p === currentPage ? "default" : "outline"}
              onClick={() => handlePageChange(p)}
              className={`w-8 h-8 rounded-full text-xs font-semibold p-0 ${
                p === currentPage
                  ? "bg-black text-white"
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {p}
            </Button>
          ) : (
            <span key={idx} className="px-1 text-xs text-slate-400 font-mono">
              ...
            </span>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="rounded-full px-3.5 text-xs font-semibold"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top search bar */}
      <div className="bg-white border-b border-border py-6 shadow-xs sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="products-search"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search machines, materials, brands..."
                className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-black"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <Button type="submit" className="h-10 rounded-xl bg-black text-white hover:bg-neutral-800 px-5 text-xs uppercase tracking-wider font-semibold flex-1 sm:flex-initial">
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFilterOpen(!filterOpen)}
                className="h-10 rounded-xl border-slate-200 flex items-center gap-2 px-4 text-xs font-semibold shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {activeFilters.length > 0 && (
                  <Badge className="h-5 min-w-5 px-1 text-[10px] flex items-center justify-center bg-primary text-white border-0">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </div>
          </form>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400 font-mono">Active Filters:</span>
              {activeFilters.map(({ key, value }) => (
                <Badge
                  key={key}
                  variant="outline"
                  className="bg-slate-100 text-slate-800 border-slate-200 text-xs py-1 px-2.5 rounded-full flex items-center gap-1.5"
                >
                  <span className="font-semibold capitalize">{key}:</span> {value}
                  <X
                    className="w-3 h-3 text-slate-400 hover:text-black cursor-pointer"
                    onClick={() => {
                      if (key === "search") setLocalSearch("");
                      updateFilter(key, null);
                    }}
                  />
                </Badge>
              ))}
              <button
                onClick={() => {
                  setLocalSearch("");
                  router.push(pathname);
                }}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 ml-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white border-b border-border shadow-xs"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Condition */}
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                    Condition
                  </label>
                  <select
                    value={resolvedParams.condition ?? ""}
                    onChange={(e) => updateFilter("condition", e.target.value || null)}
                    className="w-full text-xs border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
                  >
                    <option value="">All Conditions</option>
                    {conditions.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0) + c.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                    Min Price (₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    defaultValue={resolvedParams.minPrice ?? ""}
                    onBlur={(e) => updateFilter("minPrice", e.target.value || null)}
                    className="text-xs h-9 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                    Max Price (₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="Any"
                    defaultValue={resolvedParams.maxPrice ?? ""}
                    onBlur={(e) => updateFilter("maxPrice", e.target.value || null)}
                    className="text-xs h-9 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                    Country
                  </label>
                  <Input
                    placeholder="e.g. India"
                    defaultValue={resolvedParams.country ?? ""}
                    onBlur={(e) => updateFilter("country", e.target.value || null)}
                    className="text-xs h-9 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>

                {/* Year from */}
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                    Year From
                  </label>
                  <Input
                    type="number"
                    placeholder="2000"
                    defaultValue={resolvedParams.yearFrom ?? ""}
                    onBlur={(e) => updateFilter("yearFrom", e.target.value || null)}
                    className="text-xs h-9 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>

                {/* Sort */}
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                    Sort By
                  </label>
                  <select
                    value={resolvedParams.sort ?? "newest"}
                    onChange={(e) => updateFilter("sort", e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
                  >
                    {sorts.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
          <div>
            <p className="text-sm text-slate-600">
              {isLoading ? (
                "Loading marketplace listings..."
              ) : (
                <>
                  Showing <span className="font-bold text-slate-900">{startItem}–{endItem}</span> of{" "}
                  <span className="font-bold text-slate-900">{total.toLocaleString()}</span> products
                  {resolvedParams.search && (
                    <> for &quot;<span className="text-primary font-bold">{resolvedParams.search}</span>&quot;</>
                  )}
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 rounded-lg"
              title="Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 rounded-lg"
              title="List View"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No products found</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
              There are no listings matching your current search parameters or active filters.
            </p>
            <Button
              variant="outline"
              className="rounded-full text-xs font-bold uppercase tracking-wider px-6"
              onClick={() => {
                setLocalSearch("");
                router.push(pathname);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <motion.div
            className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}
          >
            {products.map((product: Record<string, unknown>) => (
              <ProductCard
                key={product._id as string}
                product={product}
              />
            ))}
          </motion.div>
        )}

        {/* Interactive Numbered Pagination */}
        {renderPaginationButtons()}
      </div>
    </div>
  );
}
