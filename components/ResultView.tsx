"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { docTypeLabel } from "@/lib/format";
import { useAnalysis } from "@/lib/store";
import { BottomTabs, TABS, type TabKey } from "./result/BottomTabs";
import { InfoCards } from "./result/InfoCards";
import { Disclaimer, MismatchNotice, WarningBox } from "./result/Notices";
import { SummaryCard } from "./result/SummaryCard";
import { TodoList } from "./result/TodoList";

export function ResultView() {
  const router = useRouter();
  const { extract, explain, reset } = useAnalysis();
  const [tab, setTab] = useState<TabKey>("summary");

  // 새로고침 등으로 결과가 없으면 홈으로
  useEffect(() => {
    if (!explain) router.replace("/");
  }, [explain, router]);

  if (!explain || !extract) return null;

  function goHome() {
    reset();
    router.push("/");
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-100 bg-white px-2 py-2">
        <button
          type="button"
          onClick={goHome}
          aria-label="처음으로 돌아가서 다른 문서 찍기"
          className="min-h-11 min-w-11 rounded-lg text-xl hover:bg-slate-100"
        >
          ←
        </button>
        <h1 className="text-lg font-bold">결과</h1>
        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-800">
          {docTypeLabel(extract.docType)}
        </span>
      </header>

      <main id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="flex flex-1 flex-col gap-4 px-4 py-4">
        {tab === "summary" ? (
          <>
            {explain.mismatchWarning && <MismatchNotice />}
            <SummaryCard summary={explain.summary} />
            <InfoCards fields={explain.fields} dday={explain.dday} />
            <TodoList todos={explain.todos} />
            <WarningBox warnings={explain.warnings} />
            <Disclaimer />
          </>
        ) : (
          <p className="py-16 text-center text-slate-500">
            {TABS.find((t) => t.key === tab)?.label} 기능은 준비 중이에요.
          </p>
        )}
      </main>

      <BottomTabs active={tab} onChange={setTab} />
    </>
  );
}
