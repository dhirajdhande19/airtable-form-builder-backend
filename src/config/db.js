import mongoose from "mongoose";
import { MONGO_URL } from "./env.js";

const connectToDB = async () => {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");
};

export { connectToDB };
