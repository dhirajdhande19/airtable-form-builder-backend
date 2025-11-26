import mongoose, { Schema } from "mongoose";

const responseSchema = mongoose.Schema(
  {
    formId: { type: mongoose.Schema.ObjectId, ref: "Form" },
    answers: { type: Array, required: true },
    airtableRecordId: { type: String },
    deletedInAirtable: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const Response = mongoose.model("Response", responseSchema);
export { Response };
