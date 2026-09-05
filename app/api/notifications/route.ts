import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Notification from "@/lib/db/models/Notification.model";
import { auth } from "@/lib/auth/config";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);

    const filter: Record<string, unknown> = { recipient: session.user.id };
    if (unreadOnly) filter.isRead = false;

    const skip = (page - 1) * limit;

    const itemsPromise = Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    let notifications: any[];
    let total: number;
    let unreadCount: number;

    if (unreadOnly) {
      const [items, count] = await Promise.all([
        itemsPromise,
        Notification.countDocuments({ recipient: session.user.id, isRead: false }),
      ]);
      notifications = items;
      total = count;
      unreadCount = count;
    } else {
      const [items, totalDocs, unread] = await Promise.all([
        itemsPromise,
        Notification.countDocuments(filter),
        Notification.countDocuments({ recipient: session.user.id, isRead: false }),
      ]);
      notifications = items;
      total = totalDocs;
      unreadCount = unread;
    }

    return NextResponse.json({
      success: true,
      data: {
        items: notifications,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { ids, markAll } = await req.json();

    await connectToDatabase();

    if (markAll) {
      await Notification.updateMany(
        { recipient: session.user.id, isRead: false },
        { isRead: true }
      );
    } else if (ids && ids.length > 0) {
      await Notification.updateMany(
        { _id: { $in: ids }, recipient: session.user.id },
        { isRead: true }
      );
    }

    return NextResponse.json({ success: true, message: "Marked as read" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}
