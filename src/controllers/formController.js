import axios, { HttpStatusCode } from "axios";
import { Form } from "../models/Form.js";

export const createForm = async (req, res) => {
  const { baseId, tableId, questions } = req.body;
  if (!baseId || !tableId) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "baseId/tableId not found" });
  }

  if (!questions || !Array.isArray(questions) || questions.length < 1) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "questions field is invalid" });
  }

  try {
    const { access_token } = req.user;
    if (!access_token) {
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ error: "You need to log in via Airtable OAuth" });
    }

    const allTables = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const tables = allTables.data.tables; // all tables
    const table = tables.find((t) => t.id === tableId); // the table we need
    if (!table) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ error: "Invalid tableId" });
    }

    const validFieldIds = table.fields.map((f) => f.id); // get all field id's present in table

    for (let i = 0; i < questions.length; i++) {
      if (!validFieldIds.includes(questions[i].fieldId)) {
        return res.status(HttpStatusCode.NotFound).json({
          error: `${questions[i].fieldId} does not exits in Airtable table`,
        });
      }
      questions[i].questionKey = "q_" + i;
    }

    questions.sort((a, b) => a.orderIndex - b.orderIndex);

    const ownerId = req.user._id; // mongo _id of user
    const form = await Form.create({
      baseId,
      tableId,
      owner: ownerId,
      questions,
    });

    return res.status(HttpStatusCode.Created).json({
      success: true,
      form,
    });
  } catch (e) {
    return res.json(e.response.data);
  }
};

export const getAllForms = async (req, res) => {
  const forms = await Form.find({ owner: req.user._id });
  if (!forms) {
    return res
      .status(HttpStatusCode.NotFound)
      .json({ error: "No Forms Found" });
  }
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    forms: forms,
  });
};

export const getForm = async (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res
      .status(HttpStatusCode.NotFound)
      .json({ error: "formId is invalid" });
  }
  const form = await Form.findById({ _id: formId });
  if (!form) {
    return res
      .status(HttpStatusCode.NotFound)
      .json({ error: "Form not found" });
  }
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    questions: form.questions,
    baseId: form.baseId,
    tableId: form.tableId,
  });
};
