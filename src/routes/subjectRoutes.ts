import { Router } from "express";
import {
  createSubject,
  updateSubject,
  getSubjects,
  deleteSubject,
} from "../controllers/subjectController";

const router = Router();

router.get("/", getSubjects);
router.post("/", createSubject);
router.patch("/:id", updateSubject);
router.delete("/:id", deleteSubject);

export default router;
