import type { DocType } from "./schema";

/** 질문하기 탭의 추천 질문 (문서 종류별) */
const SUGGESTIONS: Record<DocType, string[]> = {
  bill: ["카드로도 낼 수 있어요?", "기한을 넘기면 어떻게 돼요?", "억울하면 어떻게 해요?"],
  contract: ["계약 기간이 언제까지예요?", "중간에 나가면 어떻게 돼요?", "고장 나면 누가 고쳐요?"],
  notice: ["언제, 어디로 가면 돼요?", "뭘 준비해야 해요?", "어떻게 신청해요?"],
  medical: ["검사 전에 뭘 하면 안 돼요?", "뭘 챙겨 가야 해요?", "예약을 바꾸려면요?"],
  other: ["제가 해야 할 일이 뭐예요?", "기한이 있어요?", "어디에 물어보면 돼요?"],
};

export function suggestionsFor(docType: DocType): string[] {
  return SUGGESTIONS[docType];
}
