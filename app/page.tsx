import { FontSizeToggle } from "@/components/FontSizeToggle";
import { HomeUploader } from "@/components/HomeUploader";
import { LevelToggle } from "@/components/LevelToggle";

const DOC_TYPES = ["고지서", "계약서", "병원 안내문", "학교 공지"];

// ① 홈·문서 촬영
// 이 파일은 서버 컴포넌트(기본값)라 고정된 글자는 서버에서 HTML로 그려 보낸다.
// 버튼처럼 상호작용이 필요한 부분만 클라이언트 컴포넌트(HomeUploader, LevelToggle, FontSizeToggle)로 분리했다.
export default function Home() {
  return (
    <>
      <header className="flex h-14 items-center justify-between pr-2 pl-5">
        <h1 className="text-heading font-bold">쉬운말 번역기</h1>
        <FontSizeToggle />
      </header>

      <main className="flex flex-1 flex-col px-5 pt-6">
        <section>
          <h2 className="text-display font-bold">
            안내문을 찍으면
            <br />할 일을 알려 드려요
          </h2>
          <p className="mt-3 text-body leading-relaxed text-sub">
            기한, 금액, 해야 할 일을
            <br />
            쉬운 말로 정리해요.
          </p>
        </section>

        <div className="mt-10">
          <LevelToggle />
        </div>

        <dl className="mt-8 border-t border-line pt-5 text-label">
          <div className="flex gap-4 py-1.5">
            <dt className="w-20 shrink-0 text-muted">읽는 문서</dt>
            <dd className="text-ink">{DOC_TYPES.join(", ")}</dd>
          </div>
          <div className="flex gap-4 py-1.5">
            <dt className="w-20 shrink-0 text-muted">사진 보관</dt>
            <dd className="text-ink">저장하지 않아요. 읽고 나면 바로 지워요.</dd>
          </div>
        </dl>
      </main>

      <HomeUploader />
    </>
  );
}
