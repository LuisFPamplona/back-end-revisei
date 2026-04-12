import { Router } from "express";
import { login, register } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/users", register);
router.post("/sessions", login);

router.get("/validate", authMiddleware, (req, res) => {
  return res.status(200).json({ valid: true });
});

export default router;
