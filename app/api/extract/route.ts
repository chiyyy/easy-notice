import { env } from "@/lib/env";
import { errorResponse, readJson } from "@/lib/http";
import { mockExtract } from "@/lib/mock";
import { ExtractRequestSchema, type ExtractResponse } from "@/lib/schema";

// 1단계(Ollama Vision 추출) + 2단계(개인정보 마스킹)
export async function POST(request: Request) {
  const parsed = ExtractRequestSchema.safeParse(await readJson(request));
  if (!parsed.success) return errorResponse("BAD_REQUEST", 400);

  if (env.mockLlm) {
    const body: ExtractResponse = await mockExtract();
    return Response.json(body);
  }

  // TODO(Phase 2): Ollama 호출 + mask.ts
  return errorResponse("NOT_IMPLEMENTED", 501);
}
