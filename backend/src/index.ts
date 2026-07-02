import "dotenv/config";
import express from "express";
import cors from "cors";
import { config } from "./config";
import analyzeRouter from "./routes/analyze";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/analyze", analyzeRouter);

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
});
