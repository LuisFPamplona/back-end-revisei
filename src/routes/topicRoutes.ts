import { Router } from "express";
import {
  createTopic,
  deleteTopic,
  getTopics,
  updateTopic,
} from "../controllers/topicController";

const router = Router();

router.get("/subjects/:subjectId/topics", getTopics);
router.post("/subjects/:subjectId/topics", createTopic);
router.patch("/topics/:id", updateTopic);
router.delete("/topics/:id", deleteTopic);

export default router;
