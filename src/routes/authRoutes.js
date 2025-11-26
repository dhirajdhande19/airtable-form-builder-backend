import { Router } from "express";
import {
  airtableCallback,
  airtableLogin,
} from "../controllers/authControllers.js";

const router = Router();

router.post("/login", airtableLogin);
router.get("/callback", airtableCallback);

export default router;
