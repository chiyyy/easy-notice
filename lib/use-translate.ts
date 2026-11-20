"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { postJson } from "./api-client";
import type { AppErrorCode } from "./errors";
import { TranslateResponseSchema, type Lang, type Translatable, type TranslateResponse } from "./schema";

type LangState =
  | { status: "loading" }
  | { status: "done"; data: TranslateResponse }
  | { status: "error"; code: AppErrorCode };

/**
 * 번역 탭 상태. 결과 화면(ResultContent)에서 호출해 탭을 바꿔도 번역이 남는다.
 * 언어마다 한 번만 요청하고(메모리에 보관), 새 문서를 분석하면(runId 변경) 초기화된다.
 */
export function useTranslate(source: Translatable) {
  const [lang, setLang] = useState<Lang | null>(null);
  const [byLang, setByLang] = useState<Partial<Record<Lang, LangState>>>({});
  const controllers = useRef(new Set<AbortController>());

  // 화면이 사라지거나 숨겨질 때 진행 중인 요청 취소 (취소된 언어는 다음에 다시 요청)
  useEffect(() => {
    const set = controllers.current;
    return () => {
      set.forEach((c) => c.abort());
      set.clear();
      setByLang((prev) =>
        Object.fromEntries(Object.entries(prev).filter(([, v]) => v.status !== "loading")),
      );
    };
  }, []);

  const request = useCallback(
    async (next: Lang) => {
      setByLang((prev) => ({ ...prev, [next]: { status: "loading" } }));
      const controller = new AbortController();
      controllers.current.add(controller);
      const res = await postJson("/api/translate", { result: source, lang: next }, TranslateResponseSchema, controller.signal);
      controllers.current.delete(controller);
      if (controller.signal.aborted) return;
      setByLang((prev) => ({
        ...prev,
        [next]: res.ok ? { status: "done", data: res.data } : { status: "error", code: res.code },
      }));
    },
    [source],
  );

  const choose = useCallback(
    (next: Lang) => {
      setLang(next);
      const cur = byLang[next];
      if (!cur || cur.status === "error") void request(next);
    },
    [byLang, request],
  );

  const retry = useCallback(() => {
    if (lang) void request(lang);
  }, [lang, request]);

  return { lang, current: lang ? byLang[lang] : undefined, choose, retry };
}
