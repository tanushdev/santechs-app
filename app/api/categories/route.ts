import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Category from "@/lib/db/models/Category.model";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const parent = searchParams.get("parent");

    const filter: Record<string, unknown> = { isActive: true };
    if (type) filter.type = type;
    if (parent === "root") {
      filter.parent = { $exists: false };
    } else if (parent) {
      filter.parent = parent;
    }

    const categories = await Category.find(filter)
      .populate("parent", "name slug")
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json({ success: true, data: categories });
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
    const { name, slug, type, description } = body;

    const category = await Category.create({
      name,
      slug,
      type,
      description,
      isActive: true,
    });

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
      { new: true }
    );

    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
