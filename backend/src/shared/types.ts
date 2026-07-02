export type KeywordType = "paid" | "organic";
export type ProjectionMethod = "pca" | "umap";

export interface AnalyzeRequest {
  keywords: string[];
  types?: KeywordType[];
  method?: ProjectionMethod;
  threshold?: number;
  topN?: number;
}

export interface NearestKeyword {
  keyword: string;
  similarity: number;
}

export interface AnalyzePoint {
  keyword: string;
  embeddingText: string;
  type: KeywordType;
  x: number;
  y: number;
  nearest: NearestKeyword[];
}

export interface PairResult {
  left: string;
  right: string;
  similarity: number;
}

export interface AnalyzeStats {
  totalKeywords: number;
  paidKeywords: number;
  organicKeywords: number;
  coverageScore: number;
}

export interface AnalyzeResponse {
  stats: AnalyzeStats;
  points: AnalyzePoint[];
  pairs: PairResult[];
}
