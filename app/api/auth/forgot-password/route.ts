import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import User from "@/lib/db/models/User.model";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // For security reasons, do not expose if an email does not exist in our database.
    // Return a success message in both cases.
    return NextResponse.json({
      success: true,
      message: "Reset link dispatched.",
    });
  } catch (error: any) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
