import express from "express";
import authRoutes from "./routes/authRoutes";
import subjectRoutes from "./routes/subjectRoutes";
import topicRoutes from "./routes/topicRoutes";
import { authMiddleware } from "./middlewares/authMiddleware";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

app.use(authMiddleware);

app.use("/subjects", subjectRoutes);
app.use("/", topicRoutes);

app.listen(3000, () => {
  console.log("Listening at http://localhost:3000/");
});
