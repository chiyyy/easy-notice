// 3단계 프롬프트 생성기: 공통 규칙 + 문서 종류별 템플릿 + 설명 수준을 조립한다.
import type { DocType, Fields, Level } from "../schema";
import { BILL_RULES } from "./bill";
import { COMMON_RULES, OUTPUT_RULES, levelRules } from "./common";
import { CONTRACT_RULES } from "./contract";
import { MEDICAL_RULES, NOTICE_RULES } from "./notice";

export { EXTRACT_INSTRUCTIONS, EXTRACT_USER_TEXT } from "./extract";

const DOC_RULES: Record<DocType, string> = {
  bill: BILL_RULES,
  contract: CONTRACT_RULES,
  notice: NOTICE_RULES,
  medical: MEDICAL_RULES,
  other: NOTICE_RULES,
};

/** GPT 2차의 instructions(시스템 프롬프트) */
export function buildExplainInstructions(docType: DocType, level: Level): string {
  return [COMMON_RULES, DOC_RULES[docType], levelRules(level), OUTPUT_RULES].join("\n\n");
}

/** GPT 2차의 사용자 입력: 마스킹된 원문 + 1차에서 뽑은 값(참고용) */
export function buildExplainInput(maskedText: string, fields: Fields): string {
  const ref = [
    `기한: ${fields.deadline ?? "없음"}`,
    `금액: ${fields.amount !== null ? `${fields.amount}원` : "없음"}`,
    `내는 곳·장소: ${fields.place ?? "없음"}`,
    `준비물: ${fields.items.length > 0 ? fields.items.join(", ") : "없음"}`,
    `문의: ${fields.contact ?? "없음"}`,
  ].join("\n");
  return `[문서 원문]\n${maskedText}\n\n[원문에서 뽑은 핵심 값 — 날짜·금액은 이 값과 원문을 따른다]\n${ref}`;
}
export { buildChatInstructions } from "./chat";
export { buildTranslateInput, buildTranslateInstructions } from "./translate";
