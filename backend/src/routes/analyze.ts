import { Router, Request, Response } from "express";
import { getEmbeddings } from "../services/embedding";
import { topPairs, cosineSimilarity } from "../services/similarity";
import { pca, runUmap } from "../services/projection";
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  AnalyzePoint,
} from "../shared/types";

const router = Router();

const MAX_KEYWORDS = 200;
const MAX_KEYWORD_LENGTH = 300;

function nearestKeywords(
  i: number,
  keywords: string[],
  embeddings: number[][],
  topN: number = 5
): { keyword: string; similarity: number }[] {
  const sims = embeddings.map((emb, j) => ({
    keyword: keywords[j],
    similarity: j === i ? -Infinity : cosineSimilarity(embeddings[i], emb),
  }));
  sims.sort((a, b) => b.similarity - a.similarity);
  return sims.slice(0, topN).map(({ keyword, similarity }) => ({
    keyword,
    similarity: Math.round(similarity * 10000) / 10000,
  }));
}

function validateKeywords(keywords: unknown): string | null {
  if (!keywords || !Array.isArray(keywords)) {
    return '"keywords" must be an array of strings.';
  }

  if (keywords.length < 2) {
    return "At least 2 keywords are required for pairwise similarity.";
  }

  if (keywords.length > MAX_KEYWORDS) {
    return `Maximum ${MAX_KEYWORDS} keywords allowed.`;
  }

  for (let i = 0; i < keywords.length; i++) {
    if (typeof keywords[i] !== "string" || keywords[i].trim().length === 0) {
      return `Keyword at index ${i} must be a non-empty string.`;
    }
    if (keywords[i].length > MAX_KEYWORD_LENGTH) {
      return `Keyword at index ${i} exceeds maximum length of ${MAX_KEYWORD_LENGTH} characters.`;
    }
  }

  return null;
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      keywords,
      method = "pca",
      threshold = 0,
      topN = 25,
    }: AnalyzeRequest = req.body;

    const validationError = validateKeywords(keywords);
    if (validationError) {
      res.status(400).json({
        error: "Invalid input",
        message: validationError,
      });
      return;
    }

    let embeddings: number[][];
    try {
      embeddings = await getEmbeddings(keywords);
    } catch (err: any) {
      res.status(502).json({
        error: "Embedding error",
        message:
          err.message || "Failed to generate embeddings with local model.",
      });
      return;
    }

    const pairs = topPairs(keywords, embeddings, topN, threshold);

    let coords2d: number[][];
    try {
      coords2d =
        method === "umap" ? runUmap(embeddings, 2) : pca(embeddings, 2);
    } catch {
      coords2d = pca(embeddings, 2);
    }

    const points: AnalyzePoint[] = keywords.map((keyword, i) => ({
      keyword,
      embeddingText: keyword,
      x: coords2d[i][0],
      y: coords2d[i][1],
      nearest: nearestKeywords(i, keywords, embeddings),
    }));

    const stats = {
      totalKeywords: keywords.length,
    };

    const response: AnalyzeResponse = { stats, points, pairs };

    res.json(response);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: "Internal error",
      message: err.message || "Unexpected server error.",
    });
  }
});

export default router;
