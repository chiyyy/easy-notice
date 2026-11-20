// 번역 탭 화면 문구·날짜·금액 표기 (언어별). 순수 함수.
import type { Dday, Lang } from "./schema";

export const LANGS: { code: Lang; name: string; korean: string }[] = [
  { code: "en", name: "English", korean: "영어" },
  { code: "zh", name: "中文", korean: "중국어" },
  { code: "vi", name: "Tiếng Việt", korean: "베트남어" },
];

type UiText = {
  summary: string;
  info: string;
  deadline: string;
  amount: string;
  todos: string;
  warnings: string;
  disclaimer: string;
  numberMismatch: string;
};

export const UI_TEXT: Record<Lang, UiText> = {
  en: {
    summary: "Summary",
    info: "Key information",
    deadline: "Deadline",
    amount: "Amount",
    todos: "What to do",
    warnings: "Be careful",
    disclaimer: "Translated by AI. Please check the original document for important details.",
    numberMismatch: "Some numbers may differ from the original. Please check the Korean summary.",
  },
  zh: {
    summary: "摘要",
    info: "重要信息",
    deadline: "截止日期",
    amount: "金额",
    todos: "需要做的事",
    warnings: "注意事项",
    disclaimer: "本内容由AI翻译。重要内容请务必确认原文。",
    numberMismatch: "部分数字可能与原文不同，请确认韩语摘要。",
  },
  vi: {
    summary: "Tóm tắt",
    info: "Thông tin chính",
    deadline: "Hạn chót",
    amount: "Số tiền",
    todos: "Việc cần làm",
    warnings: "Lưu ý",
    disclaimer: "Bản dịch do AI thực hiện. Hãy kiểm tra bản gốc với các nội dung quan trọng.",
    numberMismatch: "Một số con số có thể khác bản gốc. Hãy kiểm tra bản tóm tắt tiếng Hàn.",
  },
};

const LOCALE: Record<Lang, string> = { en: "en-US", zh: "zh-CN", vi: "vi-VN" };

/** "2026-11-30" → "November 30" / "11月30日" / "30 tháng 11" (시간대 영향 없게 UTC로) */
export function formatDateFor(lang: Lang, isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat(LOCALE[lang], { month: "long", day: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

/** 32000 → "32,000 won" / "32,000韩元" / "32.000 won" */
export function formatAmountFor(lang: Lang, amount: number): string {
  const n = new Intl.NumberFormat(LOCALE[lang]).format(amount);
  return lang === "zh" ? `${n}韩元` : `${n} won`;
}

/** D-day → "10 days left" / "还剩10天" / "Còn 10 ngày" */
export function ddayFor(lang: Lang, dday: Dday): string {
  const n = dday.daysLeft;
  if (n > 0) return { en: `${n} day${n === 1 ? "" : "s"} left`, zh: `还剩${n}天`, vi: `Còn ${n} ngày` }[lang];
  if (n === 0) return { en: "Due today", zh: "今天截止", vi: "Hạn hôm nay" }[lang];
  return { en: "Overdue", zh: "已过期", vi: "Đã quá hạn" }[lang];
}
