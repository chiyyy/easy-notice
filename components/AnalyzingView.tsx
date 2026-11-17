"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { errorMessage } from "@/lib/errors";
import { useAnalysis } from "@/lib/store";
import { BackButton } from "./BackButton";
import { ProgressSteps } from "./ProgressSteps";

/** 마지막 체크 표시를 잠깐 보여 준 뒤 결과로 넘어가는 시간 */
const DONE_PAUSE_MS = 600;

export function AnalyzingView() {
  const router = useRouter();
  const { stage, image, error, retry, reset } = useAnalysis();

  useEffect(() => {
    // 새로고침 등으로 사진이 없으면 홈으로
    if (stage === "idle" || !image) {
      router.replace("/");
      return;
    }
    if (stage === "done") {
      const t = setTimeout(() => router.replace("/result"), DONE_PAUSE_MS);
      return () => clearTimeout(t);
    }
  }, [stage, image, router]);

  function goHome() {
    reset();
    router.replace("/");
  }

  if (!image) return null;
  const failed = stage === "error" && error;

  return (
    <>
      <header className="flex h-14 items-center px-1">
        <BackButton label="취소하고 처음으로" onClick={goHome} />
      </header>

      <main className="flex flex-1 flex-col px-5 pt-2">
        <h1 className="text-display font-bold">
          {failed ? (error === "LOW_QUALITY_IMAGE" ? "글자를 읽지 못했어요" : "문서를 읽지 못했어요") : "문서를 읽고 있어요"}
        </h1>
        <p className="mt-2 text-body leading-relaxed text-sub" aria-live="polite">
          {failed ? errorMessage(error) : "보통 10초 안팎이면 끝나요."}
        </p>

        <div className="relative mt-8 h-48 w-full overflow-hidden rounded-xl bg-canvas">
          <Image src={image.dataUrl} alt="올린 문서 사진" fill unoptimized className="object-contain" />
          {!failed && (
            <div className="absolute inset-x-0 top-0 h-0.5 bg-brand motion-safe:animate-scan" aria-hidden />
          )}
        </div>

        {!failed && (
          <div className="mt-6" aria-live="polite">
            <ProgressSteps stage={stage} />
          </div>
        )}
      </main>

      {failed && (
        <div className="sticky bottom-0 bg-white px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={goHome}
            className="h-14 w-full rounded-xl bg-brand text-heading font-semibold text-white hover:bg-brand-strong"
          >
            다시 찍기
          </button>
          {error !== "LOW_QUALITY_IMAGE" && (
            <button
              type="button"
              onClick={retry}
              className="mt-1 h-12 w-full rounded-xl text-body font-medium text-sub hover:bg-canvas"
            >
              이 사진으로 다시 하기
            </button>
          )}
        </div>
      )}
    </>
  );
}
