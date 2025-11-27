import axios, { HttpStatusCode } from "axios";

export const getBases = async (req, res) => {
  const access_token = req.user.access_token;

  if (!access_token) {
    return res.status(HttpStatusCode.NotFound).json({
      err: "User is not connected to Airtable, u need to log in first.",
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
      .json({ message: "baseId not found" });
  }
  const access_token = req.user.access_token;
  if (!access_token) {
    return res.status(HttpStatusCode.NotFound).json({
      err: "User is not connected to Airtable, u need to log in first.",
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
      .json({ message: "baseId/tableId not found" });
  }
  const access_token = req.user.access_token;

  if (!access_token) {
    return res.status(HttpStatusCode.NotFound).json({
      err: "User is not connected to Airtable, u need to log in first.",
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

export const createRecord = async (req, res) => {};

export const updateRecord = async (req, res) => {};
