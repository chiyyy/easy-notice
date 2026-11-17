import { describe, expect, it } from "vitest";
import extractFixture from "@/fixtures/extract.json";
import explainFixture from "@/fixtures/explain.json";
import {
  ExplainLlmSchema,
  ExplainRequestSchema,
  ExtractResponseSchema,
  OllamaExtractSchema,
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

  it("고지서 예시 값: 40,000원, 2026-10-20 기한", () => {
    const { fields } = ExtractResponseSchema.parse(extractFixture);
    expect(fields.amount).toBe(40000);
    expect(fields.deadline).toBe("2026-10-20");
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
    expect(OllamaExtractSchema.safeParse(bad).success).toBe(false);
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
