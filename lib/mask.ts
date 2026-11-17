// 개인정보 마스킹: GPT 2차·질문·번역으로 보내기 전에 원문에서 개인정보를 "[개인정보]"로 바꾼다.
// 순수 함수라 서버·테스트 어디서나 쓸 수 있다. 날짜(2026-10-20)·금액(40,000원)은 건드리지 않는다.

export const MASK = "[개인정보]";

export type MaskResult = { text: string; count: number };

/** 숫자 사이 구분자: 하이픈, 공백, 점 */
const SEP = "[-\\s.]?";

type Rule = { name: string; re: RegExp; replace: (match: string, ...groups: string[]) => string | null };

const NAME_LABELS = ["성명", "이름", "납부자", "임차인", "임대인", "수신인", "환자명", "보호자", "학생명", "신청인"];
const ADDRESS_LABELS = ["주소", "주 소", "거주지", "소재지"];

/** 주소 줄에서 시·도·구·군 수준까지만 남기고 나머지(상세)를 가린다 */
function maskAddressLine(label: string, sep: string, rest: string): string | null {
  const tokens = rest.trim().split(/\s+/);
  let keep = 0;
  for (let i = 0; i < Math.min(tokens.length, 3); i++) {
    if (/(특별시|광역시|특별자치시|특별자치도|시|도|구|군)$/.test(tokens[i])) keep = i + 1;
    else break;
  }
  const kept = tokens.slice(0, keep).join(" ");
  const detail = tokens.slice(keep).join(" ");
  if (!detail || detail === MASK) return null; // 가릴 상세주소가 없으면 그대로
  return `${label}${sep}${kept ? `${kept} ` : ""}${MASK}`;
}

// 순서가 중요하다: 긴 패턴(카드·주민번호)을 먼저 가려야 짧은 패턴이 일부만 잡지 않는다.
const RULES: Rule[] = [
  // 카드번호 4-4-4-4
  { name: "card", re: /(?<!\d)\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}(?!\d)/g, replace: () => MASK },
  // 주민·외국인등록번호: 앞 6자리 + 뒤 7자리(첫 숫자 1~8), 하이픈 없는 13자리 포함
  { name: "rrn", re: /(?<!\d)\d{6}[-\s]?[1-8]\d{6}(?!\d)/g, replace: () => MASK },
  // 휴대전화 01X
  { name: "mobile", re: new RegExp(`(?<!\\d)01[016789]${SEP}\\d{3,4}${SEP}\\d{4}(?!\\d)`, "g"), replace: () => MASK },
  // 일반 전화: 02, 031~064, 070 (1588-XXXX 같은 대표번호와 120은 0으로 시작하지 않아 그대로 남는다)
  {
    name: "phone",
    re: new RegExp(`(?<!\\d)(?:02|0[3-6][1-5]|070)[-\\s.)]?\\d{3,4}${SEP}\\d{4}(?!\\d)`, "g"),
    replace: () => MASK,
  },
  // "계좌" 근처의 긴 숫자열 (하이픈 없이 10~14자리)
  {
    name: "account-near",
    re: /(계좌[^\n\d]{0,15})(\d{10,14})(?!\d)/g,
    replace: (_m, prefix) => `${prefix}${MASK}`,
  },
  // 하이픈으로 묶인 계좌번호: 숫자 합계 10~14자리 (날짜 YYYY-MM-DD는 8자리라 제외)
  {
    name: "account",
    re: /(?<![\d-])\d{2,6}(?:-\d{2,7}){1,3}(?![\d-])/g,
    replace: (m) => {
      const digits = m.replace(/-/g, "").length;
      return digits >= 10 && digits <= 14 ? MASK : null;
    },
  },
  // 본문 속 상세주소 (차량번호 규칙보다 먼저: "101동 1203"이 차량번호로 잡히지 않게): 101동 1203호, 3층 301호, 123-4번지
  { name: "unit", re: /(?<!\d)\d{1,4}(?:동|층)\s?\d{1,5}호/g, replace: () => MASK },
  { name: "lot", re: /(?<!\d)\d{1,5}(?:-\d{1,5})?번지/g, replace: () => MASK },
  // 차량번호 (예: 12가 3456, 123나4567)
  { name: "vehicle", re: /(?<!\d)\d{2,3}\s?[가-힣]\s?\d{4}(?!\d)/g, replace: () => MASK },
  // 라벨 뒤 이름: "성명: 홍길동", "납부자 홍길동님" (가장 짧게 맞춰서 "님"을 이름에 넣지 않는다)
  {
    name: "name",
    re: new RegExp(`(${NAME_LABELS.join("|")})(\\s*[:：]\\s*|\\s+)([가-힣]{2,4}?)(?=$|[^가-힣]|님|씨|귀하)`, "gm"),
    replace: (_m, label, sep) => `${label}${sep}${MASK}`,
  },
  // 주소 줄: 시·구 수준만 남김
  {
    name: "address-line",
    re: new RegExp(`(${ADDRESS_LABELS.join("|")})(\\s*[:：]\\s*)([^\\n]+)`, "g"),
    replace: (_m, label, sep, rest) => maskAddressLine(label, sep, rest),
  },
];

/** 개인정보를 "[개인정보]"로 바꾸고 바꾼 개수를 돌려준다 */
export function maskText(input: string): MaskResult {
  let text = input;
  let count = 0;
  for (const rule of RULES) {
    text = text.replace(rule.re, (match: string, ...args: unknown[]) => {
      // replace 콜백 인자: (match, ...groups, offset, string) → 문자열 그룹만 추린다
      const groups = args.filter((a): a is string => typeof a === "string").slice(0, -1);
      const replaced = rule.replace(match, ...groups);
      if (replaced === null) return match;
      count++;
      return replaced;
    });
  }
  return { text, count };
}

/** 짧은 필드(장소·문의처 등)용: 가린 뒤 "[개인정보]" 조각은 지우고 정리한다 */
export function maskField(value: string | null): { value: string | null; count: number } {
  if (value === null) return { value: null, count: 0 };
  const { text, count } = maskText(value);
  const cleaned = text.split(MASK).join("").replace(/\s{2,}/g, " ").trim();
  return { value: cleaned || null, count };
}
