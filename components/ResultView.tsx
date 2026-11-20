"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { docTypeLabel } from "@/lib/format";
import { buildSpeechLines } from "@/lib/speech";
import type { ExplainResponse, ExtractResponse } from "@/lib/schema";
import { useAnalysis } from "@/lib/store";
import { suggestionsFor } from "@/lib/suggestions";
import { useChat } from "@/lib/use-chat";
import { useTranslate } from "@/lib/use-translate";
import { BackButton } from "./BackButton";
import { FontSizeToggle } from "./FontSizeToggle";
import { BottomTabs, TABS, type TabKey } from "./result/BottomTabs";
import { ChatTab } from "./result/ChatTab";
import { InfoCards } from "./result/InfoCards";
import { ListenButton } from "./result/ListenButton";
import { Disclaimer, MismatchNotice, SectionDivider, WarningBox } from "./result/Notices";
import { SummaryCard } from "./result/SummaryCard";
import { TodoList } from "./result/TodoList";
import { TranslateTab } from "./result/TranslateTab";
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
  const { level } = useAnalysis();
  // 대화는 여기서 들고 있어서 탭을 바꿔도 남는다
  const chat = useChat(extract.maskedText, level);
  // 번역도 여기서 들고 있어서 탭을 바꿔도 다시 요청하지 않는다
  const translateSource = useMemo(
    () => ({ summary: explain.summary, todos: explain.todos, warnings: explain.warnings }),
    [explain],
  );
  const translation = useTranslate(translateSource);
  const tabLabel = TABS.find((t) => t.key === tab)?.label ?? "";
  const docLabel = docTypeLabel(extract.docType);
  const speechLines = useMemo(() => buildSpeechLines(docLabel, explain), [docLabel, explain]);

  function changeTab(next: TabKey) {
    setTab(next);
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-1 bg-white pr-2 pl-1">
        <BackButton label="처음으로 돌아가서 다른 문서 찍기" onClick={onBack} />
        <h1 className="flex-1 truncate text-heading font-bold">{tab === "summary" ? "읽은 결과" : tabLabel}</h1>
        <FontSizeToggle />
      </header>

      <main id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="flex flex-1 flex-col">
        {tab === "summary" && (
          <>
            {explain.mismatchWarning && <MismatchNotice />}
            <SummaryCard
              docLabel={docLabel}
              summary={explain.summary}
              action={<ListenButton lines={speechLines} />}
            />
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
        {tab === "chat" && (
          <ChatTab
            entries={chat.entries}
            pending={chat.pending}
            suggestions={suggestionsFor(extract.docType)}
            onSend={chat.send}
          />
        )}
        {tab === "translate" && (
          <TranslateTab
            lang={translation.lang}
            current={translation.current}
            onChoose={translation.choose}
            onRetry={translation.retry}
            fields={explain.fields}
            dday={explain.dday}
          />
        )}
      </main>

      <BottomTabs active={tab} onChange={changeTab} />
    </>
  );
}
