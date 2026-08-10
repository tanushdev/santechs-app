import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { connectToDatabase } from "../lib/db/connection";
import Enquiry from "../lib/db/models/Enquiry.model";

async function run() {
  await connectToDatabase();
  const result = await Enquiry.deleteMany({});
  console.log(`✅ Cleared ${result.deletedCount} enquiries from the database.`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
