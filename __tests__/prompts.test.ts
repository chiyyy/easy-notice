import { describe, expect, it } from "vitest";
import extractFixture from "@/fixtures/extract.json";
import { buildExplainInput, buildExplainInstructions } from "@/lib/prompts";
import { ExtractResponseSchema } from "@/lib/schema";

const { maskedText, fields } = ExtractResponseSchema.parse(extractFixture);

describe("buildExplainInstructions", () => {
  it("공통 규칙은 항상 들어간다", () => {
    for (const docType of ["bill", "contract", "notice", "medical", "other"] as const) {
      const p = buildExplainInstructions(docType, "easy");
      expect(p).toContain("지어내지 않는다");
      expect(p).toContain("[개인정보]");
      expect(p).toContain("~요");
      expect(p).toContain("summary: 정확히 3문장");
    }
  });

  it("문서 종류별 필수 항목", () => {
    expect(buildExplainInstructions("bill", "easy")).toContain("납부 기한");
    expect(buildExplainInstructions("bill", "easy")).toContain("감경");
    expect(buildExplainInstructions("contract", "easy")).toContain("특약사항");
    expect(buildExplainInstructions("contract", "easy")).toContain("불리할 수 있는 조항");
    expect(buildExplainInstructions("notice", "easy")).toContain("준비물");
    expect(buildExplainInstructions("other", "easy")).toContain("장소");
  });

  it("설명 수준에 따라 규칙이 바뀐다", () => {
    expect(buildExplainInstructions("bill", "easy")).toContain("30자 안팎");
    expect(buildExplainInstructions("bill", "easy")).not.toContain("괄호로 뜻");
    expect(buildExplainInstructions("bill", "normal")).toContain("괄호로 뜻");
    expect(buildExplainInstructions("bill", "normal")).not.toContain("30자 안팎");
  });
});

describe("buildExplainInput", () => {
  it("마스킹된 원문과 1차 값을 함께 넣는다", () => {
    const input = buildExplainInput(maskedText, fields);
    expect(input).toContain(maskedText);
    expect(input).toContain("기한: 2026-11-30");
    expect(input).toContain("금액: 32000원");
  });

  it("값이 없으면 '없음'", () => {
    const input = buildExplainInput("본문", { deadline: null, amount: null, place: null, items: [], contact: null });
    expect(input).toContain("기한: 없음");
    expect(input).toContain("준비물: 없음");
  });
});
