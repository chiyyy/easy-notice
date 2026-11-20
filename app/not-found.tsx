import Link from "next/link";

// 없는 주소로 들어왔을 때
export default function NotFound() {
  return (
    <>
      <main className="flex flex-1 flex-col px-5 pt-20">
        <h1 className="text-display font-bold">없는 페이지예요</h1>
        <p className="mt-3 text-body leading-relaxed text-sub">주소를 다시 확인하거나 처음 화면으로 가 주세요.</p>
      </main>
      <div className="sticky bottom-0 bg-white px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <Link
          href="/"
          className="flex h-14 w-full items-center justify-center rounded-xl bg-brand text-heading font-semibold text-white hover:bg-brand-strong"
        >
          처음으로
        </Link>
      </div>
    </>
  );
}
