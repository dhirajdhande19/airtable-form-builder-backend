import mongoose, { Schema } from "mongoose";

const responseSchema = mongoose.Schema(
  {
    formId: { type: mongoose.Schema.ObjectId, ref: "Form", required: true },
    baseId: String,
    tableId: String,
    airtableRecordId: { type: String, required: true },
    answers: { type: Object, required: true },
    submittedBy: { type: mongoose.Schema.ObjectId, ref: "User" },
    deletedInAirtable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Response = mongoose.model("Response", responseSchema);
export { Response };
