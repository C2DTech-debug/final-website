import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || "150", 10),
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || "20", 10),
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log(`[db] Connected to MongoDB (${mongoose.connection.name}) [Pool: 20-150 sockets, IPv4]`);
  } catch (error) {
    console.error("[db] MongoDB connection failed:", error);
    throw error;
  }
}

export function disconnectDB(): Promise<void> {
  return mongoose.disconnect();
}
