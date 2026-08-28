import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Category from "@/lib/db/models/Category.model";
import {
  getCategoryTreeCache,
  setCategoryTreeCache,
  getCategoryListCache,
  setCategoryListCache,
  invalidateCategoryCache,
} from "@/lib/cache/category-cache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const parent = searchParams.get("parent");
    const tree = searchParams.get("tree");
    const noCache = searchParams.get("noCache") === "true";

    // Check Tree Cache
    if (tree === "true" || parent === "root") {
      if (!noCache) {
        const cachedTree = !type ? getCategoryTreeCache() : null;
        if (cachedTree) {
          return NextResponse.json({ success: true, data: cachedTree });
        }
      }

      await connectToDatabase();

      const rootFilter: Record<string, unknown> = {
        isActive: true,
        $or: [{ parent: null }, { parent: { $exists: false } }],
      };
      if (type) rootFilter.type = type;

      const [rootCategories, allSubcategories] = await Promise.all([
        Category.find(rootFilter)
          .select("_id name slug type header description icon order isActive")
          .sort({ order: 1, name: 1 })
          .lean(),
        Category.find({ isActive: true, parent: { $exists: true, $ne: null } })
          .select("_id name slug type header parent icon order isActive")
          .sort({ order: 1, name: 1 })
          .lean(),
      ]);

      const categoriesWithSubs = rootCategories.map((cat: any) => ({
        ...cat,
        subcategories: allSubcategories.filter(
          (sub: any) => String(sub.parent?._id || sub.parent) === String(cat._id)
        ),
      }));

      if (!type) {
        setCategoryTreeCache(categoriesWithSubs);
      }

      return NextResponse.json(
        { success: true, data: categoriesWithSubs },
        { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
      );
    }

    // Check List Cache
    const cacheKey = `${type || "all"}_${parent || "all"}`;
    if (!noCache) {
      const cachedList = getCategoryListCache(cacheKey);
      if (cachedList) {
        return NextResponse.json({ success: true, data: cachedList });
      }
    }

    await connectToDatabase();

    const filter: Record<string, unknown> = { isActive: true };
    if (type) filter.type = type;
    if (parent) filter.parent = parent;

    const categories = await Category.find(filter)
      .select("_id name slug type header parent icon order isActive")
      .populate("parent", "name slug")
      .sort({ order: 1, name: 1 })
      .lean();

    setCategoryListCache(cacheKey, categories);

    return NextResponse.json(
      { success: true, data: categories },
      { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
    );
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, names, slug, type, header, description, parent, icon, image, order } = body;

    // Handle batch subcategories (comma-separated or array)
    const nameList: string[] = Array.isArray(names)
      ? names
      : typeof name === "string" && name.includes(",")
      ? name.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [name].filter(Boolean);

    if (nameList.length === 0) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
    }

    let parentType = type;
    let parentHeader = header;
    if (parent && (!parentType || !parentHeader)) {
      const parentCategory = await Category.findById(parent).select("type header").lean();
      if (parentCategory) {
        if (!parentType) parentType = (parentCategory as any).type;
        if (!parentHeader) parentHeader = (parentCategory as any).header;
      }
    }

    const createdItems: any[] = [];

    for (let i = 0; i < nameList.length; i++) {
      const currentName = nameList[i];
      const currentSlug =
        nameList.length === 1 && slug
          ? slug
          : currentName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

      const category = await Category.create({
        name: currentName,
        slug: currentSlug,
        type: parentType || "MACHINE",
        header: parentHeader || undefined,
        description,
        parent: parent || undefined,
        icon,
        image,
        order: (order ?? 0) + i,
        isActive: true,
      });

      createdItems.push(category);
    }

    invalidateCategoryCache();
    return NextResponse.json(
      {
        success: true,
        data: createdItems.length === 1 ? createdItems[0] : createdItems,
        items: createdItems,
      },
      { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
    );
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing category ID" }, { status: 400 });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { returnDocument: "after" }
    ).select("_id name slug").lean();

    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    invalidateCategoryCache();
    return NextResponse.json(
      { success: true, data: category },
      { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
