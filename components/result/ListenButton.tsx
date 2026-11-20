"use client";

import { Square, Volume2 } from "lucide-react";
import { useSpeech } from "@/lib/use-speech";

/** 요약 내용을 소리로 읽어 주는 버튼. 음성 기능이 없는 브라우저에서는 보이지 않는다. */
export function ListenButton({ lines }: { lines: string[] }) {
  const { supported, speaking, noVoice, speak, stop } = useSpeech();
  if (!supported) return null;

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={() => (speaking ? stop() : speak(lines))}
        aria-pressed={speaking}
        className={`-mr-3 flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-label font-medium hover:bg-canvas ${
          speaking ? "text-brand" : "text-sub"
        }`}
      >
        {speaking ? (
          <Square className="size-4 fill-current" aria-hidden />
        ) : (
          <Volume2 className="size-[1.125rem]" aria-hidden />
        )}
        {speaking ? "멈추기" : "소리로 듣기"}
      </button>
      {noVoice && (
        <p role="status" className="text-caption text-muted">
          이 기기에는 한국어 음성이 없어요.
        </p>
      )}
    </div>
  );
}
