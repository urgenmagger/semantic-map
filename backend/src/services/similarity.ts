function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

function norm(a: number[]): number {
  return Math.sqrt(dotProduct(a, a));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  return dotProduct(a, b) / (norm(a) * norm(b));
}

export interface PairItem {
  left: string;
  right: string;
  similarity: number;
}

export function allPairs(
  keywords: string[],
  embeddings: number[][],
): PairItem[] {
  const pairs: PairItem[] = [];
  const n = keywords.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const sim = cosineSimilarity(embeddings[i], embeddings[j]);
      pairs.push({ left: keywords[i], right: keywords[j], similarity: sim });
    }
  }

  pairs.sort((a, b) => b.similarity - a.similarity);
  return pairs;
}

export function topPairs(
  keywords: string[],
  embeddings: number[][],
  topN: number = 25,
  threshold: number = 0,
): PairItem[] {
  const pairs = allPairs(keywords, embeddings);
  let filtered = pairs;

  if (threshold > 0) {
    filtered = pairs.filter((p) => p.similarity >= threshold);
  }

  return filtered.slice(0, topN);
}
