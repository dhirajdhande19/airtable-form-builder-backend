import axios, { HttpStatusCode } from "axios";
import { Response } from "../models/Response.js";

export const getBases = async (req, res) => {
  const access_token = req.user.access_token;

  if (!access_token) {
    return res.status(HttpStatusCode.NotFound).json({
      error: "User is not connected to Airtable, u need to log in first.",
    });
  }

  try {
    const response = await axios.get("https://api.airtable.com/v0/meta/bases", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return res.status(HttpStatusCode.Ok).json({ message: response.data });
  } catch (e) {
    return res.json({ error: e });
  }
};

export const getTables = async (req, res) => {
  const baseId = req.params.baseId;
  if (!baseId) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "baseId not found" });
  }
  const access_token = req.user.access_token;
  if (!access_token) {
    return res.status(HttpStatusCode.NotFound).json({
      error: "User is not connected to Airtable, u need to log in first.",
    });
  }

  const response = await axios.get(
    `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.status(HttpStatusCode.Ok).json(response.data);
};

export const getFields = async (req, res) => {
  const { baseId, tableId } = req.params;
  if (!baseId && !tableId) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "baseId/tableId not found" });
  }
  const access_token = req.user.access_token;

  if (!access_token) {
    return res.status(HttpStatusCode.NotFound).json({
      error: "User is not connected to Airtable, u need to log in first.",
    });
  }

  const response = await axios.get(
    `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  const tables = response.data.tables;
  const table = tables.find((t) => t.id === tableId);
  if (!table) {
    return res.json({ error: "Table not found" });
  }

  return res.json(table);
};

export const createRecord = async (req, res) => {
  const { baseId, tableId } = req.params;
  if (!baseId || !tableId) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "baseId/tableId not found" });
  }
  const { fields, formId } = req.body;
  if (!fields || typeof fields != "object") {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "Fields object not found" });
  }
  if (!formId) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "formId is missing" });
  }
  const { access_token } = req.user;
  if (!access_token) {
    return res.status(HttpStatusCode.Forbidden).json({
      error: "User is not connected to Airtable, please login first.",
    });
  }
  try {
    const allTables = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    const tables = allTables.data.tables; // get all tables
    const table = tables.find((t) => t.id == tableId);
    const tableName = table.name;

    const response = await axios.post(
      `https://api.airtable.com/v0/${baseId}/${tableName}`,
      { records: [{ fields }] },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const airtableRecord = response.data.records[0];

    const savedResponse = await Response.create({
      formId,
      baseId,
      tableId,
      airtableRecordId: airtableRecord.id,
      answers: fields,
      submittedBy: req.user._id,
      deletedInAirtable: false,
    });

    return res.status(HttpStatusCode.Created).json({
      success: true,
      airtableRecordId: airtableRecord.id,
      saved: savedResponse,
    });
  } catch (e) {
    return res.json(e.response.data);
  }
};

export const updateRecord = async (req, res) => {
  const { baseId, tableId, recordId } = req.params;
  if (!baseId || !tableId || !recordId) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "baseId/tableId/recordId not found" });
  }
  const { access_token } = req.user;
  if (!access_token) {
    return res
      .status(HttpStatusCode.Unauthorized)
      .json({ error: "You need to login via Airtable OAuth" });
  }

  const allTables = await axios.get(
    `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  const tables = allTables.data.tables;
  const table = tables.find((t) => t.id == tableId);
  const tableName = table.name;

  const { fields } = req.body;
  if (!fields) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ error: "fields are required" });
  }

  const response = await axios.patch(
    `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`,
    { fields },
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const prevRes = await Response.findOne({
    airtableRecordId: recordId,
    submittedBy: req.user._id,
  });
  if (!prevRes) {
    return res
      .status(HttpStatusCode.NotFound)
      .json({ error: "No Response Found in DB" });
  } else {
    (prevRes.answers = fields), await prevRes.save();
  }

  return res.status(HttpStatusCode.Accepted).json({
    success: true,
    updateRecord: response.data,
    saved: prevRes,
  });
};

export const deleteRecord = async (req, res) => {
  const { baseId, tableId, recordId } = req.params;
  if (!baseId || !tableId || !recordId) {
    return res.status(HttpStatusCode.BadRequest).json({
      error: "Missing baseId/tableId/recordId",
    });
  }

  const { access_token } = req.user;
  if (!access_token) {
    return res
      .status(HttpStatusCode.Unauthorized)
      .json({ error: "You need to login via Airtable OAtuh" });
  }
  try {
    // get tableName
    const allTables = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const tables = allTables.data.tables;
    const table = tables.find((t) => t.id == tableId);
    const tableName = table.name;

    await axios.delete(
      `https://api.airtable.com/v0/${baseId}/${tableName}?records[]=${recordId}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
        "Content-Type": "application/json",
      }
    );

    const response = await Response.findOne({
      airtableRecordId: recordId,
      submittedBy: req.user._id,
    });
    if (!response) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ error: "Response does not exist in DB" });
    } else {
      (response.deletedInAirtable = true), await response.save();
    }
    return res.status(HttpStatusCode.Accepted).json({
      success: true,
      deletedFromAirtable: true,
      softDeleted: true,
    });
  } catch (e) {
    return res.json(e.response.data);
  }
};
