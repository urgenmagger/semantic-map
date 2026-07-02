import { config } from "../config";

interface EmbeddingResponse {
  embedding: {
    values: number[];
  };
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];

  for (const text of texts) {
    const url = `${config.embeddingEndpoint}/models/${config.embeddingModel}:embedContent?key=${config.geminiApiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${config.embeddingModel}`,
        content: { parts: [{ text }] },
      }),
    });

    if (!res.ok) {
      throw new Error(
        `Embedding failed for "${text}": ${res.status} ${await res.text()}`
      );
    }

    const data: EmbeddingResponse = await res.json();
    results.push(data.embedding.values);
  }

  return results;
}
