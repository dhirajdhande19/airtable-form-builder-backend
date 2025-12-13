import { HttpStatusCode } from "axios";
import { Response } from "../models/Response.js";
import { Form } from "../models/Form.js";

// GET ONE RESPONSE by recordId
export const getSingleResponse = async (req, res) => {
  const { responseId } = req.params;

  if (!responseId) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "responseId is missing" });
  }

  try {
    const response = await Response.findOne({
      airtableRecordId: responseId,
      submittedBy: req.user._id,
      deletedInAirtable: false,
    });

    if (!response) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ error: "Response not found" });
    }

    return res.status(HttpStatusCode.Ok).json({
      success: true,
      response,
    });
  } catch (err) {
    console.error("Error fetching single response:", err);
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "Server error" });
  }
};

export const getAllResponses = async (req, res) => {
  const { formId } = req.params;
  if (!formId) {
    return res
      .status(HttpStatusCode.NotFound)
      .json({ error: "formId not found" });
  }

  try {
    const form = await Form.findById(formId);
    if (!form) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ error: "Form not found" });
    }
    const responses = await Response.find({
      formId: formId,
      submittedBy: req.user._id,
      deletedInAirtable: false,
    }).sort({ createdAt: -1 });

    if (!responses || responses.length == 0) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ error: "No Responses/Records found in DB" });
    }
    return res.status(HttpStatusCode.Ok).json({
      success: true,
      responses,
    });
  } catch (e) {
    console.error("Fetching responses failed:", error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ error: "Failed to fetch responses" });
  }
};
export const softDeleteResponse = async (req, res) => {
  const { responseId } = req.params;
  if (!responseId) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "responseId is invalid" });
  }
  const response = await Response.findOne({
    airtableRecordId: responseId,
    submittedBy: req.user._id,
  });
  if (!response || response.deletedInAirtable === true) {
    return res
      .status(HttpStatusCode.NotFound)
      .json({ error: "No Response/Record found in DB" });
  }

  response.deletedInAirtable = true;
  await response.save();

  return res.status(HttpStatusCode.Ok).json({
    success: true,
    softDeleted: true,
    deletedResponse: response,
  });
};
