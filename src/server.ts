import express from "express";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

app.listen(3000, () => {
  console.log("Listening at http://localhost:3000/");
});
