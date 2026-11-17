"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { errorMessage, type AppErrorCode } from "@/lib/errors";
import { ImageError, preprocessImage } from "@/lib/image";
import { useAnalysis } from "@/lib/store";

/** 화면 아래 고정 버튼: 사진 찍기 / 앨범에서 고르기. 고르면 전처리 후 바로 분석 화면으로 간다. */
export function HomeUploader() {
  const router = useRouter();
  const { start } = useAnalysis();
  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<AppErrorCode | null>(null);

  // Cache Components는 페이지를 떠나도 숨겨 둔 채 상태를 유지한다(React Activity).
  // 분석 화면으로 넘어가며 홈이 숨겨질 때 "준비 중"·에러 상태를 풀어 두어야, 돌아왔을 때 버튼이 잠겨 있지 않다.
  useLayoutEffect(
    () => () => {
      setPreparing(false);
      setError(null);
    },
    [],
  );

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
    <div className="sticky bottom-0 bg-white px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      {error && (
        <p role="alert" className="mb-3 text-label text-ink">
          {errorMessage(error)}
        </p>
      )}

      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        disabled={preparing}
        className="h-14 w-full rounded-xl bg-brand text-heading font-semibold text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {preparing ? "사진 준비 중" : "사진 찍기"}
      </button>
      <button
        type="button"
        onClick={() => albumRef.current?.click()}
        disabled={preparing}
        className="mt-1 h-12 w-full rounded-xl text-body font-medium text-sub hover:bg-canvas disabled:opacity-50"
      >
        앨범에서 고르기
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
    </div>
  );
}
