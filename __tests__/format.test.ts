import { describe, expect, it } from "vitest";
import { formatAmount, formatShortDate, splitHighlights } from "@/lib/format";
import { fitSize } from "@/lib/image";

const strongParts = (text: string) => splitHighlights(text).filter((p) => p.strong).map((p) => p.text);

describe("splitHighlights", () => {
  it("금액(만·천 단위, 콤마)과 날짜를 강조한다", () => {
    expect(strongParts("주정차 위반으로 과태료 4만 원이 나왔어요.")).toEqual(["4만 원"]);
    expect(strongParts("11월 30일까지 내면 3만 2천 원만 내면 돼요.")).toEqual(["11월 30일까지", "3만 2천 원"]);
    expect(strongParts("40,000원, 기한 2026-11-30")).toEqual(["40,000원", "2026-11-30"]);
  });

  it("조각을 이어 붙이면 원문과 같다", () => {
    const text = "11월 30일까지 32,000원 내기";
    expect(splitHighlights(text).map((p) => p.text).join("")).toBe(text);
  });

  it("퍼센트나 숫자만 있는 건 강조하지 않는다", () => {
    expect(strongParts("20% 깎아 줘요. 제32조")).toEqual([]);
  });
});

describe("formatAmount / formatShortDate", () => {
  it("천 단위 콤마", () => {
    expect(formatAmount(32000)).toBe("32,000원");
    expect(formatAmount(1234567)).toBe("1,234,567원");
    expect(formatAmount(0)).toBe("0원");
  });

  it("YYYY-MM-DD → M월 D일", () => {
    expect(formatShortDate("2026-11-30")).toBe("11월 30일");
    expect(formatShortDate("2026-01-05")).toBe("1월 5일");
  });
});

describe("fitSize", () => {
  it("긴 변을 1600px로 맞추고 비율을 유지한다", () => {
    expect(fitSize(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitSize(3000, 4000)).toEqual({ width: 1200, height: 1600 });
  });

  it("이미 작으면 그대로", () => {
    expect(fitSize(1200, 800)).toEqual({ width: 1200, height: 800 });
  });
});
