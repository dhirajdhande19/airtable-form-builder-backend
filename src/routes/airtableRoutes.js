import { Router } from "express";
import {
  createRecord,
  deleteRecord,
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
router.delete(
  "/records/:baseId/:tableId/:recordId",
  authMiddleware,
  deleteRecord
);

export default router;
