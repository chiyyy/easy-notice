import { env } from "@/lib/env";
import { errorResponse, readJson } from "@/lib/http";
import { mockExplain } from "@/lib/mock";
import { ExplainRequestSchema, type ExplainResponse } from "@/lib/schema";

// Vercel 서버 함수 최대 실행 시간(초). GPT 응답을 기다려야 해서 기본값보다 길게 둔다.
export const maxDuration = 60;

// 3단계(프롬프트 생성) + 4단계(GPT 2차) + 5단계(검증·후처리)
export async function POST(request: Request) {
  const parsed = ExplainRequestSchema.safeParse(await readJson(request));
  if (!parsed.success) return errorResponse("BAD_REQUEST", 400);

  if (env.mockLlm) {
    const body: ExplainResponse = await mockExplain();
    return Response.json(body);
  }

  // TODO(Phase 3): 프롬프트 생성 + OpenAI 구조화 출력 + 검증·D-day
  return errorResponse("NOT_IMPLEMENTED", 501);
}
