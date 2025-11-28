import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getAllForms } from "../controllers/formController.js";
import { softDeleteResponse } from "../controllers/responseController.js";

const router = Router();

router.get("/:formId", authMiddleware, getAllForms);
router.delete("/local/:responseId", authMiddleware, softDeleteResponse);

export default router;
