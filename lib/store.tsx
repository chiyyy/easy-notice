"use client";

// 분석 결과를 페이지 간에 공유하는 React Context.
// 루트 layout에서 감싸 두면 홈 → 분석 중 → 결과로 이동해도 상태가 유지된다.
// 서버나 localStorage에는 저장하지 않으므로 새로고침하면 사라진다(의도된 동작).

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { postJson } from "./api-client";
import type { AppErrorCode } from "./errors";
import type { PreparedImage } from "./image";
import {
  ExplainResponseSchema,
  ExtractResponseSchema,
  type ExplainResponse,
  type ExtractResponse,
  type Level,
} from "./schema";

/** idle → extracting(GPT 1차+마스킹) → explaining(GPT 2차+검증) → done | error */
export type Stage = "idle" | "extracting" | "explaining" | "done" | "error";

type AnalysisState = {
  stage: Stage;
  image: PreparedImage | null;
  extract: ExtractResponse | null;
  explain: ExplainResponse | null;
  error: AppErrorCode | null;
};

type AnalysisContextValue = AnalysisState & {
  level: Level;
  setLevel: (level: Level) => void;
  largeText: boolean;
  setLargeText: (on: boolean) => void;
  /** 전처리된 사진으로 분석을 시작한다 */
  start: (image: PreparedImage) => void;
  /** 같은 사진으로 다시 시도 */
  retry: () => void;
  /** 진행 중인 요청을 취소하고 처음 상태로 */
  reset: () => void;
};

const INITIAL: AnalysisState = { stage: "idle", image: null, extract: null, explain: null, error: null };

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AnalysisState>(INITIAL);
  const [level, setLevel] = useState<Level>("easy");
  const [largeText, setLargeText] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (image: PreparedImage) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const { signal } = controller;

      setState({ ...INITIAL, stage: "extracting", image });

      const extract = await postJson(
        "/api/extract",
        { imageBase64: image.base64 },
        ExtractResponseSchema,
        signal,
      );
      if (signal.aborted) return;
      if (!extract.ok) {
        setState((s) => ({ ...s, stage: "error", error: extract.code }));
        return;
      }
      setState((s) => ({ ...s, stage: "explaining", extract: extract.data }));

      const { docType, maskedText, fields } = extract.data;
      const explain = await postJson(
        "/api/explain",
        { docType, maskedText, fields, level },
        ExplainResponseSchema,
        signal,
      );
      if (signal.aborted) return;
      if (!explain.ok) {
        setState((s) => ({ ...s, stage: "error", error: explain.code }));
        return;
      }
      setState((s) => ({ ...s, stage: "done", explain: explain.data }));
    },
    [level],
  );

  const retry = useCallback(() => {
    if (state.image) void run(state.image);
  }, [run, state.image]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL);
  }, []);

  // 큰 글씨 모드: html font-size를 바꾸면 rem 단위로 만든 화면 전체가 같이 커진다
  useEffect(() => {
    document.documentElement.style.fontSize = largeText ? "19px" : "";
  }, [largeText]);

  const value = useMemo<AnalysisContextValue>(
    () => ({
      ...state,
      level,
      setLevel,
      largeText,
      setLargeText,
      start: (image) => void run(image),
      retry,
      reset,
    }),
    [state, level, largeText, run, retry, reset],
  );

  return <AnalysisContext value={value}>{children}</AnalysisContext>;
}

export function useAnalysis(): AnalysisContextValue {
  const ctx = use(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis는 AnalysisProvider 안에서만 쓸 수 있어요");
  return ctx;
}
