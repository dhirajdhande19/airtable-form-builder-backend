import express from "express";
import cors from "cors";
import { connectToDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import { PORT } from "./src/config/env.js";

const app = express();
app.use(
  cors() // -> add frontend url later (local and deployed later)
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/auth/airtable", authRoutes);

const start = async () => {
  await connectToDB(); // -> Connects to db
  app.listen(PORT, () => {
    console.log(`Listining on port: ${PORT}`);
  });
};
start();
