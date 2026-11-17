"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import type { ExplainResponse } from "@/lib/schema";
import { splitByTerms } from "@/lib/terms";
import { SectionDivider } from "./Notices";
import { TermPopup } from "./TermPopup";

/** 원문·용어 탭: 가린 원문 + 용어 하이라이트(누르면 풀이) + 주제별 쉬운 설명 */
export function SourceTab({
  maskedText,
  terms,
  paragraphs,
}: {
  maskedText: string;
  terms: ExplainResponse["terms"];
  paragraphs: ExplainResponse["paragraphs"];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const parts = useMemo(() => splitByTerms(maskedText, terms.map((t) => t.word)), [maskedText, terms]);

  // 페이지를 떠나 화면이 숨겨질 때(React Activity) 팝업을 닫아 둔다. 돌아왔을 때 열린 채로 보이지 않게.
  useLayoutEffect(() => () => setOpenIndex(null), []);

  return (
    <>
      <section className="px-5 pt-2 pb-7" aria-labelledby="source-title">
        <h2 id="source-title" className="text-heading font-bold">
          원문
        </h2>
        <p className="mt-1 text-label text-muted">
          {terms.length > 0 ? "밑줄 친 말을 누르면 뜻을 볼 수 있어요." : "어려운 말이 따로 없어요."}
        </p>
        <p className="mt-4 text-body leading-[1.8] whitespace-pre-wrap">
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
      </section>

      {paragraphs.length > 0 && (
        <>
          <SectionDivider />
          <section className="px-5 py-6" aria-labelledby="para-title">
            <h2 id="para-title" className="text-heading font-bold">
              쉽게 풀어 보면
            </h2>
            <dl className="mt-2 divide-y divide-line">
              {paragraphs.map((p, i) => (
                <div key={i} className="py-4">
                  <dt className="text-body font-semibold">{p.title}</dt>
                  <dd className="mt-1.5 text-body leading-relaxed text-sub">{p.easy}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}

      <TermPopup term={openIndex === null ? null : terms[openIndex] ?? null} onClose={() => setOpenIndex(null)} />
    </>
  );
}
