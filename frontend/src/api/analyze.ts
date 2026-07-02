import type { AnalyzeRequest, AnalyzeResponse } from "../shared/types";

export async function analyzeKeywords(
  data: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
