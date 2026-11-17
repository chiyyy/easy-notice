export type TabKey = "summary" | "source" | "chat" | "translate";

export const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: "summary", icon: "📋", label: "요약" },
  { key: "source", icon: "📖", label: "원문·용어" },
  { key: "chat", icon: "💬", label: "질문하기" },
  { key: "translate", icon: "🌐", label: "번역" },
];

/** 결과 화면 하단 탭 */
export function BottomTabs({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav className="sticky bottom-0 border-t border-slate-200 bg-white" aria-label="결과 보기 방식">
      <ul className="grid grid-cols-4" role="tablist">
        {TABS.map((tab) => {
          const selected = tab.key === active;
          return (
            <li key={tab.key} className="flex">
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${tab.key}`}
                id={`tab-${tab.key}`}
                onClick={() => onChange(tab.key)}
                className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
                  selected ? "font-bold text-brand" : "text-slate-500"
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
