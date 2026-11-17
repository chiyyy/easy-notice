import { ChevronLeft } from "lucide-react";

/** 헤더 왼쪽 뒤로가기 (아이콘만, 의미는 aria-label로) */
export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-lg text-ink hover:bg-canvas"
    >
      <ChevronLeft className="size-6" strokeWidth={2} aria-hidden />
    </button>
  );
}
