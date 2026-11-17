import { splitHighlights } from "@/lib/format";

/** 한눈에 보기: 3줄 요약, 날짜·금액은 굵은 파란색 */
export function SummaryCard({ summary }: { summary: string[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 p-4" aria-labelledby="summary-title">
      <h2 id="summary-title" className="mb-2 text-sm font-bold text-slate-500">
        한눈에 보기
      </h2>
      <ul className="flex flex-col gap-2 text-lg leading-relaxed">
        {summary.map((line, i) => (
          <li key={i}>
            {splitHighlights(line).map((part, j) =>
              part.strong ? (
                <strong key={j} className="font-bold text-brand">
                  {part.text}
                </strong>
              ) : (
                <span key={j}>{part.text}</span>
              ),
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
