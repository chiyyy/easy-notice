import { describe, expect, it } from "vitest";
import { calcDday, todayInSeoul } from "@/lib/dday";

// 2026-10-14 10:00 KST = 2026-10-14 01:00 UTC
const now = new Date("2026-10-14T01:00:00Z");

describe("todayInSeoul", () => {
  it("UTC로는 전날이어도 서울 기준 날짜를 돌려준다", () => {
    // 2026-10-13 16:00 UTC = 2026-10-14 01:00 KST
    expect(todayInSeoul(new Date("2026-10-13T16:00:00Z"))).toBe("2026-10-14");
  });
});

describe("calcDday", () => {
  it("남은 날짜", () => {
    expect(calcDday("2026-10-20", now)).toEqual({ daysLeft: 6, label: "D-6" });
  });

  it("오늘이 기한이면 D-day", () => {
    expect(calcDday("2026-10-14", now)).toEqual({ daysLeft: 0, label: "D-day" });
  });

  it("지난 날짜는 기한 지남", () => {
    expect(calcDday("2026-10-13", now)).toEqual({ daysLeft: -1, label: "기한 지남" });
  });

  it("월이 바뀌어도 정확하다", () => {
    expect(calcDday("2026-11-02", now)?.daysLeft).toBe(19);
  });

  it("null이나 잘못된 형식은 null", () => {
    expect(calcDday(null, now)).toBeNull();
    expect(calcDday("10/20", now)).toBeNull();
  });
});
