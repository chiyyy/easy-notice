import { splitHighlights } from "@/lib/format";

/** 3줄 요약. 날짜·금액은 메인 컬러로 강조 */
export function SummaryCard({ docLabel, summary }: { docLabel: string; summary: string[] }) {
  return (
    <section className="px-5 pt-2 pb-7" aria-labelledby="summary-title">
      <p className="text-label font-medium text-brand">{docLabel}</p>
      <h2 id="summary-title" className="sr-only">
        한눈에 보기
      </h2>
      <ul className="mt-2 flex flex-col gap-2 text-heading leading-relaxed font-medium">
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
