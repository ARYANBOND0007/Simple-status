import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/signup.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api", invitationRoutes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});