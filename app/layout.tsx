import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AnalysisProvider } from "@/lib/store";
import "./globals.css";

// Pretendard 가변 폰트(굵기 45~920을 파일 하나로). 직접 넣어 둔 파일이라 외부 요청이 없다.
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "쉬운말 번역기",
  description: "어려운 안내문을 찍으면 쉬운 말과 해야 할 일로 바꿔 드려요",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="min-h-full bg-canvas">
        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white">
          {/* 클라이언트 Context Provider. children(서버 컴포넌트 페이지)은 그대로 서버에서 렌더링된다. */}
          <AnalysisProvider>{children}</AnalysisProvider>
        </div>
      </body>
    </html>
  );
}
