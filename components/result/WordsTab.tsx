"use client";

import { ChevronDown } from "lucide-react";
import { useLayoutEffect, useMemo, useState } from "react";
import type { ExplainResponse } from "@/lib/schema";
import { findContext, splitByTerms } from "@/lib/terms";
import { SectionDivider } from "./Notices";
import { TermPopup } from "./TermPopup";

type Props = {
  maskedText: string;
  terms: ExplainResponse["terms"];
  paragraphs: ExplainResponse["paragraphs"];
};

/**
 * 어려운 말 탭
 * 1) 이 문서의 어려운 말 목록 (뜻 + 문서에서 쓰인 문장)
 * 2) 주제별 쉬운 설명
 * 3) 원문 전체 (접어 둠, 펼치면 용어를 눌러 뜻 보기)
 */
export function WordsTab({ maskedText, terms, paragraphs }: Props) {
  return (
    <>
      <TermList maskedText={maskedText} terms={terms} />
      {paragraphs.length > 0 && (
        <>
          <SectionDivider />
          <ParagraphList paragraphs={paragraphs} />
        </>
      )}
      <SectionDivider />
      <SourceText maskedText={maskedText} terms={terms} />
    </>
  );
}

function TermList({ maskedText, terms }: Pick<Props, "maskedText" | "terms">) {
  return (
    <section className="px-5 pt-2 pb-6" aria-labelledby="terms-title">
      <h2 id="terms-title" className="text-heading font-bold">
        이 문서의 어려운 말
        {terms.length > 0 && <span className="ml-1.5 font-semibold text-brand">{terms.length}</span>}
      </h2>
      {terms.length === 0 ? (
        <p className="mt-3 text-body text-sub">이 문서에는 따로 풀이할 어려운 말이 없어요.</p>
      ) : (
        <dl className="mt-1 divide-y divide-line">
          {terms.map((t) => {
            const context = findContext(maskedText, t.word);
            return (
              <div key={t.word} className="py-4">
                <dt className="text-heading font-bold">{t.word}</dt>
                <dd className="mt-1 text-body leading-relaxed">{t.meaning}</dd>
                {t.example && <dd className="mt-1.5 text-label leading-relaxed text-sub">예) {t.example}</dd>}
                {context && (
                  <dd className="mt-2 border-l-2 border-line pl-3 text-label leading-relaxed text-muted">
                    <span className="mr-1.5 font-medium text-sub">문서</span>
                    {context}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
}

function ParagraphList({ paragraphs }: Pick<Props, "paragraphs">) {
  return (
    <section className="px-5 py-6" aria-labelledby="para-title">
      <h2 id="para-title" className="text-heading font-bold">
        쉽게 풀어 보면
      </h2>
      <dl className="mt-1 divide-y divide-line">
        {paragraphs.map((p, i) => (
          <div key={i} className="py-4">
            <dt className="text-body font-semibold">{p.title}</dt>
            <dd className="mt-1.5 text-body leading-relaxed text-sub">{p.easy}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SourceText({ maskedText, terms }: Pick<Props, "maskedText" | "terms">) {
  const [open, setOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const parts = useMemo(() => splitByTerms(maskedText, terms.map((t) => t.word)), [maskedText, terms]);

  // 페이지를 떠나 화면이 숨겨질 때(React Activity) 팝업을 닫아 둔다. 돌아왔을 때 열린 채로 보이지 않게.
  useLayoutEffect(() => () => setOpenIndex(null), []);

  return (
    <section className="px-5 py-2" aria-labelledby="source-title">
      <h2 id="source-title">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="source-body"
          className="flex min-h-14 w-full items-center justify-between text-left"
        >
          <span>
            <span className="block text-heading font-bold">원문 전체 보기</span>
            <span className="block text-label font-normal text-muted">AI 설명이 맞는지 원문과 비교해 보세요</span>
          </span>
          <ChevronDown
            className={`size-5 shrink-0 text-sub transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </h2>

      {open && (
        <div id="source-body" className="pt-2 pb-4">
          {terms.length > 0 && <p className="text-label text-muted">초록색 말을 누르면 뜻을 볼 수 있어요.</p>}
          <p className="mt-3 text-body leading-[1.8] whitespace-pre-wrap">
            {parts.map((part, i) => {
              if (part.kind === "text") return <span key={i}>{part.text}</span>;
              if (part.kind === "mask")
                return (
                  <span key={i} className="rounded bg-canvas px-1 text-label text-muted">
                    가린 정보
                  </span>
                );
              return (
                <mark key={i} className="bg-transparent text-inherit">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(part.termIndex)}
                    aria-haspopup="dialog"
                    aria-label={`${part.text} 뜻 보기`}
                    className="rounded-sm bg-brand-soft px-0.5 font-semibold text-brand underline decoration-brand/40 decoration-dotted underline-offset-4"
                  >
                    {part.text}
                  </button>
                </mark>
              );
            })}
          </p>
        </div>
      )}

      <TermPopup term={openIndex === null ? null : (terms[openIndex] ?? null)} onClose={() => setOpenIndex(null)} />
    </section>
  );
}
