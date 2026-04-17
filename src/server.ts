import express from "express";
import authRoutes from "./routes/authRoutes";
import subjectRoutes from "./routes/subjectRoutes";
import topicRoutes from "./routes/topicRoutes";
import userRoutes from "./routes/userRoutes";
import { authMiddleware } from "./middlewares/authMiddleware";
import cors from "cors";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());

app.use("/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(authMiddleware);

app.use("/user", userRoutes);
app.use("/subjects", subjectRoutes);
app.use("/", topicRoutes);

app.listen(3000, () => {
  console.log("Listening at http://localhost:3000/");
});
