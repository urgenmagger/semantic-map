import { Router, Request, Response } from "express";
import { getEmbeddings } from "../services/embedding";
import { topPairs, cosineSimilarity } from "../services/similarity";
import { pca, runUmap } from "../services/projection";
import { getContextualText } from "../services/context";
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  AnalyzePoint,
  KeywordType,
} from "../shared/types";

const router = Router();

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

router.post("/", async (req: Request, res: Response) => {
  try {
    const { keywords, types, method = "pca" }: AnalyzeRequest = req.body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      res.status(400).json({ error: "keywords array required" });
      return;
    }

    const contexts = keywords.map(getContextualText);
    console.log("Embedding contexts:", JSON.stringify(contexts, null, 2));

    const embeddings = await getEmbeddings(contexts);

    const pairs = topPairs(keywords, embeddings);

    const coords2d =
      method === "umap" ? runUmap(embeddings, 2) : pca(embeddings, 2);

    const points: AnalyzePoint[] = keywords.map((keyword, i) => ({
      keyword,
      embeddingText: contexts[i],
      type: types?.[i] ?? ("paid" as KeywordType),
      x: coords2d[i][0],
      y: coords2d[i][1],
      nearest: nearestKeywords(i, keywords, embeddings),
    }));

    const paidCount = points.filter((p) => p.type === "paid").length;
    const organicCount = points.filter((p) => p.type === "organic").length;

    const stats = {
      totalKeywords: keywords.length,
      paidKeywords: paidCount,
      organicKeywords: organicCount,
      coverageScore: 0,
    };

    const response: AnalyzeResponse = { stats, points, pairs };

    res.json(response);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

export default router;
