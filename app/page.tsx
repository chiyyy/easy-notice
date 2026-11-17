import { FontSizeToggle } from "@/components/FontSizeToggle";
import { HomeUploader } from "@/components/HomeUploader";

const DOC_CHIPS = ["고지서", "계약서", "병원 안내문", "학교 공지"];

// ① 홈·문서 촬영
// 이 파일은 서버 컴포넌트(기본값)라 고정된 글자는 서버에서 HTML로 그려 보낸다.
// 사진 고르기처럼 상호작용이 필요한 부분만 클라이언트 컴포넌트(HomeUploader, FontSizeToggle)로 분리했다.
export default function Home() {
  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
        <h1 className="text-lg font-bold">
          <span aria-hidden>📄 </span>쉬운말 번역기
        </h1>
        <FontSizeToggle />
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 py-8">
        <section className="text-center">
          <h2 className="text-2xl leading-snug font-bold">
            어려운 안내문,
            <br />
            찍기만 하세요
          </h2>
          <p className="mt-2 text-slate-600">
            무슨 뜻인지, 언제까지 뭘 해야 하는지
            <br />
            쉽게 알려드려요
          </p>
        </section>

        <HomeUploader />

        <section>
          <h2 className="mb-2 text-sm text-slate-600">이런 문서를 읽을 수 있어요</h2>
          <ul className="flex flex-wrap gap-2">
            {DOC_CHIPS.map((chip) => (
              <li key={chip} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                {chip}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="px-4 pb-6 text-center text-sm text-slate-500">
        <span aria-hidden>🔒 </span>사진은 저장되지 않고 분석 후 바로 삭제돼요
      </footer>
    </>
  );
}
