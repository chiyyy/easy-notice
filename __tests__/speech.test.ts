import { describe, expect, it } from "vitest";
import { buildSpeechLines, ddayToSpeech } from "@/lib/speech";

const base = {
  summary: ["주차 위반 과태료가 나왔어요", "11월 30일까지 내면 32,000원이에요.", "[개인정보] 차량이에요."],
  fields: { deadline: "2026-11-30", amount: 32000, place: null, items: [], contact: null },
  dday: { daysLeft: 10, label: "D-10" },
  todos: [{ task: "위택스에서 돈 내기", due: "2026-11-30" }],
  warnings: [],
};

describe("ddayToSpeech", () => {
  it("남은 날·오늘·지남을 말로 바꾼다", () => {
    expect(ddayToSpeech({ daysLeft: 3, label: "D-3" })).toBe("3일 남았어요.");
    expect(ddayToSpeech({ daysLeft: 0, label: "D-day" })).toBe("오늘까지예요.");
    expect(ddayToSpeech({ daysLeft: -2, label: "기한 지남" })).toBe("기한이 지났어요.");
  });
});

describe("buildSpeechLines", () => {
  it("문서 종류 → 요약 → 기한·금액 → 할 일 순서로 읽는다", () => {
    expect(buildSpeechLines("고지서", base)).toEqual([
      "고지서 내용이에요.",
      "주차 위반 과태료가 나왔어요.",
      "11월 30일까지 내면 32,000원이에요.",
      "가려진 정보 차량이에요.",
      "기한은 11월 30일이에요. 10일 남았어요.",
      "금액은 32,000원이에요.",
      "해야 할 일이에요.",
      "1. 위택스에서 돈 내기.",
    ]);
  });

  it("값이 없는 항목은 건너뛰고, 주의할 점은 있을 때만 읽는다", () => {
    const lines = buildSpeechLines("안내문", {
      ...base,
      fields: { ...base.fields, deadline: null, amount: null },
      dday: null,
      todos: [],
      warnings: ["신분증을 꼭 챙겨요"],
    });
    expect(lines.some((l) => l.startsWith("기한") || l.startsWith("금액") || l.startsWith("해야"))).toBe(false);
    expect(lines.slice(-2)).toEqual(["주의할 점이에요.", "신분증을 꼭 챙겨요."]);
  });

  it("[개인정보] 표시를 그대로 읽지 않는다", () => {
    expect(buildSpeechLines("고지서", base).join(" ")).not.toContain("[개인정보]");
  });
});
