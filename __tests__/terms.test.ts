import { describe, expect, it } from "vitest";
import { MASK } from "@/lib/mask";
import { splitByTerms } from "@/lib/terms";

const join = (parts: { text: string }[]) => parts.map((p) => p.text).join("");

describe("splitByTerms", () => {
  it("용어가 나오는 모든 위치를 표시하고 원문을 그대로 보존한다", () => {
    const text = "과태료를 내요. 과태료는 감경돼요.";
    const parts = splitByTerms(text, ["과태료", "감경"]);
    expect(join(parts)).toBe(text);
    expect(parts.filter((p) => p.kind === "term").map((p) => p.text)).toEqual(["과태료", "과태료", "감경"]);
  });

  it("긴 용어를 먼저 맞춘다", () => {
    const parts = splitByTerms("과태료 금액: 40,000원", ["과태료", "과태료 금액"]);
    expect(parts[0]).toEqual({ kind: "term", text: "과태료 금액", termIndex: 1 });
  });

  it("[개인정보]는 따로 표시한다", () => {
    const parts = splitByTerms(`납부자: ${MASK}`, []);
    expect(parts).toEqual([
      { kind: "text", text: "납부자: " },
      { kind: "mask", text: MASK },
    ]);
  });

  it("정규식 특수문자가 있는 용어도 안전하다", () => {
    const text = "위택스(카드·계좌이체)로 내요";
    const parts = splitByTerms(text, ["위택스(카드·계좌이체)"]);
    expect(parts[0]).toMatchObject({ kind: "term", text: "위택스(카드·계좌이체)" });
    expect(join(parts)).toBe(text);
  });

  it("용어가 없으면 원문 한 조각", () => {
    expect(splitByTerms("본문", [])).toEqual([{ kind: "text", text: "본문" }]);
    expect(splitByTerms("본문", [""])).toEqual([{ kind: "text", text: "본문" }]);
  });
});
