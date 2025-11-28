import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createForm,
  getAllForms,
  getForm,
} from "../controllers/formController.js";
const router = Router();

router.post("/create", authMiddleware, createForm);
router.get("/all", authMiddleware, getAllForms);
router.get("/:formId", authMiddleware, getForm);

export default router;
