"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { errorMessage } from "@/lib/errors";
import { useAnalysis } from "@/lib/store";
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

  return (
    <>
      <header className="flex items-center gap-1 border-b border-slate-100 px-2 py-2">
        <button
          type="button"
          onClick={goHome}
          aria-label="취소하고 처음으로"
          className="min-h-11 min-w-11 rounded-lg text-xl hover:bg-slate-100"
        >
          ←
        </button>
        <h1 className="text-lg font-bold">{stage === "error" ? "문제가 생겼어요" : "읽고 있어요"}</h1>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 py-6">
        <div className="relative mx-auto h-56 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <Image src={image.dataUrl} alt="올린 문서 사진" fill unoptimized className="object-contain" />
          {stage !== "error" && (
            <div
              className="absolute inset-x-0 top-0 h-1 bg-brand/80 shadow-[0_0_12px_#2563eb] motion-safe:animate-scan"
              aria-hidden
            />
          )}
        </div>

        {stage === "error" && error ? (
          <section role="alert" className="flex flex-col gap-4">
            <p className="rounded-xl bg-orange-50 px-4 py-4 text-orange-800">{errorMessage(error)}</p>
            <button
              type="button"
              onClick={goHome}
              className="min-h-14 rounded-2xl bg-brand text-lg font-bold text-white hover:bg-blue-700"
            >
              다시 찍기
            </button>
            {error !== "LOW_QUALITY_IMAGE" && (
              <button
                type="button"
                onClick={retry}
                className="min-h-12 rounded-2xl border border-slate-200 font-medium text-slate-700 hover:bg-slate-50"
              >
                이 사진으로 다시 해 보기
              </button>
            )}
          </section>
        ) : (
          <>
            <div aria-live="polite">
              <ProgressSteps stage={stage} />
            </div>
            <aside className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3">
              <p className="font-bold">
                <span aria-hidden>💡 </span>알고 계셨나요?
              </p>
              <p className="mt-1 text-slate-700">과태료는 기한 안에 미리 내면 20%까지 깎아 주는 경우가 많아요.</p>
            </aside>
          </>
        )}
      </main>

      {stage !== "error" && <p className="pb-6 text-center text-sm text-slate-500">보통 10초 안팎이면 끝나요</p>}
    </>
  );
}
