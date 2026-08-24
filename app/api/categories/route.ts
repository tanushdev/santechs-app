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
    const now = Date.now();

    // Check Tree Cache
    if (tree === "true" || parent === "root") {
      const cachedTree = !type ? getCategoryTreeCache() : null;
      if (cachedTree) {
        return NextResponse.json(
          { success: true, data: cachedTree },
          { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
        );
      }

      await connectToDatabase();

      const rootFilter: Record<string, unknown> = {
        isActive: true,
        $or: [{ parent: null }, { parent: { $exists: false } }],
      };
      if (type) rootFilter.type = type;

      const [rootCategories, allSubcategories] = await Promise.all([
        Category.find(rootFilter).sort({ order: 1, name: 1 }).lean(),
        Category.find({ isActive: true, parent: { $exists: true, $ne: null } })
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
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
      );
    }

    // Check List Cache
    const cacheKey = `${type || "all"}_${parent || "all"}`;
    const cachedList = getCategoryListCache(cacheKey);
    if (cachedList) {
      return NextResponse.json(
        { success: true, data: cachedList },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
      );
    }

    await connectToDatabase();

    const filter: Record<string, unknown> = { isActive: true };
    if (type) filter.type = type;
    if (parent) filter.parent = parent;

    const categories = await Category.find(filter)
      .populate("parent", "name slug")
      .sort({ order: 1, name: 1 })
      .lean();

    setCategoryListCache(cacheKey, categories);

    return NextResponse.json(
      { success: true, data: categories },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
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
    const { name, slug, type, header, description, parent, icon, image, order } = body;

    let parentCategory: any = null;
    if (parent) {
      parentCategory = await Category.findById(parent);
    }

    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      type: type || parentCategory?.type || "MACHINE",
      header: header || parentCategory?.header || undefined,
      description,
      parent: parent || undefined,
      icon,
      image,
      order: order ?? 0,
      isActive: true,
    });

    invalidateCategoryCache();
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
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
      { returnDocument: 'after' }
    );

    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    invalidateCategoryCache();
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
