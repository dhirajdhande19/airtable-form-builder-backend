import mongoose, { Schema } from "mongoose";

const formSchema = mongoose.Schema(
  {
    baseId: { type: String, required: true },
    tableId: { type: String, required: true },
    owner: { type: String, required: true },
    questions: [
      {
        questionKey: { type: String },
        fieldId: { type: String },
        label: { type: String },
        type: { type: String },
        required: { type: Boolean },
        orderIndex: { type: Number },
        options: [
          {
            id: { type: String },
            name: { type: String },
          },
        ],
        conditionalRules: { type: Object },
      },
    ],
  },
  { timestamps: true }
);

const Form = mongoose.model("Form", formSchema);
export { Form };
