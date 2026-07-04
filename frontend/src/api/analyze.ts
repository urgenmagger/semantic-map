import type { AnalyzeRequest, AnalyzeResponse } from "../shared/types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function analyzeKeywords(
  data: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.message || `API error: ${res.status}`
    );
  }

  return res.json();
}
