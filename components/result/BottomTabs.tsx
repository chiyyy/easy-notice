import { BookOpen, FileText, MessageCircle, type LucideIcon } from "lucide-react";

// 번역 탭은 기능이 완성되면 다시 추가한다 (Phase 7)
export type TabKey = "summary" | "source" | "chat";

export const TABS: { key: TabKey; Icon: LucideIcon; label: string }[] = [
  { key: "summary", Icon: FileText, label: "요약" },
  { key: "source", Icon: BookOpen, label: "어려운 말" },
  { key: "chat", Icon: MessageCircle, label: "질문하기" },
];

/** 결과 화면 하단 탭 */
export function BottomTabs({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav
      className="sticky bottom-0 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]"
      aria-label="결과 보기 방식"
    >
      <ul className="grid grid-cols-3" role="tablist">
        {TABS.map(({ key, Icon, label }) => {
          const selected = key === active;
          return (
            <li key={key} className="flex">
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${key}`}
                id={`tab-${key}`}
                onClick={() => onChange(key)}
                className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-caption ${
                  selected ? "font-semibold text-ink" : "text-muted"
                }`}
              >
                <Icon className={`size-[1.375rem] ${selected ? "text-brand" : ""}`} strokeWidth={selected ? 2.2 : 1.8} aria-hidden />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
