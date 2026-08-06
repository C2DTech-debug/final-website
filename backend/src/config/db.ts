import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log(`[db] Connected to MongoDB (${mongoose.connection.name})`);
  } catch (error) {
    console.error("[db] MongoDB connection failed:", error);
    throw error;
  }
}

export function disconnectDB(): Promise<void> {
  return mongoose.disconnect();
}
