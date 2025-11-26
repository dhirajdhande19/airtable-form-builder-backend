import mongoose, { Schema } from "mongoose";

const formSchema = mongoose.Schema(
  {
    baseId: { type: String, required: true },
    tableId: { type: String, required: true },
    owner: { type: mongoose.Schema.ObjectId, ref: "User" },
    questions: [
      {
        questionKey: String,
        label: String,
        type: String,
        options: [String],
        conditionalRules: Object,
        required: Boolean,
      },
    ],
  },
  { timestamps: true }
);

const Form = mongoose.model("Form", formSchema);
export { Form };
