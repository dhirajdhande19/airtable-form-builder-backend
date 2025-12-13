import axios from "axios";
import { AIRTABLE_CLIENT_ID, AIRTABLE_CLIENT_SECRET } from "../config/env.js";

export const refreshAirtableToken = async (refreshToken) => {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const authHeader = Buffer.from(
    `${AIRTABLE_CLIENT_ID}:${AIRTABLE_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post(
    "https://airtable.com/oauth2/v1/token",
    params,
    {
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data; // { access_token, refresh_token, ... }
};
