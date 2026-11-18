"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { postJson } from "./api-client";
import { errorMessage } from "./errors";
import { ChatResponseSchema, type ChatMessage, type Level } from "./schema";

export type ChatEntry =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; evidence: string | null }
  | { role: "error"; content: string };

/**
 * 질문하기 대화 상태. 결과 화면(ResultContent)에서 호출해 탭을 바꿔도 대화가 남게 한다.
 * 대화는 메모리에만 있고, 새 문서를 분석하면(runId 변경) 초기화된다.
 */
export function useChat(maskedText: string, level: Level) {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [pending, setPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // 화면이 사라지거나 숨겨질 때(React Activity) 진행 중인 요청을 취소한다
  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim().slice(0, 500);
      if (!question || pending) return;

      // 서버에는 정상적으로 주고받은 대화만 보낸다 (에러 메시지 제외)
      const history: ChatMessage[] = entries
        .filter((e): e is Exclude<ChatEntry, { role: "error" }> => e.role !== "error")
        .map((e) => ({ role: e.role, content: e.content }));

      setEntries((prev) => [...prev, { role: "user", content: question }]);
      setPending(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const res = await postJson(
        "/api/chat",
        { maskedText, question, history: history.slice(-10), level },
        ChatResponseSchema,
        controller.signal,
      );
      if (controller.signal.aborted) return;

      setEntries((prev) => [
        ...prev,
        res.ok
          ? { role: "assistant", content: res.data.answer, evidence: res.data.evidence }
          : { role: "error", content: errorMessage(res.code) },
      ]);
      setPending(false);
    },
    [entries, pending, maskedText, level],
  );

  return { entries, pending, send };
}
