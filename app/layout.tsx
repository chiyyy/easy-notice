import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { AnalysisProvider } from "@/lib/store";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "700"],
  // 한글 글리프는 용량이 커서 미리 불러오지 않고 필요한 글자만 내려받는다
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "쉬운말 번역기",
  description: "어려운 안내문을 찍으면 쉬운 말과 해야 할 일로 바꿔 드려요",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-100">
        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white shadow-sm">
          {/* 클라이언트 Context Provider. children(서버 컴포넌트 페이지)은 그대로 서버에서 렌더링된다. */}
          <AnalysisProvider>{children}</AnalysisProvider>
        </div>
      </body>
    </html>
  );
}
