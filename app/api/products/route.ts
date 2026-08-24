import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import Category from "@/lib/db/models/Category.model";
import Brand from "@/lib/db/models/Brand.model";
import Company from "@/lib/db/models/Company.model";
import { ProductStatus } from "@/types";
import { getCountriesForContinent } from "@/lib/utils/continent";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const brand = searchParams.get("brand");
    const condition = searchParams.get("condition");
    const continent = searchParams.get("continent");
    const country = searchParams.get("country");
    const state = searchParams.get("state");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const yearFrom = searchParams.get("yearFrom");
    const yearTo = searchParams.get("yearTo");
    const isFeatured = searchParams.get("isFeatured");
    const sort = searchParams.get("sort") ?? "newest";
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);

    const statusParam = searchParams.get("status") || ProductStatus.APPROVED;
    const andConditions: any[] = [{ status: statusParam }];

    // Text search via Atlas Search (or regex fallback)
    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
          { manufacturer: { $regex: search, $options: "i" } },
          { model: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (subCategory) {
      const subList = subCategory.split(",").map((s) => s.trim()).filter(Boolean);
      const idsOrSlugs = await Promise.all(
        subList.map(async (item) => {
          if (/^[0-9a-fA-F]{24}$/.test(item)) return item;
          const cat = await Category.findOne({ slug: item }).select("_id").lean();
          return cat ? String(cat._id) : null;
        })
      );
      const validIds = idsOrSlugs.filter(Boolean);
      if (validIds.length > 0) {
        andConditions.push({
          $or: [
            { subCategory: { $in: validIds } },
            { category: { $in: validIds } },
          ],
        });
      }
    } else if (category) {
      const catList = category.split(",").map((s) => s.trim()).filter(Boolean);
      const parentCatIds = await Promise.all(
        catList.map(async (item) => {
          if (/^[0-9a-fA-F]{24}$/.test(item)) return item;
          const cat = await Category.findOne({ slug: item }).select("_id").lean();
          return cat ? String(cat._id) : null;
        })
      );
      const validParentIds = parentCatIds.filter(Boolean);
      if (validParentIds.length > 0) {
        const subCats = await Category.find({ parent: { $in: validParentIds } }).select("_id").lean();
        const subCatIds = subCats.map((sc) => String(sc._id));
        andConditions.push({
          $or: [
            { category: { $in: [...validParentIds, ...subCatIds] } },
            { subCategory: { $in: [...validParentIds, ...subCatIds] } },
          ],
        });
      }
    }

    if (brand) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(brand);
      if (isObjectId) {
        andConditions.push({ brand });
      } else {
        const brandDoc = await Brand.findOne({ slug: brand }).select("_id").lean();
        if (brandDoc) {
          andConditions.push({ brand: brandDoc._id });
        } else {
          andConditions.push({ brand: "000000000000000000000000" });
        }
      }
    }

    if (condition) {
      const condList = condition.split(",").map((c) => c.trim()).filter(Boolean);
      if (condList.length > 0) {
        andConditions.push({ condition: { $in: condList } });
      }
    }

    if (continent && continent !== "ALL") {
      const contList = continent.split(",").map((c) => c.trim()).filter(Boolean);
      const allCountries: RegExp[] = [];
      const contRegexes: RegExp[] = [];

      contList.forEach((cont) => {
        contRegexes.push(new RegExp(`^${cont}$`, "i"));
        const countriesInContinent = getCountriesForContinent(cont);
        countriesInContinent.forEach((c) => allCountries.push(new RegExp(`^${c}$`, "i")));
      });

      andConditions.push({
        $or: [
          { "location.continent": { $in: contRegexes } },
          { "location.country": { $in: allCountries } },
        ],
      });
    } else if (country) {
      andConditions.push({ "location.country": country });
    }

    if (state) andConditions.push({ "location.state": state });
    if (isFeatured === "true") andConditions.push({ isFeatured: true });

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      andConditions.push({ price: priceFilter });
    }

    if (yearFrom || yearTo) {
      const yearFilter: Record<string, number> = {};
      if (yearFrom) yearFilter.$gte = Number(yearFrom);
      if (yearTo) yearFilter.$lte = Number(yearTo);
      andConditions.push({ yearOfManufacture: yearFilter });
    }

    const filter = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    // Sort
    const sortMap: Record<string, Record<string, number>> = {
      newest: { publishedAt: -1 },
      oldest: { publishedAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      views: { views: -1 },
    };

    const sortQuery = sortMap[sort] ?? { publishedAt: -1 };

    // Featured first within sort
    const finalSort: Record<string, 1 | -1> = { isFeatured: -1, ...sortQuery };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug type")
        .populate("subCategory", "name slug")
        .populate("brand", "name logo")
        .populate("company", "name slug logo isVerified")
        .sort(finalSort)
        .skip(skip)
        .limit(limit)
        .select("-adminNotes -rejectionReason")
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          items: products,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
