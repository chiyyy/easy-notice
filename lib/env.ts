import "server-only";

/** 서버 전용 환경 변수. 클라이언트 컴포넌트에서 import하면 빌드 에러가 난다. */
export const env = {
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  ollamaVisionModel: process.env.OLLAMA_VISION_MODEL || "qwen2.5vl:7b",
  mockLlm: process.env.MOCK_LLM === "true",
} as const;
