import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import Job from "../models/Job.js";
import { sampleJobs } from "../data/sampleJobs.js";

const envPath = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "../../.env"),
].find((candidate) => fs.existsSync(candidate));

dotenv.config({ path: envPath });

try {
  await connectDatabase();
  const now = Date.now();

  for (const sampleJob of sampleJobs) {
    const { postedDaysAgo, ...jobData } = sampleJob;
    const postedAt = new Date(now - postedDaysAgo * 24 * 60 * 60 * 1000);

    await Job.updateOne(
      {
        title: jobData.title,
        company: jobData.company,
        description: { $regex: "^SAMPLE LISTING:" },
      },
      {
        $set: jobData,
        $setOnInsert: { createdAt: postedAt, updatedAt: postedAt },
      },
      { upsert: true, timestamps: false },
    );
  }

  console.log(`Seeded ${sampleJobs.length} labeled sample job listings.`);
} catch (error) {
  console.error("Unable to seed sample job listings:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}