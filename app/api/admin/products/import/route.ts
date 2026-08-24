import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import Category from "@/lib/db/models/Category.model";
import User from "@/lib/db/models/User.model";
import { auth } from "@/lib/auth/config";
import { UserRole, ProductStatus, ProductCondition } from "@/types";
import { getContinentFromCountry } from "@/lib/utils/continent";
import { invalidateCategoryCache } from "@/lib/cache/category-cache";

function parseCsv(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++; // CRLF
      row.push(current.trim());
      if (row.some((cell) => cell.length > 0)) {
        lines.push(row);
      }
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session ||
      ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const defaultSellerEmail = (formData.get("sellerEmail") as string | null)?.trim();

    if (!file) {
      return NextResponse.json({ success: false, error: "No CSV file provided" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length < 2) {
      return NextResponse.json({ success: false, error: "CSV file is empty or missing headers" }, { status: 400 });
    }

    await connectToDatabase();

    // Preload categories & subcategories dictionary
    const allCategories = await Category.find({ isActive: true }).lean();
    const masterCategories = allCategories.filter((c: any) => !c.parent);
    const subCategories = allCategories.filter((c: any) => c.parent);

    // Resolve default fallback seller
    let fallbackSeller = await User.findOne({
      role: UserRole.SELLER,
      ...(defaultSellerEmail ? { email: defaultSellerEmail.toLowerCase() } : {}),
    }).populate("company");

    if (!fallbackSeller) {
      fallbackSeller = await User.findOne({ role: { $in: [UserRole.SUPER_ADMIN, UserRole.ADMIN] } }).populate("company");
    }

    const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const colIndex = {
      name: headers.findIndex((h) => h.includes("name") || h.includes("title")),
      model: headers.findIndex((h) => h.includes("model")),
      category: headers.findIndex((h) => h.includes("category") && !h.includes("sub")),
      subCategory: headers.findIndex((h) => h.includes("sub")),
      price: headers.findIndex((h) => h.includes("price")),
      year: headers.findIndex((h) => h.includes("year")),
      condition: headers.findIndex((h) => h.includes("condition")),
      country: headers.findIndex((h) => h.includes("country")),
      state: headers.findIndex((h) => h.includes("state")),
      city: headers.findIndex((h) => h.includes("city")),
      sellerEmail: headers.findIndex((h) => h.includes("seller") || h.includes("email")),
    };

    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const prodName = colIndex.name !== -1 ? row[colIndex.name] : row[0];
      if (!prodName) continue;

      const catName = colIndex.category !== -1 ? row[colIndex.category] : "";
      const subCatName = colIndex.subCategory !== -1 ? row[colIndex.subCategory] : "";
      const rowSellerEmail = colIndex.sellerEmail !== -1 ? row[colIndex.sellerEmail] : "";

      // Match Sub-Category & Category
      let matchedSubCat = subCategories.find((s: any) =>
        s.name.toLowerCase() === subCatName.toLowerCase() ||
        s.slug.toLowerCase() === subCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      );

      let matchedCat = masterCategories.find((c: any) =>
        c.name.toLowerCase() === catName.toLowerCase() ||
        c.slug.toLowerCase() === catName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      );

      if (!matchedCat && matchedSubCat) {
        matchedCat = masterCategories.find((c: any) => String(c._id) === String((matchedSubCat as any).parent));
      }

      if (!matchedCat) {
        matchedCat = masterCategories[0]; // fallback to first master category
      }

      // Match Seller
      let rowSeller = fallbackSeller;
      if (rowSellerEmail) {
        const foundSeller = await User.findOne({ email: rowSellerEmail.toLowerCase() }).populate("company");
        if (foundSeller) rowSeller = foundSeller;
      }

      const country = (colIndex.country !== -1 && row[colIndex.country]) || "India";
      const continent = getContinentFromCountry(country) || "Asia";
      const state = (colIndex.state !== -1 && row[colIndex.state]) || "Gujarat";
      const city = (colIndex.city !== -1 && row[colIndex.city]) || "Surat";
      const modelNum = colIndex.model !== -1 ? row[colIndex.model] : "";
      const priceNum = colIndex.price !== -1 ? parseFloat(row[colIndex.price].replace(/[^0-9.]/g, "")) || 0 : 0;
      const yearNum = colIndex.year !== -1 ? parseInt(row[colIndex.year].replace(/[^0-9]/g, ""), 10) || new Date().getFullYear() : new Date().getFullYear();
      
      const rawCondition = (colIndex.condition !== -1 ? row[colIndex.condition] : "GOOD").toUpperCase();
      const condition = Object.values(ProductCondition).includes(rawCondition as any)
        ? (rawCondition as ProductCondition)
        : ProductCondition.GOOD;

      const refNumber = `SAN-IMP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      try {
        await Product.create({
          name: prodName,
          slug: `${prodName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
          referenceNumber: refNumber,
          machineModel: modelNum,
          category: (matchedCat as any)?._id,
          subCategory: (matchedSubCat as any)?._id || undefined,
          seller: (rowSeller as any)?._id,
          company: (rowSeller as any)?.company?._id || undefined,
          price: priceNum,
          currency: "INR",
          yearOfManufacture: yearNum,
          condition: condition,
          status: ProductStatus.APPROVED,
          images: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800"],
          description: `${prodName} - Industrial machinery imported via bulk catalog upload.`,
          location: {
            city: city,
            state: state,
            country: country,
            continent: continent,
          },
          publishedAt: new Date(),
        });
        importedCount++;
      } catch (err: any) {
        errors.push(`Row ${i + 1} (${prodName}): ${err.message}`);
      }
    }

    invalidateCategoryCache();

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedCount} products.`,
      importedCount,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    console.error("CSV Products Import Error:", error);
    return NextResponse.json({ success: false, error: "Failed to import CSV products" }, { status: 500 });
  }
}
