import axios, { HttpStatusCode } from "axios";
import { Response } from "../models/Response.js";
import { makeAirtableRequest } from "../utils/makeAirtableRequest.js";

/* -----------------------------------------------------
   GET BASES
----------------------------------------------------- */
export const getBases = async (req, res) => {
  try {
    const user = req.user;

    const response = await makeAirtableRequest(user, {
      method: "GET",
      url: "https://api.airtable.com/v0/meta/bases",
    });

    return res.json(response.data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/* -----------------------------------------------------
   GET TABLES OF A BASE
----------------------------------------------------- */
export const getTables = async (req, res) => {
  try {
    const { baseId } = req.params;
    const user = req.user;

    const response = await makeAirtableRequest(user, {
      method: "GET",
      url: `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
    });

    return res.json(response.data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/* -----------------------------------------------------
   GET FIELD LIST OF A TABLE
----------------------------------------------------- */
export const getFields = async (req, res) => {
  try {
    const { baseId, tableId } = req.params;
    const user = req.user;

    if (!baseId || !tableId) {
      return res.status(400).json({ error: "baseId and tableId are required" });
    }

    const response = await makeAirtableRequest(user, {
      method: "GET",
      url: `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
    });

    const tables = response.data.tables;
    const table = tables.find((t) => t.id === tableId);

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    return res.json(table);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/* -----------------------------------------------------
   CREATE NEW RECORD IN A TABLE
----------------------------------------------------- */
export const createRecord = async (req, res) => {
  try {
    const { baseId, tableId } = req.params;
    const { fields, formId } = req.body;
    const user = req.user;

    if (!fields || !formId)
      return res.status(400).json({ error: "fields + formId required" });

    // Get table name
    const tablesRes = await makeAirtableRequest(user, {
      method: "GET",
      url: `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
    });

    const table = tablesRes.data.tables.find((t) => t.id == tableId);

    if (!table)
      return res.status(404).json({ error: "Table not found in Airtable" });

    const tableName = table.name;

    // Create Airtable record
    const recordRes = await makeAirtableRequest(user, {
      method: "POST",
      url: `https://api.airtable.com/v0/${baseId}/${tableName}`,
      data: { records: [{ fields }] },
      headers: { "Content-Type": "application/json" },
    });

    const airtableRecord = recordRes.data.records[0];

    // Store in Mongo DB
    const savedResponse = await Response.create({
      formId,
      baseId,
      tableId,
      airtableRecordId: airtableRecord.id,
      answers: fields,
      submittedBy: user._id,
      deletedInAirtable: false,
    });

    return res.status(201).json({
      success: true,
      airtableRecordId: airtableRecord.id,
      saved: savedResponse,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/* -----------------------------------------------------
   UPDATE AN EXISTING RECORD
----------------------------------------------------- */
export const updateRecord = async (req, res) => {
  try {
    const { baseId, tableId, recordId } = req.params;
    const { fields } = req.body;
    const user = req.user;

    if (!fields) return res.status(400).json({ error: "fields are required" });

    // Get table name
    const tablesRes = await makeAirtableRequest(user, {
      method: "GET",
      url: `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
    });

    const table = tablesRes.data.tables.find((t) => t.id == tableId);
    const tableName = table.name;

    // Update Airtable record
    const updateRes = await makeAirtableRequest(user, {
      method: "PATCH",
      url: `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`,
      data: { fields },
      headers: { "Content-Type": "application/json" },
    });

    // Update DB
    const prev = await Response.findOne({
      airtableRecordId: recordId,
      submittedBy: user._id,
    });

    if (!prev) return res.status(404).json({ error: "Record not found in DB" });

    prev.answers = fields;
    await prev.save();

    return res.json({
      success: true,
      updated: updateRes.data,
      saved: prev,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/* -----------------------------------------------------
   DELETE RECORD
----------------------------------------------------- */
export const deleteRecord = async (req, res) => {
  try {
    const { baseId, tableId, recordId } = req.params;
    const user = req.user;

    // Get table name
    const tablesRes = await makeAirtableRequest(user, {
      method: "GET",
      url: `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
    });

    const table = tablesRes.data.tables.find((t) => t.id == tableId);
    const tableName = table.name;

    // Delete from Airtable
    await makeAirtableRequest(user, {
      method: "DELETE",
      url: `https://api.airtable.com/v0/${baseId}/${tableName}?records[]=${recordId}`,
    });

    // Soft delete in DB
    const saved = await Response.findOne({
      airtableRecordId: recordId,
      submittedBy: user._id,
    });

    if (!saved) return res.status(404).json({ error: "Response not in DB" });

    saved.deletedInAirtable = true;
    await saved.save();

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
