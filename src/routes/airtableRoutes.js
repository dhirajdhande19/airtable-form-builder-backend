import { Router } from "express";
import {
  createRecord,
  getBases,
  getFields,
  getTables,
  updateRecord,
} from "../controllers/airtableController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = Router();

router.get("/bases", authMiddleware, getBases);
router.get("/tables/:baseId", authMiddleware, getTables);
router.get("/fields/:baseId/:tableId", authMiddleware, getFields);
router.post("/records/:baseId/:tableId", authMiddleware, createRecord);
router.put("/records/:baseId/:tableId/:recordId", authMiddleware, updateRecord);

export default router;

// base id -> appRxiRI18Z7bDoX6
// table id -> tbla6M5nDX2I4A6H0
//
