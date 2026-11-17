"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { errorMessage, type AppErrorCode } from "@/lib/errors";
import { ImageError, preprocessImage } from "@/lib/image";
import { useAnalysis } from "@/lib/store";
import { LevelToggle } from "./LevelToggle";

/** 촬영 영역 + 앨범 선택 + 설명 수준. 사진을 고르면 전처리 후 바로 분석 화면으로 간다. */
export function HomeUploader() {
  const router = useRouter();
  const { level, setLevel, start } = useAnalysis();
  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<AppErrorCode | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 사진을 다시 골라도 change 이벤트가 나도록
    if (!file) return;

    setError(null);
    setPreparing(true);
    try {
      const image = await preprocessImage(file);
      start(image);
      router.push("/analyzing");
    } catch (err) {
      setError(err instanceof ImageError ? err.code : "IMAGE_DECODE_FAILED");
      setPreparing(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        disabled={preparing}
        aria-label="문서 촬영하기"
        className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/40 px-4 py-8 hover:bg-blue-50 disabled:opacity-60"
      >
        <span className="text-5xl" aria-hidden>
          📷
        </span>
        <span className="text-lg font-bold text-brand">
          {preparing ? "사진 준비하는 중…" : "문서 촬영하기"}
        </span>
        <span className="text-sm text-slate-500">글자가 잘 보이게 평평한 곳에서 찍어 주세요</span>
      </button>

      <button
        type="button"
        onClick={() => albumRef.current?.click()}
        disabled={preparing}
        className="min-h-14 rounded-2xl border border-blue-200 bg-blue-50 text-lg font-bold text-brand hover:bg-blue-100 disabled:opacity-60"
      >
        <span aria-hidden>🖼 </span>앨범에서 선택
      </button>

      {/* 실제 파일 입력은 숨기고 위 버튼으로 연다. capture는 휴대폰에서 바로 카메라를 연다. */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />
      <input
        ref={albumRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />

      {error && (
        <p role="alert" className="rounded-xl bg-orange-50 px-4 py-3 text-orange-800">
          {errorMessage(error)}
        </p>
      )}

      <LevelToggle value={level} onChange={setLevel} disabled={preparing} />
    </div>
  );
}
