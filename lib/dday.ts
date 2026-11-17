import type { Dday } from "./schema";

/** Asia/Seoul 기준 오늘 날짜(YYYY-MM-DD) */
export function todayInSeoul(now: Date = new Date()): string {
  // en-CA 로케일은 YYYY-MM-DD 형식으로 출력된다
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function toUtcDays(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/** 기한(YYYY-MM-DD)까지의 D-day. 오늘=D-day, 지난 날짜는 "기한 지남". */
export function calcDday(deadline: string | null, now: Date = new Date()): Dday | null {
  if (!deadline || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return null;
  const daysLeft = toUtcDays(deadline) - toUtcDays(todayInSeoul(now));
  if (Number.isNaN(daysLeft)) return null;
  const label = daysLeft > 0 ? `D-${daysLeft}` : daysLeft === 0 ? "D-day" : "기한 지남";
  return { daysLeft, label };
}
