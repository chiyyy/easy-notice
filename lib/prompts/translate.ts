// 번역: 2차에서 만든 쉬운 한국어(요약·할 일·주의할 점)를 외국인 주민이 읽기 쉽게 옮긴다.
// 원문·이미지는 보내지 않는다. 문장 개수와 순서를 그대로 지켜야 코드에서 짝을 맞출 수 있다.
import type { Lang, Translatable } from "../schema";

const LANG_NAME: Record<Lang, string> = {
  en: "영어(English)",
  zh: "중국어 간체(简体中文)",
  vi: "베트남어(Tiếng Việt)",
};

const AMOUNT_EXAMPLE: Record<Lang, string> = {
  en: '"32,000 won"',
  zh: '"32,000韩元"',
  vi: '"32.000 won"',
};

const GLOSS_EXAMPLE: Record<Lang, string> = {
  en: "fine (과태료), statement of opinion (의견진술서)",
  zh: "罚款（과태료）、意见陈述书（의견진술서）",
  vi: "tiền phạt (과태료), bản trình bày ý kiến (의견진술서)",
};

export function buildTranslateInstructions(lang: Lang): string {
  return `너는 한국 생활 문서 안내를 ${LANG_NAME[lang]}로 옮기는 번역가다. 읽는 사람은 한국에 사는 외국인 주민·유학생이다.

규칙:
- 입력의 summary, todos, warnings를 각각 같은 개수, 같은 순서로 번역한다. 문장을 합치거나 나누거나 빼지 않는다.
- 입력에 없는 내용을 덧붙이지 않는다. 설명을 더하고 싶어도 쓰지 않는다.
- 쉬운 일상어로 자연스럽게 쓴다. 직역투를 피한다.
- 한국 행정·법률 용어(과태료, 위택스, 의견진술서, 보증금, 전입신고 등)는 번역어 뒤 괄호에 한국어 원어를 함께 쓴다. 예: ${GLOSS_EXAMPLE[lang]}
  괄호 안 한국어는 입력 문장에 있는 한글 단어를 한 글자도 바꾸지 않고 그대로 복사한다. 한자·번역어를 섞지 않는다. (나쁜 예: 意见진술서, ý kiến진술서)
  괄호 밖 문장에는 한글을 쓰지 않는다.
- 금액은 아라비아 숫자로 쓴다. "3만 2천 원"도 숫자로 바꿔 ${AMOUNT_EXAMPLE[lang]}처럼 쓴다.
- 날짜·기간·퍼센트의 숫자는 바꾸지 않는다.
- "[개인정보]"는 가려진 개인정보다. 그대로 둔다.`;
}

/** 번역할 문장만 JSON으로 넘긴다 (기한 날짜는 코드에서 그대로 붙인다) */
export function buildTranslateInput(result: Translatable): string {
  return JSON.stringify({
    summary: result.summary,
    todos: result.todos.map((t) => t.task),
    warnings: result.warnings,
  });
}
