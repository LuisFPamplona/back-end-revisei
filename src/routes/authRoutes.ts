import { Router } from "express";
import { login, register } from "../controllers/authController";

const router = Router();

router.post("/users", register);
router.post("/sessions", login);

export default router;
