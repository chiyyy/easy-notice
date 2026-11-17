/** 주의할 점 (warnings가 있을 때만) */
export function WarningBox({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <section className="px-5 py-6" aria-labelledby="warning-title">
      <h2 id="warning-title" className="text-heading font-bold">
        주의할 점
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {warnings.map((w, i) => (
          <li key={i} className="flex gap-2 text-body leading-relaxed">
            <span className="text-muted" aria-hidden>
              ·
            </span>
            <span>{w}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 1차(원문)와 2차(쉬운 말) 결과의 날짜·금액이 달랐을 때 */
export function MismatchNotice() {
  return (
    <p role="note" className="mx-5 mb-2 border-l-2 border-red-600 pl-3 text-label font-medium text-red-600">
      원문의 날짜·금액을 꼭 다시 확인해 주세요.
    </p>
  );
}

export function Disclaimer() {
  return (
    <p className="px-5 pt-2 pb-8 text-caption leading-relaxed text-muted">
      AI가 만든 설명이에요. 중요한 내용은 원문을 꼭 확인하세요.
    </p>
  );
}

/** 섹션 사이 굵은 구분 (그림자·카드 대신) */
export function SectionDivider() {
  return <div className="h-2 bg-canvas" aria-hidden />;
}
