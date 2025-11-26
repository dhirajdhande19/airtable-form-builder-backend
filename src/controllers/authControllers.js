import { HttpStatusCode } from "axios";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
// fn1 -> airtableLogin
const airtableLogin = async (req, res) => {
  const { name, email } = req.body ?? {};
  try {
    if (!name || !email) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "please provide name and email" });
    }
    const token = jwt.sign(
      { email: email, name: name }, // payload
      JWT_SECRET, // secret
      { expiresIn: JWT_EXPIRES_IN }
    );
    return res
      .status(HttpStatusCode.Ok)
      .json({ message: "token received", token });
  } catch (e) {
    console.error(e.message);
  }
};

// fn2 -> airtableCallback
const airtableCallback = async (req, res) => {
  try {
    return res.status(HttpStatusCode.Ok).json();
  } catch (e) {
    console.error(e.message);
  }
};

export { airtableLogin, airtableCallback };
