import { getEmbeddings } from "../backend/src/services/embedding";
import { topPairs, cosineSimilarity } from "../backend/src/services/similarity";
import { pca, runUmap } from "../backend/src/services/projection";
import { getContextualText } from "../backend/src/services/context";
import { validateApiKey } from "../backend/src/config";
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  AnalyzePoint,
  KeywordType,
} from "../backend/src/shared/types";

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

export default async function handler(
  req: any,
  res: any
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const {
      keywords,
      types,
      method = "pca",
      threshold = 0,
      topN = 25,
    }: AnalyzeRequest = req.body;

    if (!keywords || !Array.isArray(keywords)) {
      res.status(400).json({
        error: "Invalid input",
        message: '"keywords" must be an array of strings.',
      });
      return;
    }

    if (keywords.length < 2) {
      res.status(400).json({
        error: "Not enough keywords",
        message: "At least 2 keywords are required for pairwise similarity.",
      });
      return;
    }

    const keyError = validateApiKey();
    if (keyError) {
      res.status(500).json({
        error: "Embedding API error",
        message: keyError,
      });
      return;
    }

    const contexts = keywords.map(getContextualText);

    let embeddings: number[][];
    try {
      embeddings = await getEmbeddings(contexts);
    } catch (err: any) {
      res.status(502).json({
        error: "Embedding API error",
        message:
          err.message ||
          "Failed to generate embeddings. Check GEMINI_API_KEY, API quota or billing settings.",
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
      embeddingText: contexts[i],
      type: types?.[i] ?? ("paid" as KeywordType),
      x: coords2d[i][0],
      y: coords2d[i][1],
      nearest: nearestKeywords(i, keywords, embeddings),
    }));

    const paidCount = points.filter((p) => p.type === "paid").length;
    const organicCount = points.filter((p) => p.type === "organic").length;

    const response: AnalyzeResponse = {
      stats: {
        totalKeywords: keywords.length,
        paidKeywords: paidCount,
        organicKeywords: organicCount,
        coverageScore: 0,
      },
      points,
      pairs,
    };

    res.json(response);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: "Internal error",
      message: err.message || "Unexpected server error.",
    });
  }
}
