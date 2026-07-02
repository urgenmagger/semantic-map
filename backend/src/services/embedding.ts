import fetch from "node-fetch";
import { config } from "../config";

interface EmbeddingResponse {
  embedding: {
    values: number[];
  };
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const url = `${config.embeddingEndpoint}/models/${config.embeddingModel}:embedContent?key=${config.geminiApiKey}`;

    const fetchOptions: any = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${config.embeddingModel}`,
        content: { parts: [{ text }] },
      }),
    };

    let res;
    try {
      res = await fetch(url, fetchOptions);
    } catch {
      throw new Error(
        "Failed to connect to Gemini API. Check your network connection."
      );
    }

    if (!res.ok) {
      const body = await res.text();
      const status = res.status;

      if (status === 403 || status === 401) {
        throw new Error(
          "Gemini API authentication failed. Check your GEMINI_API_KEY."
        );
      }
      if (status === 429) {
        throw new Error(
          "Gemini API rate limit exceeded. Wait and try again."
        );
      }
      throw new Error(`Gemini API error ${status}: ${body.slice(0, 200)}`);
    }

    const data = (await res.json()) as EmbeddingResponse;
    results.push(data.embedding.values);
  }

  return results;
}
