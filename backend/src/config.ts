export const config = {
  port: Number(process.env.PORT) || 4000,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  embeddingModel: "gemini-embedding-001",
  embeddingEndpoint: "https://generativelanguage.googleapis.com/v1beta",
};
