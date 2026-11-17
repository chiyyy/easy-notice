/** ⚠️ 주의 알림 (warnings가 있을 때만) */
export function WarningBox({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <section
      className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-orange-900"
      aria-label="주의할 점"
    >
      <ul className="flex flex-col gap-1">
        {warnings.map((w, i) => (
          <li key={i}>
            <span aria-hidden>⚠️ </span>
            {w}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 1차(원문)와 2차(쉬운 말) 결과의 날짜·금액이 달랐을 때 */
export function MismatchNotice() {
  return (
    <p role="note" className="rounded-xl bg-red-50 px-4 py-3 font-medium text-red-700">
      원문의 날짜·금액을 꼭 다시 확인해 주세요.
    </p>
  );
}

export function Disclaimer() {
  return (
    <p className="px-2 text-center text-sm text-slate-500">
      AI가 만든 설명이에요. 중요한 내용은 원문을 꼭 확인하세요.
    </p>
  );
}
