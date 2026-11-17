import { describe, expect, it } from "vitest";
import { MASK, maskField, maskText } from "@/lib/mask";

const masked = (s: string) => maskText(s).text;

describe("maskText: 가려야 하는 것", () => {
  it("주민등록번호 (하이픈 있음/없음, 외국인 5~8)", () => {
    expect(masked("주민번호 900101-1234567 입니다")).toBe(`주민번호 ${MASK} 입니다`);
    expect(masked("9001012234567")).toBe(MASK);
    expect(masked("외국인 900101-5234567")).toBe(`외국인 ${MASK}`);
  });

  it("휴대전화 (하이픈·공백·없음)", () => {
    expect(masked("010-1234-5678")).toBe(MASK);
    expect(masked("010 1234 5678")).toBe(MASK);
    expect(masked("연락처 01012345678.")).toBe(`연락처 ${MASK}.`);
  });

  it("일반 전화 (02, 지역번호, 070)", () => {
    expect(masked("문의: ○○구청 교통과 02-2600-0000")).toBe(`문의: ○○구청 교통과 ${MASK}`);
    expect(masked("031-123-4567")).toBe(MASK);
    expect(masked("070-1234-5678")).toBe(MASK);
  });

  it("카드번호 4-4-4-4", () => {
    expect(masked("카드 1234-5678-9012-3456")).toBe(`카드 ${MASK}`);
  });

  it("계좌번호 (하이픈 10~14자리, '계좌' 근처 긴 숫자)", () => {
    expect(masked("국민 123-456-789012")).toBe(`국민 ${MASK}`);
    expect(masked("입금 계좌: 12345678901234")).toBe(`입금 계좌: ${MASK}`);
  });

  it("라벨 뒤 이름", () => {
    expect(masked("성명: 홍길동")).toBe(`성명: ${MASK}`);
    expect(masked("납부자 김철수님")).toBe(`납부자 ${MASK}님`);
    expect(masked("임차인：이영희\n임대인 박민수")).toBe(`임차인：${MASK}\n임대인 ${MASK}`);
    expect(masked("환자명 남궁민수 (남)")).toBe(`환자명 ${MASK} (남)`);
  });

  it("주소는 시·구까지 남기고 상세만", () => {
    expect(masked("주소: 서울특별시 강서구 화곡로 123 101동 1203호")).toBe(`주소: 서울특별시 강서구 ${MASK}`);
    expect(masked("본문 중 101동 1203호에 거주")).toBe(`본문 중 ${MASK}에 거주`);
    expect(masked("○○리 123-4번지")).toBe(`○○리 ${MASK}`);
  });

  it("차량번호", () => {
    expect(masked("차량번호: 12가 3456")).toBe(`차량번호: ${MASK}`);
    expect(masked("123나4567")).toBe(MASK);
  });

  it("치환 개수를 센다", () => {
    expect(maskText("성명: 홍길동, 010-1234-5678, 02-123-4567").count).toBe(3);
  });
});

describe("maskText: 가리면 안 되는 것", () => {
  const keep = [
    "자진납부 기한: 2026-10-20",
    "위반일시: 2026-11-10 14:12",
    "과태료 금액: 40,000원",
    "감경 금액: 32,000원 (20% 감경)",
    "대표번호 1588-1234로 문의",
    "다산콜센터 120",
    "「도로교통법」 제32조 및 제160조",
    "임대인과 임차인은 다음과 같이 계약한다",
    "보증금 10,000,000원 월세 500,000원",
    "2026. 11. 30.까지",
    "주소: 서울특별시 강서구",
  ];
  for (const s of keep) {
    it(s, () => {
      expect(maskText(s)).toEqual({ text: s, count: 0 });
    });
  }
});

describe("maskField", () => {
  it("짧은 필드에서는 가린 조각을 지운다", () => {
    expect(maskField("○○구청 교통과 02-2600-0000")).toEqual({ value: "○○구청 교통과", count: 1 });
  });

  it("전부 개인정보면 null", () => {
    expect(maskField("010-1234-5678")).toEqual({ value: null, count: 1 });
  });

  it("null은 그대로", () => {
    expect(maskField(null)).toEqual({ value: null, count: 0 });
  });
});
