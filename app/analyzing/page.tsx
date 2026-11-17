import { AnalyzingView } from "@/components/AnalyzingView";

// ② 분석 중. 진행 상태가 Context(클라이언트 메모리)에 있어서 화면 전체가 클라이언트 컴포넌트다.
export default function AnalyzingPage() {
  return <AnalyzingView />;
}
