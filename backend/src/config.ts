export const config = {
  port: Number(process.env.PORT) || 4000,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  embeddingModel: "gemini-embedding-001",
  embeddingEndpoint: "https://generativelanguage.googleapis.com/v1beta",
  socksProxy: process.env.SOCKS_PROXY || "",
};

export function validateApiKey(): string | null {
  if (!config.geminiApiKey) {
    return "GEMINI_API_KEY is not set. Add it to backend/.env or set it as an environment variable.";
  }
  return null;
}
