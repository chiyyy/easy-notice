import { env } from "@/lib/env";
import { errorFor, errorFromException, readJson } from "@/lib/http";
import { mockTranslate } from "@/lib/mock";
import { generateValidated, textContent } from "@/lib/openai";
import { buildTranslateInput, buildTranslateInstructions } from "@/lib/prompts";
import {
  TranslateRequestSchema,
  TranslateWireSchema,
  translateStrictSchema,
  type TranslateResponse,
} from "@/lib/schema";
import { amountsKept, cleanKoreanGloss } from "@/lib/validate";

// Vercel 서버 함수 최대 실행 시간(초)
export const maxDuration = 60;

// 쉬운 한국어 결과(요약·할 일·주의할 점)를 번역한다. 원문·이미지는 받지 않는다. 내용은 로그로 남기지 않는다.
export async function POST(request: Request) {
  const parsed = TranslateRequestSchema.safeParse(await readJson(request));
  if (!parsed.success) return errorFor("BAD_REQUEST");
  const { result: src, lang } = parsed.data;

  if (env.mockLlm) return Response.json(await mockTranslate(lang, src));

  try {
    const t = await generateValidated(
      {
        name: "translate",
        wireSchema: TranslateWireSchema,
        instructions: buildTranslateInstructions(lang),
        content: [textContent(buildTranslateInput(src))],
        temperature: 0.2,
      },
      translateStrictSchema(src), // 문장 개수가 다르면 1회 재요청
    );
    if (!t) return errorFor("TRANSLATE_FAILED");

    // 괄호 속 한국어 원어가 원문 문장에 없는 말이면 괄호째 지운다
    const fix = (lines: string[], sources: string[]) => lines.map((line, i) => cleanKoreanGloss(line, sources[i]));
    const body: TranslateResponse = {
      summary: fix(t.summary, src.summary),
      todos: fix(
        t.todos,
        src.todos.map((x) => x.task),
      ).map((task, i) => ({ task, due: src.todos[i].due })),
      warnings: fix(t.warnings, src.warnings),
      // 금액 숫자가 번역 중에 바뀌거나 빠졌는지 문장 짝마다 확인
      numberMismatch: !(
        amountsKept(src.summary, t.summary) &&
        amountsKept(
          src.todos.map((x) => x.task),
          t.todos,
        ) &&
        amountsKept(src.warnings, t.warnings)
      ),
    };
    return Response.json(body);
  } catch (err) {
    return errorFromException(err, "translate");
  }
}
