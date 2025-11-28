import { HttpStatusCode } from "axios";
import { Response } from "../models/Response.js";

export const getAllResponses = async (req, res) => {
  const { formId } = req.params;
  if (!formId) {
    return res
      .status(HttpStatusCode.NotFound)
      .json({ error: "formId not found" });
  }
  const response = await Response.find({
    formId: formId,
    submittedBy: req.user._id,
    deletedInAirtable: false,
  });

  if (!response || response.length == 0) {
    return res
      .status(HttpStatusCode.NotFound)
      .json({ error: "No Responses/Records found in DB" });
  }
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    responses: response,
  });
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
