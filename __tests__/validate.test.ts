import { describe, expect, it } from "vitest";
import explainFixture from "@/fixtures/explain.json";
import extractFixture from "@/fixtures/extract.json";
import { ExplainLlmSchema, ExtractResponseSchema, type ExplainLlm } from "@/lib/schema";
import { checkExplain, findAmounts, findDates, parseKoreanAmount, verifyEvidence } from "@/lib/validate";

const llm = ExplainLlmSchema.parse(explainFixture);
const { maskedText, fields } = ExtractResponseSchema.parse(extractFixture);

describe("findDates", () => {
  it("여러 형식을 MM-DD로 모은다", () => {
    expect([...findDates("2026-11-30, 2026. 12. 1., 11월 30일까지, 1/5")]).toEqual(["11-30", "12-01", "01-05"]);
  });

  it("시각·금액은 날짜로 보지 않는다", () => {
    expect(findDates("14:12에 40,000원").size).toBe(0);
  });
});

describe("parseKoreanAmount / findAmounts", () => {
  it("한글 단위", () => {
    expect(parseKoreanAmount("3만 2천 원")).toBe(32000);
    expect(parseKoreanAmount("4만 원")).toBe(40000);
    expect(parseKoreanAmount("1억 2,000만 원")).toBe(120_000_000);
  });

  it("콤마 숫자", () => {
    expect([...findAmounts("과태료 40,000원, 감경 시 32,000원")]).toEqual([40000, 32000]);
  });

  it("퍼센트는 금액이 아니다", () => {
    expect(findAmounts("20% 감경").size).toBe(0);
  });
});

describe("checkExplain", () => {
  it("fixture(정상 결과)는 불일치가 없다", () => {
    const { mismatchWarning, result } = checkExplain(llm, maskedText, fields);
    expect(mismatchWarning).toBe(false);
    expect(result.todos).toEqual(llm.todos);
  });

  it("원문에 없는 금액이 요약에 나오면 불일치", () => {
    const bad: ExplainLlm = { ...llm, summary: ["과태료 5만 원이 나왔어요.", llm.summary[1], llm.summary[2]] };
    expect(checkExplain(bad, maskedText, fields).mismatchWarning).toBe(true);
  });

  it("원문에 없는 날짜의 due는 지우고 불일치로 표시", () => {
    const bad: ExplainLlm = { ...llm, todos: [{ task: "돈 내기", due: "2026-12-25" }] };
    const { mismatchWarning, result } = checkExplain(bad, maskedText, fields);
    expect(mismatchWarning).toBe(true);
    expect(result.todos[0].due).toBeNull();
  });

  it("원문에 없는 용어는 뺀다", () => {
    const withFake: ExplainLlm = {
      ...llm,
      terms: [...llm.terms, { word: "체납처분", meaning: "x", example: null }],
    };
    const { result } = checkExplain(withFake, maskedText, fields);
    expect(result.terms.map((t) => t.word)).not.toContain("체납처분");
    expect(result.terms).toHaveLength(llm.terms.length);
  });
});

describe("verifyEvidence", () => {
  it("원문에 있는 문장은 그대로 통과 (공백 차이 무시)", () => {
    expect(verifyEvidence("납부방법: 금융기관,  위택스(카드·계좌이체), 가상계좌", maskedText)).toBe(
      "납부방법: 금융기관, 위택스(카드·계좌이체), 가상계좌",
    );
  });

  it("앞뒤 따옴표는 벗겨서 확인", () => {
    expect(verifyEvidence('"과태료 금액: 40,000원"', maskedText)).toBe("과태료 금액: 40,000원");
  });

  it("고쳐 쓴 문장이나 없는 문장은 null", () => {
    expect(verifyEvidence("카드로 낼 수 있습니다", maskedText)).toBeNull();
    expect(verifyEvidence(null, maskedText)).toBeNull();
    expect(verifyEvidence("", maskedText)).toBeNull();
  });
});
