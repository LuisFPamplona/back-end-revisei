import express from "express";
import authRoutes from "./routes/authRoutes";
<<<<<<< Updated upstream
=======
import subjectRoutes from "./routes/subjectRoutes";
import topicRoutes from "./routes/topicRoutes";
import { authMiddleware } from "./middlewares/authMiddleware";
import cors from "cors";
>>>>>>> Stashed changes

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());

app.use("/auth", authRoutes);

app.listen(3000, () => {
  console.log("Listening at http://localhost:3000/");
});
