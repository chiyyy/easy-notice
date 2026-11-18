import { calcDday } from "@/lib/dday";
import { env } from "@/lib/env";
import { errorFor, errorFromException, readJson } from "@/lib/http";
import { mockExplain } from "@/lib/mock";
import { generateValidated, textContent } from "@/lib/openai";
import { buildExplainInput, buildExplainInstructions } from "@/lib/prompts";
import { ExplainLlmSchema, ExplainRequestSchema, ExplainWireSchema, type ExplainResponse } from "@/lib/schema";
import { checkExplain } from "@/lib/validate";

// Vercel 서버 함수 최대 실행 시간(초). GPT 응답을 기다려야 해서 기본값보다 길게 둔다.
export const maxDuration = 60;

// 3단계(프롬프트 생성) + 4단계(GPT 2차) + 5단계(검증·후처리)
// 이 단계에는 이미지가 없다. 마스킹된 텍스트만 받는다.
export async function POST(request: Request) {
  const parsed = ExplainRequestSchema.safeParse(await readJson(request));
  if (!parsed.success) return errorFor("BAD_REQUEST");

  if (env.mockLlm) {
    const body: ExplainResponse = await mockExplain();
    return Response.json(body);
  }

  const { docType, maskedText, fields, level } = parsed.data;
  try {
    // 3~4단계: 프롬프트 조립 → GPT 2차 (형식이 틀리면 1회 재요청)
    const llm = await generateValidated(
      {
        name: "explain",
        wireSchema: ExplainWireSchema,
        instructions: buildExplainInstructions(docType, level),
        content: [textContent(buildExplainInput(maskedText, fields))],
        temperature: 0.2,
      },
      ExplainLlmSchema,
    );
    if (!llm) return errorFor("EXPLAIN_FAILED");

    // 5단계: 원문과 날짜·금액 교차 검증, 원문에 없는 용어 제거, D-day
    const { result, mismatchWarning } = checkExplain(llm, maskedText, fields);
    const body: ExplainResponse = {
      ...result,
      fields, // 화면의 핵심 정보는 항상 1차(원문) 값
      dday: calcDday(fields.deadline),
      mismatchWarning,
    };
    return Response.json(body);
  } catch (err) {
    return errorFromException(err, "explain");
  }
}
