import { formatAmount, formatShortDate } from "@/lib/format";
import type { Dday, Fields } from "@/lib/schema";

type Row = { label: string; value: string; badge?: string };

/** 핵심 정보: 기한(D-day) / 금액 / 내는 곳 / 문의. 라벨-값 목록, 값이 없으면 숨김. */
export function InfoCards({ fields, dday }: { fields: Fields; dday: Dday | null }) {
  const rows: Row[] = [];
  if (fields.deadline) rows.push({ label: "기한", value: formatShortDate(fields.deadline), badge: dday?.label });
  if (fields.amount !== null) rows.push({ label: "금액", value: formatAmount(fields.amount) });
  if (fields.place) rows.push({ label: "내는 곳", value: fields.place });
  if (fields.contact) rows.push({ label: "문의", value: fields.contact });
  if (rows.length === 0) return null;

  return (
    <section className="px-5 py-6" aria-labelledby="info-title">
      <h2 id="info-title" className="text-heading font-bold">
        핵심 정보
      </h2>
      <dl className="mt-3">
        {rows.map((row) => (
          <div key={row.label} className="flex min-h-11 items-baseline justify-between gap-4 py-2">
            <dt className="shrink-0 text-body text-sub">{row.label}</dt>
            <dd className="text-right text-body font-semibold break-words">
              {row.value}
              {/* 기한 임박 표시는 놓치면 손해라 예외적으로 빨간색 */}
              {row.badge && <span className="ml-2 text-red-600">{row.badge}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
