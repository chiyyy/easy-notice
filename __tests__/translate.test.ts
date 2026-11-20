import { describe, expect, it } from "vitest";
import translateFixture from "@/fixtures/translate.json";
import explainFixture from "@/fixtures/explain.json";
import { buildTranslateInput, buildTranslateInstructions } from "@/lib/prompts";
import { LangSchema, TranslateWireSchema, translateStrictSchema, type Translatable } from "@/lib/schema";
import { ddayFor, formatAmountFor, formatDateFor } from "@/lib/translate-ui";
import { amountsKept, cleanKoreanGloss } from "@/lib/validate";

const src: Translatable = {
  summary: explainFixture.summary,
  todos: explainFixture.todos,
  warnings: explainFixture.warnings,
};

describe("amountsKept", () => {
  it("만·천 단위 금액이 번역문에 숫자로 있으면 통과 (콤마·점 구분 모두)", () => {
    expect(amountsKept(["3만 2천 원만 내면 돼요."], ["You only pay 32,000 won."])).toBe(true);
    expect(amountsKept(["32,000원 내기"], ["Nộp 32.000 won"])).toBe(true);
    expect(amountsKept(["과태료 4만 원"], ["罚款40,000韩元"])).toBe(true);
  });

  it("금액이 바뀌거나 빠지면 실패", () => {
    expect(amountsKept(["3만 2천 원만 내면 돼요."], ["You only pay 3,200 won."])).toBe(false);
    expect(amountsKept(["32,000원 내기"], ["Pay the fine"])).toBe(false);
  });

  it("금액이 없는 문장은 검사하지 않는다", () => {
    expect(amountsKept(["11월 30일까지 내요."], ["Pay by November 30."])).toBe(true);
  });
});

describe("translateStrictSchema", () => {
  it("문장 개수가 원본과 다르면 실패", () => {
    const schema = translateStrictSchema(src);
    expect(schema.safeParse({ summary: ["a", "b"], todos: ["a", "b", "c"], warnings: ["a"] }).success).toBe(false);
    expect(schema.safeParse({ summary: ["a", "b", "c"], todos: ["a", "b", "c"], warnings: ["a"] }).success).toBe(true);
  });
});

describe("번역 fixture", () => {
  it("세 언어 모두 원본과 문장 개수가 같고 금액이 유지된다", () => {
    for (const lang of LangSchema.options) {
      const t = TranslateWireSchema.parse(translateFixture[lang]);
      expect(translateStrictSchema(src).safeParse(t).success).toBe(true);
      expect(amountsKept(src.summary, t.summary)).toBe(true);
      expect(amountsKept(src.todos.map((x) => x.task), t.todos)).toBe(true);
    }
  });
});

describe("번역 프롬프트", () => {
  it("입력에는 문장만 넣고 기한 날짜는 넣지 않는다", () => {
    const input = JSON.parse(buildTranslateInput(src));
    expect(input.todos).toEqual(src.todos.map((t) => t.task));
    expect(buildTranslateInput(src)).not.toContain("2026-11-30");
  });

  it("언어별로 원어 병기·개수 유지 규칙이 들어 있다", () => {
    for (const lang of LangSchema.options) {
      const text = buildTranslateInstructions(lang);
      expect(text).toContain("같은 개수, 같은 순서");
      expect(text).toContain("괄호에 한국어 원어");
      expect(text).toContain("[개인정보]");
    }
  });
});

describe("번역 화면 표기", () => {
  it("날짜", () => {
    expect(formatDateFor("en", "2026-11-30")).toBe("November 30");
    expect(formatDateFor("zh", "2026-11-30")).toBe("11月30日");
    expect(formatDateFor("vi", "2026-11-30")).toMatch(/30 tháng 11/);
  });

  it("금액", () => {
    expect(formatAmountFor("en", 32000)).toBe("32,000 won");
    expect(formatAmountFor("zh", 32000)).toBe("32,000韩元");
    expect(formatAmountFor("vi", 32000)).toBe("32.000 won");
  });

  it("D-day", () => {
    expect(ddayFor("en", { daysLeft: 1, label: "D-1" })).toBe("1 day left");
    expect(ddayFor("en", { daysLeft: 10, label: "D-10" })).toBe("10 days left");
    expect(ddayFor("zh", { daysLeft: 0, label: "D-day" })).toBe("今天截止");
    expect(ddayFor("vi", { daysLeft: -1, label: "기한 지남" })).toBe("Đã quá hạn");
  });
});

describe("cleanKoreanGloss", () => {
  const src = "억울하면 기한 안에 의견진술서 내기";
  it("원문에 있는 한국어 원어는 그대로 둔다", () => {
    expect(cleanKoreanGloss("submit a statement (의견진술서)", src)).toBe("submit a statement (의견진술서)");
    expect(cleanKoreanGloss("提交意见陈述书（의견진술서）", src)).toBe("提交意见陈述书（의견진술서）");
  });
  it("섞여 나왔거나 원문에 없는 말이면 괄호째 지운다", () => {
    expect(cleanKoreanGloss("提交意见陈述书（意见진술서）", src)).toBe("提交意见陈述书");
    expect(cleanKoreanGloss("nộp ý kiến (ý kiến진술서) trong thời hạn", src)).toBe("nộp ý kiến trong thời hạn");
    expect(cleanKoreanGloss("pay the fine (과태료)", src)).toBe("pay the fine");
  });
  it("한국어가 없는 괄호는 건드리지 않는다", () => {
    expect(cleanKoreanGloss("pay by card (or bank transfer)", src)).toBe("pay by card (or bank transfer)");
  });
});
