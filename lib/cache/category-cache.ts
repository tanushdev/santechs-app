// In-Memory RAM Cache Manager for Categories
let categoryCache: {
  tree: { data: any; timestamp: number } | null;
  list: Map<string, { data: any; timestamp: number }>;
} = {
  tree: null,
  list: new Map(),
};

const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function getCategoryTreeCache(): any | null {
  if (categoryCache.tree && Date.now() - categoryCache.tree.timestamp < CACHE_TTL_MS) {
    return categoryCache.tree.data;
  }
  return null;
}

export function setCategoryTreeCache(data: any): void {
  categoryCache.tree = { data, timestamp: Date.now() };
}

export function getCategoryListCache(key: string): any | null {
  const entry = categoryCache.list.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

export function setCategoryListCache(key: string, data: any): void {
  categoryCache.list.set(key, { data, timestamp: Date.now() });
}

export function invalidateCategoryCache(): void {
  categoryCache.tree = null;
  categoryCache.list.clear();
}
