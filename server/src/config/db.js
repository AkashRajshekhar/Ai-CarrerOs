import mongoose from "mongoose";

export async function connectDatabase() {
  const connectionString = process.env.MONGODB_URI;

  if (!connectionString) {
    console.warn(
      "MONGODB_URI is not configured; starting without a database connection",
    );
    return;
  }

  try {
    await mongoose.connect(connectionString,{
       serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
