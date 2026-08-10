import mongoose from "mongoose";

// Pre-register all models to prevent runtime MissingSchemaErrors during populate queries
import "@/lib/db/models/User.model";
import "@/lib/db/models/Company.model";
import "@/lib/db/models/Category.model";
import "@/lib/db/models/Brand.model";
import "@/lib/db/models/Product.model";
import "@/lib/db/models/Enquiry.model";
import "@/lib/db/models/Message.model";
import "@/lib/db/models/Notification.model";
import "@/lib/db/models/Wishlist.model";
import "@/lib/db/models/ActivityLog.model";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB connected");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
