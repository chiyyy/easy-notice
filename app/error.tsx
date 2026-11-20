"use client"; // 에러 화면(Error Boundary)은 클라이언트 컴포넌트여야 한다

import Link from "next/link";

// 예상하지 못한 화면 오류가 나면 흰 화면 대신 이 안내를 보여 준다.
// error 값은 문서 내용이 섞일 수 있어 로그로 남기지 않는다.
export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <>
      <main className="flex flex-1 flex-col px-5 pt-20">
        <h1 className="text-display font-bold">잠시 문제가 생겼어요</h1>
        <p className="mt-3 text-body leading-relaxed text-sub">다시 시도하거나 처음부터 다시 찍어 주세요.</p>
      </main>
      <div className="sticky bottom-0 bg-white px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => retry()}
          className="h-14 w-full rounded-xl bg-brand text-heading font-semibold text-white hover:bg-brand-strong"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="mt-1 flex h-12 w-full items-center justify-center rounded-xl text-body font-medium text-sub hover:bg-canvas"
        >
          처음으로
        </Link>
      </div>
    </>
  );
}
