import { splitHighlights } from "@/lib/format";

/** 3줄 요약. 날짜·금액은 메인 컬러로 강조 */
export function SummaryCard({
  docLabel,
  summary,
  action,
}: {
  docLabel: string;
  summary: string[];
  /** 문서 종류 오른쪽에 둘 버튼 (소리로 듣기) */
  action?: React.ReactNode;
}) {
  return (
    <section className="px-5 pt-2 pb-7" aria-labelledby="summary-title">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <p className="text-label font-medium text-brand">{docLabel}</p>
        {action}
      </div>
      <h2 id="summary-title" className="sr-only">
        한눈에 보기
      </h2>
      <ul className="mt-1 flex flex-col gap-2 text-heading leading-relaxed font-medium">
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
