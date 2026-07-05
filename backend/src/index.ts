import "dotenv/config";
import express from "express";
import cors from "cors";
import { config } from "./config";
import analyzeRouter from "./routes/analyze";
import healthRouter from "./routes/health";

import { getEmbeddings } from "./services/embedding";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/analyze", analyzeRouter);

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
  getEmbeddings(["warmup"]).then(() => {
    console.log("Model pre-warmed");
  }).catch((err) => {
    console.error("Model pre-warm failed:", err.message);
  });
});
