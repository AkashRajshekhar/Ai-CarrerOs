import mongoose from "mongoose";

export async function connectDatabase() {
  const connectionString = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!connectionString) {
    throw new Error("Set MONGODB_URI or MONGO_URI in the server environment.");
  }

  try {
    await mongoose.connect(connectionString, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
