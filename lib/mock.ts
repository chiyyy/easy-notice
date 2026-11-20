import "server-only";
import extractFixture from "@/fixtures/extract.json";
import chatFixture from "@/fixtures/chat.json";
import explainFixture from "@/fixtures/explain.json";
import translateFixture from "@/fixtures/translate.json";
import { calcDday } from "./dday";
import {
  ChatResponseSchema,
  ExplainLlmSchema,
  ExtractResponseSchema,
  type ChatResponse,
  type ExplainResponse,
  type ExtractResponse,
  type Lang,
  type Translatable,
  type TranslateResponse,
  TranslateWireSchema,
} from "./schema";

/** MOCK_LLM=true일 때 실제 처리 시간처럼 보이도록 1~2초 지연 */
function fakeDelay(): Promise<void> {
  const ms = 1000 + Math.floor(Math.random() * 1000);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockExtract(): Promise<ExtractResponse> {
  await fakeDelay();
  return ExtractResponseSchema.parse(extractFixture);
}

export async function mockExplain(): Promise<ExplainResponse> {
  await fakeDelay();
  const llm = ExplainLlmSchema.parse(explainFixture);
  const { fields } = ExtractResponseSchema.parse(extractFixture);
  return {
    ...llm,
    fields,
    dday: calcDday(fields.deadline),
    mismatchWarning: false,
  };
}

/** 질문에 들어 있는 낱말로 미리 준비한 답을 고른다 (과태료 고지서 예시 기준) */
export async function mockChat(question: string): Promise<ChatResponse> {
  await fakeDelay();
  const hit = chatFixture.answers.find((a) => a.keywords.some((k) => question.includes(k)));
  return ChatResponseSchema.parse(hit ? { answer: hit.answer, evidence: hit.evidence } : chatFixture.fallback);
}

/** 미리 번역해 둔 과태료 고지서 예시. 기한(due)은 요청에서 그대로 가져온다 */
export async function mockTranslate(lang: Lang, src: Translatable): Promise<TranslateResponse> {
  await fakeDelay();
  const t = TranslateWireSchema.parse(translateFixture[lang]);
  return {
    summary: t.summary,
    todos: t.todos.map((task, i) => ({ task, due: src.todos[i]?.due ?? null })),
    warnings: t.warnings,
    numberMismatch: false,
  };
}
