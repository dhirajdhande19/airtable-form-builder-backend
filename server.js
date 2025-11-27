import express from "express";
import cors from "cors";
import { connectToDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import airtableRoutes from "./src/routes/airtableRoutes.js";
import { PORT } from "./src/config/env.js";
import session from "express-session";

const app = express();
app.use(
  cors() // -> add frontend url later (local and deployed later)
);

app.use(
  session({
    secret: "some_super_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/airtable", airtableRoutes);
app.use("/api/auth/airtable", authRoutes);

const start = async () => {
  await connectToDB(); // -> Connects to db
  app.listen(PORT, () => {
    console.log(`Listining on port: ${PORT}`);
  });
};
start();
