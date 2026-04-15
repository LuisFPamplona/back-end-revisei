import { Router } from "express";
import {
  createSubject,
  updateSubject,
  getSubjects,
  deleteSubject,
  getSpecificSubject,
} from "../controllers/subjectController";

const router = Router();

router.get("/", getSubjects);
router.get("/:id", getSpecificSubject);

router.post("/", createSubject);

router.patch("/:id", updateSubject);

router.delete("/:id", deleteSubject);

export default router;
