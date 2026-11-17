import { formatAmount, formatShortDate } from "@/lib/format";
import type { Dday, Fields } from "@/lib/schema";

type Card = { icon: string; label: string; value: string; badge?: string };

/** 핵심 정보 2×2: 기한(D-day) / 금액 / 내는 곳 / 문의. 값이 없으면 숨김. */
export function InfoCards({ fields, dday }: { fields: Fields; dday: Dday | null }) {
  const cards: Card[] = [];
  if (fields.deadline)
    cards.push({ icon: "📅", label: "기한", value: formatShortDate(fields.deadline), badge: dday?.label });
  if (fields.amount !== null) cards.push({ icon: "💰", label: "금액", value: formatAmount(fields.amount) });
  if (fields.place) cards.push({ icon: "🏦", label: "내는 곳·장소", value: fields.place });
  if (fields.contact) cards.push({ icon: "☎", label: "문의", value: fields.contact });
  if (cards.length === 0) return null;

  return (
    <section aria-label="핵심 정보">
      <dl className="grid grid-cols-2 gap-2">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-slate-50 px-3 py-3">
            <dt className="text-sm text-slate-500">
              <span aria-hidden>{card.icon} </span>
              {card.label}
            </dt>
            <dd className="mt-1 font-bold break-words">
              {card.value}
              {card.badge && <span className="ml-1.5 text-red-600">{card.badge}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
