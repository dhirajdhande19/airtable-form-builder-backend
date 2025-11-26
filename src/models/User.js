import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    // airtableUserId: { type: String, required: true, unique: true },
    // accessToken: { type: String, required: true },
    // refreshToken: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export { User };
