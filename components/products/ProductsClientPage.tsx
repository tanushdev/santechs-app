"use client";

import { use, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown } from "lucide-react";
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

  const activeFilters = Object.entries(resolvedParams)
    .filter(([k]) => !["page", "limit", "sort", "isFeatured"].includes(k) && resolvedParams[k])
    .map(([key, value]) => ({ key, value: value as string }));

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const currentPage = Number(resolvedParams.page ?? 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Top search bar */}
      <div className="bg-muted/30 border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="products-search"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search machines, materials, brands..."
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilters.length > 0 && (
                <Badge className="h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </form>

          {/* Active filters removed */}
        </div>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-card border-b border-border"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Condition */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Condition
                  </label>
                  <select
                    value={resolvedParams.condition ?? ""}
                    onChange={(e) => updateFilter("condition", e.target.value || null)}
                    className="w-full text-sm border border-input rounded-md bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">All</option>
                    {conditions.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0) + c.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                 {/* Min Price */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Min Price (₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    defaultValue={resolvedParams.minPrice ?? ""}
                    onBlur={(e) => updateFilter("minPrice", e.target.value || null)}
                    className="text-sm h-8"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Max Price (₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="Any"
                    defaultValue={resolvedParams.maxPrice ?? ""}
                    onBlur={(e) => updateFilter("maxPrice", e.target.value || null)}
                    className="text-sm h-8"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Country
                  </label>
                  <Input
                    placeholder="e.g. India"
                    defaultValue={resolvedParams.country ?? ""}
                    onBlur={(e) => updateFilter("country", e.target.value || null)}
                    className="text-sm h-8"
                  />
                </div>

                {/* Year from */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Year From
                  </label>
                  <Input
                    type="number"
                    placeholder="2000"
                    defaultValue={resolvedParams.yearFrom ?? ""}
                    onBlur={(e) => updateFilter("yearFrom", e.target.value || null)}
                    className="text-sm h-8"
                  />
                </div>

                {/* Sort */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Sort By
                  </label>
                  <select
                    value={resolvedParams.sort ?? "newest"}
                    onChange={(e) => updateFilter("sort", e.target.value)}
                    className="w-full text-sm border border-input rounded-md bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
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
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : (
              <>
                <span className="font-semibold text-foreground">{total.toLocaleString()}</span>{" "}
                products found
                {resolvedParams.search && (
                  <> for &quot;<span className="text-primary">{resolvedParams.search}</span>&quot;</>
                )}
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-8 w-8"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden">
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
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters
            </p>
            <Button variant="outline" onClick={() => router.push(pathname)}>
              Clear Filters
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => updateFilter("page", String(currentPage - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-3">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => updateFilter("page", String(currentPage + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
