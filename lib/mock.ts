import "server-only";
import extractFixture from "@/fixtures/extract.json";
import explainFixture from "@/fixtures/explain.json";
import { calcDday } from "./dday";
import {
  ExplainLlmSchema,
  ExtractResponseSchema,
  type ExplainResponse,
  type ExtractResponse,
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
