import { env } from "@/lib/env";
import { errorResponse, readJson } from "@/lib/http";
import { mockExtract } from "@/lib/mock";
import { ExtractRequestSchema, type ExtractResponse } from "@/lib/schema";

// Vercel 서버 함수 최대 실행 시간(초). GPT 응답을 기다려야 해서 기본값보다 길게 둔다.
export const maxDuration = 60;

// 1단계(GPT 1차 Vision 추출) + 2단계(개인정보 마스킹)
export async function POST(request: Request) {
  const parsed = ExtractRequestSchema.safeParse(await readJson(request));
  if (!parsed.success) return errorResponse("BAD_REQUEST", 400);

  if (env.mockLlm) {
    const body: ExtractResponse = await mockExtract();
    return Response.json(body);
  }

  // TODO(Phase 2): GPT 1차(Vision) 호출 + mask.ts
  return errorResponse("NOT_IMPLEMENTED", 501);
}
