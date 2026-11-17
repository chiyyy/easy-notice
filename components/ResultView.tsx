"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { docTypeLabel } from "@/lib/format";
import type { ExplainResponse, ExtractResponse } from "@/lib/schema";
import { useAnalysis } from "@/lib/store";
import { BackButton } from "./BackButton";
import { BottomTabs, TABS, type TabKey } from "./result/BottomTabs";
import { InfoCards } from "./result/InfoCards";
import { Disclaimer, MismatchNotice, SectionDivider, WarningBox } from "./result/Notices";
import { SummaryCard } from "./result/SummaryCard";
import { TodoList } from "./result/TodoList";
import { WordsTab } from "./result/WordsTab";

export function ResultView() {
  const router = useRouter();
  const { extract, explain, reset, runId } = useAnalysis();

  // 새로고침 등으로 결과가 없으면 홈으로
  useEffect(() => {
    if (!explain) router.replace("/");
  }, [explain, router]);

  if (!explain || !extract) return null;

  function goHome() {
    reset();
    router.push("/");
  }

  // key={runId}: 새 문서를 분석하면 탭·체크·팝업 상태를 처음부터 시작한다
  return <ResultContent key={runId} extract={extract} explain={explain} onBack={goHome} />;
}

function ResultContent({
  extract,
  explain,
  onBack,
}: {
  extract: ExtractResponse;
  explain: ExplainResponse;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<TabKey>("summary");
  const tabLabel = TABS.find((t) => t.key === tab)?.label ?? "";

  function changeTab(next: TabKey) {
    setTab(next);
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-1 bg-white px-1">
        <BackButton label="처음으로 돌아가서 다른 문서 찍기" onClick={onBack} />
        <h1 className="text-heading font-bold">{tab === "summary" ? "읽은 결과" : tabLabel}</h1>
      </header>

      <main id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="flex flex-1 flex-col">
        {tab === "summary" && (
          <>
            {explain.mismatchWarning && <MismatchNotice />}
            <SummaryCard docLabel={docTypeLabel(extract.docType)} summary={explain.summary} />
            <SectionDivider />
            <InfoCards fields={explain.fields} dday={explain.dday} />
            <SectionDivider />
            <TodoList todos={explain.todos} />
            {explain.warnings.length > 0 && <SectionDivider />}
            <WarningBox warnings={explain.warnings} />
            <Disclaimer />
          </>
        )}
        {tab === "source" && (
          <>
            <WordsTab maskedText={extract.maskedText} terms={explain.terms} paragraphs={explain.paragraphs} />
            <Disclaimer />
          </>
        )}
        {(tab === "chat" || tab === "translate") && (
          <div className="px-5 pt-16 text-center">
            <p className="text-body font-semibold">아직 준비 중이에요</p>
            <p className="mt-1 text-label text-muted">{tabLabel} 기능은 곧 추가돼요.</p>
          </div>
        )}
      </main>

      <BottomTabs active={tab} onChange={changeTab} />
    </>
  );
}
