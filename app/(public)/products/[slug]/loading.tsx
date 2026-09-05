import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#faf9f6] pb-24">
      {/* Breadcrumb Skeleton */}
      <div className="bg-white border-b border-border/40 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <span className="text-muted-foreground/30">/</span>
          <Skeleton className="h-4 w-24" />
          <span className="text-muted-foreground/30">/</span>
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery Skeleton */}
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="w-full aspect-[4/3] rounded-3xl" />
            <div className="flex gap-3">
              <Skeleton className="w-20 h-20 rounded-2xl" />
              <Skeleton className="w-20 h-20 rounded-2xl" />
              <Skeleton className="w-20 h-20 rounded-2xl" />
            </div>
          </div>

          {/* Right Column: Key Details & Actions Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-9 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>

            <div className="p-6 bg-white rounded-3xl border border-border/60 space-y-4 shadow-sm">
              <Skeleton className="h-10 w-48" />
              <div className="h-px bg-border/40" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-full" />
            </div>

            {/* Seller info skeleton */}
            <div className="p-6 bg-white rounded-3xl border border-border/60 space-y-3 shadow-sm">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
