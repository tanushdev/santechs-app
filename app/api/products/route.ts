import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import Category from "@/lib/db/models/Category.model";
import Brand from "@/lib/db/models/Brand.model";
import Company from "@/lib/db/models/Company.model";
import { ProductStatus } from "@/types";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const condition = searchParams.get("condition");
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
    // Base filter
    const filter: Record<string, unknown> = {
      status: statusParam,
    };

    // Text search via Atlas Search (or regex fallback)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { manufacturer: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
      if (isObjectId) {
        filter.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category }).select("_id").lean();
        if (catDoc) {
          filter.category = catDoc._id;
        } else {
          filter.category = "000000000000000000000000";
        }
      }
    }

    if (brand) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(brand);
      if (isObjectId) {
        filter.brand = brand;
      } else {
        const brandDoc = await Brand.findOne({ slug: brand }).select("_id").lean();
        if (brandDoc) {
          filter.brand = brandDoc._id;
        } else {
          filter.brand = "000000000000000000000000";
        }
      }
    }

    if (condition) filter.condition = condition;
    if (country) filter["location.country"] = country;
    if (state) filter["location.state"] = state;
    if (isFeatured === "true") filter.isFeatured = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (filter.price as Record<string, number>).$lte = Number(maxPrice);
    }

    if (yearFrom || yearTo) {
      filter.yearOfManufacture = {};
      if (yearFrom)
        (filter.yearOfManufacture as Record<string, number>).$gte = Number(yearFrom);
      if (yearTo)
        (filter.yearOfManufacture as Record<string, number>).$lte = Number(yearTo);
    }

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
        .populate("brand", "name logo")
        .populate("company", "name slug logo isVerified")
        .sort(finalSort)
        .skip(skip)
        .limit(limit)
        .select("-adminNotes -rejectionReason")
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
