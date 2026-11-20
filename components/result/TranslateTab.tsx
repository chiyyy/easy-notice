"use client";

import { LoaderCircle } from "lucide-react";
import { errorMessage } from "@/lib/errors";
import type { Dday, Fields, Lang, TranslateResponse } from "@/lib/schema";
import { LANGS, UI_TEXT, ddayFor, formatAmountFor, formatDateFor } from "@/lib/translate-ui";
import type { useTranslate } from "@/lib/use-translate";
import { SectionDivider } from "./Notices";

type TranslateState = ReturnType<typeof useTranslate>;

type Props = {
  lang: TranslateState["lang"];
  current: TranslateState["current"];
  onChoose: (lang: Lang) => void;
  onRetry: () => void;
  fields: Fields;
  dday: Dday | null;
};

/** 번역 탭: 요약·핵심 정보·할 일·주의할 점을 고른 언어로 보여 준다 */
export function TranslateTab({ lang, current, onChoose, onRetry, fields, dday }: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <section className="px-5 pt-2 pb-6" aria-labelledby="lang-title">
        <h2 id="lang-title" className="text-heading font-bold">
          다른 언어로 보기
        </h2>
        <p className="mt-1 text-label text-muted">Choose a language · 选择语言 · Chọn ngôn ngữ</p>
        <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="번역할 언어">
          {LANGS.map((l) => {
            const selected = l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChoose(l.code)}
                className={`flex min-h-14 flex-col items-center justify-center rounded-xl border px-1 py-2 ${
                  selected ? "border-brand bg-brand-soft text-brand" : "border-line text-ink hover:bg-canvas"
                }`}
              >
                <span lang={l.code} className="text-body font-semibold">
                  {l.name}
                </span>
                <span className={`text-caption ${selected ? "text-brand" : "text-muted"}`}>{l.korean}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div aria-live="polite" className="flex flex-1 flex-col">
        {lang && current?.status === "loading" && (
          <p className="flex items-center gap-2 px-5 py-6 text-body text-sub">
            <LoaderCircle className="size-5 animate-spin text-brand" aria-hidden />
            번역하고 있어요
          </p>
        )}

        {lang && current?.status === "error" && (
          <div className="px-5 py-6">
            <p className="text-body leading-relaxed text-sub">{errorMessage(current.code)}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 h-12 rounded-xl border border-line px-5 text-body font-medium text-ink hover:bg-canvas"
            >
              다시 시도
            </button>
          </div>
        )}

        {lang && current?.status === "done" && (
          <Translated lang={lang} data={current.data} fields={fields} dday={dday} />
        )}
      </div>
    </div>
  );
}

function Translated({
  lang,
  data,
  fields,
  dday,
}: {
  lang: Lang;
  data: TranslateResponse;
  fields: Fields;
  dday: Dday | null;
}) {
  const t = UI_TEXT[lang];
  const rows: { label: string; value: string; badge?: string }[] = [];
  if (fields.deadline) {
    rows.push({
      label: t.deadline,
      value: formatDateFor(lang, fields.deadline),
      badge: dday ? ddayFor(lang, dday) : undefined,
    });
  }
  if (fields.amount !== null) rows.push({ label: t.amount, value: formatAmountFor(lang, fields.amount) });

  return (
    <div lang={lang}>
      <SectionDivider />
      {data.numberMismatch && (
        <p role="note" className="mx-5 mt-5 border-l-2 border-red-600 pl-3 text-label font-medium text-red-600">
          {t.numberMismatch}
        </p>
      )}

      <section className="px-5 py-6" aria-labelledby="tr-summary">
        <h2 id="tr-summary" className="text-heading font-bold">
          {t.summary}
        </h2>
        <ul className="mt-3 flex flex-col gap-2 text-body leading-relaxed font-medium">
          {data.summary.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>

      {rows.length > 0 && (
        <>
          <SectionDivider />
          <section className="px-5 py-6" aria-labelledby="tr-info">
            <h2 id="tr-info" className="text-heading font-bold">
              {t.info}
            </h2>
            <dl className="mt-3">
              {rows.map((row) => (
                <div key={row.label} className="flex min-h-11 items-baseline justify-between gap-4 py-2">
                  <dt className="shrink-0 text-body text-sub">{row.label}</dt>
                  <dd className="text-right text-body font-semibold">
                    {row.value}
                    {/* 기한 임박 표시는 놓치면 손해라 예외적으로 빨간색 */}
                    {row.badge && <span className="ml-2 text-red-600">{row.badge}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}

      {data.todos.length > 0 && (
        <>
          <SectionDivider />
          <section className="px-5 py-6" aria-labelledby="tr-todos">
            <h2 id="tr-todos" className="text-heading font-bold">
              {t.todos}
            </h2>
            <ol className="mt-3 flex flex-col gap-3">
              {data.todos.map((todo, i) => (
                <li key={i} className="flex gap-3 text-body leading-relaxed">
                  <span className="w-4 shrink-0 font-semibold text-brand">{i + 1}</span>
                  <span>
                    {todo.task}
                    {/* 할 일 문장에 이미 날짜가 있으면 중복해서 붙이지 않는다 */}
                    {todo.due && !todo.task.includes(formatDateFor(lang, todo.due)) && (
                      <span className="ml-1.5 text-label whitespace-nowrap text-muted">
                        ~ {formatDateFor(lang, todo.due)}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      {data.warnings.length > 0 && (
        <>
          <SectionDivider />
          <section className="px-5 py-6" aria-labelledby="tr-warnings">
            <h2 id="tr-warnings" className="text-heading font-bold">
              {t.warnings}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {data.warnings.map((w, i) => (
                <li key={i} className="flex gap-2 text-body leading-relaxed">
                  <span className="text-muted" aria-hidden>
                    ·
                  </span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="px-5 pt-2 pb-8 text-caption leading-relaxed text-muted">
        {t.disclaimer}
        <br />
        <span lang="ko">AI 번역이에요. 중요한 내용은 원문을 꼭 확인하세요.</span>
      </p>
    </div>
  );
}
