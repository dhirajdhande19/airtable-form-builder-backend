import axios, { HttpStatusCode } from "axios";
import {
  AIRTABLE_AUTH_URL,
  AIRTABLE_CLIENT_ID,
  AIRTABLE_CLIENT_SECRET,
  AIRTABLE_REDIRECT_URI,
  JWT_EXPIRES_IN,
  JWT_SECRET,
} from "../config/env.js";

import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
} from "../utils/pkce.js";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

// function 1 : login
const airtableLogin = async (req, res) => {
  try {
    const scopes = [
      "data.records:read",
      "data.records:write",
      "schema.bases:read",
      "user.email:read",
    ].join(" ");
    // import generated PKCE values
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Store verifier & state in session
    req.session.codeVerifier = codeVerifier;
    req.session.state = state;

    const authorizeUrl =
      `${AIRTABLE_AUTH_URL}?client_id=${AIRTABLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(AIRTABLE_REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&state=${state}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256`;

    return res.redirect(authorizeUrl);
  } catch (e) {
    return res.json({ error: e });
  }
};

// function 2 : Callback
const airtableCallback = async (req, res) => {
  const { code, state } = req.query;

  // Check for errors and return respective err
  if (!code) return res.json({ error: "Missing code" });
  if (!state) return res.json({ error: "Missing state" });

  // Validate state
  if (state !== req.session.state) {
    return res.json({ error: "Invalid state" });
  }

  // Retrieve stored code_verifier
  const codeVerifier = req.session.codeVerifier;

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code: code, // -> received code from req.query
    redirect_uri: AIRTABLE_REDIRECT_URI,
    client_id: AIRTABLE_CLIENT_ID,
    code_verifier: codeVerifier,
  });

  // Basic auth header
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

  const { access_token, refresh_token } = response.data;

  // at fetch user data
  const user = await axios.get("https://api.airtable.com/v0/meta/whoami", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  // store/update user data(info/token)
  const airtableUserId = user.data.id;
  const email = user.data.email;

  let appUser = await User.findOne({ airtableUserId });

  if (!appUser) {
    // create new user
    appUser = await User.create({
      airtableUserId,
      email,
      access_token,
      refresh_token,
    });
  } else {
    // update tokens for existing user and save user
    appUser.access_token = access_token;
    appUser.refresh_token = refresh_token;
    await appUser.save();
  }
  // console.log("User: ", appUser);

  // generate our own jwt token
  const appToken = jwt.sign(
    { id: appUser._id }, // payload
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // after generating appToken
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  return res.redirect(`${FRONTEND_URL}/auth/callback?token=${appToken}`);
};

export { airtableLogin, airtableCallback };
