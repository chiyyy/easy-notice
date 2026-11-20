import { describe, expect, it } from "vitest";
import extractFixture from "@/fixtures/extract.json";
import explainFixture from "@/fixtures/explain.json";
import {
  ExplainLlmSchema,
  ExplainRequestSchema,
  ExtractLlmSchema,
  ExtractResponseSchema,
} from "@/lib/schema";

describe("fixtures", () => {
  it("extract fixture는 ExtractResponse 스키마를 만족한다", () => {
    expect(ExtractResponseSchema.safeParse(extractFixture).success).toBe(true);
  });

  it("explain fixture는 GPT 출력 스키마를 만족한다", () => {
    expect(ExplainLlmSchema.safeParse(explainFixture).success).toBe(true);
  });

  it("explain fixture의 용어는 모두 maskedText에 실제로 등장한다", () => {
    const { terms } = ExplainLlmSchema.parse(explainFixture);
    for (const t of terms) expect(extractFixture.maskedText).toContain(t.word);
  });

  it("고지서 예시 값: 감경 후 실제 낼 금액 32,000원, 2026-11-30 기한", () => {
    const { fields } = ExtractResponseSchema.parse(extractFixture);
    expect(fields.amount).toBe(32000);
    expect(fields.deadline).toBe("2026-11-30");
  });

  it("고지서 예시의 전화번호는 가려져 있다", () => {
    expect(extractFixture.maskedText).not.toMatch(/0\d{1,2}-\d{3,4}-\d{4}/);
  });
});

describe("schema", () => {
  it("summary는 정확히 3줄이어야 한다", () => {
    const two = { ...explainFixture, summary: ["a", "b"] };
    expect(ExplainLlmSchema.safeParse(two).success).toBe(false);
  });

  it("날짜는 YYYY-MM-DD 형식만 허용한다", () => {
    const bad = {
      doc_type: "bill",
      full_text: "x",
      deadline: "10/20",
      amount: null,
      place: null,
      items: [],
      contact: null,
    };
    expect(ExtractLlmSchema.safeParse(bad).success).toBe(false);
  });

  it("explain 요청에서 level은 easy/normal만 허용한다", () => {
    const req = {
      docType: "bill",
      maskedText: "본문",
      fields: extractFixture.fields,
      level: "hard",
    };
    expect(ExplainRequestSchema.safeParse(req).success).toBe(false);
  });
});

describe("chat fixture", () => {
  it("MOCK 답변의 근거 문장은 모두 예시 원문에 실제로 있다", async () => {
    const chat = (await import("@/fixtures/chat.json")).default;
    for (const a of chat.answers) expect(extractFixture.maskedText).toContain(a.evidence);
  });
});

describe("요청 크기 제한", () => {
  it("아주 긴 원문은 explain·chat 요청에서 거절한다", async () => {
    const { ChatRequestSchema } = await import("@/lib/schema");
    const long = "가".repeat(20_001);
    expect(ChatRequestSchema.safeParse({ maskedText: long, question: "q" }).success).toBe(false);
    expect(ChatRequestSchema.safeParse({ maskedText: "가".repeat(20_000), question: "q" }).success).toBe(true);
  });
});
