import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getAllResponses,
  getSingleResponse,
  softDeleteResponse,
} from "../controllers/responseController.js";

const router = Router();

router.get("/view/:responseId", authMiddleware, getSingleResponse);
router.delete("/local/:responseId", authMiddleware, softDeleteResponse);
router.get("/:formId", authMiddleware, getAllResponses);

export default router;
