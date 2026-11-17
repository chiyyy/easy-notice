import type { ErrorCode } from "./schema";
import type { ImageErrorCode } from "./image";

/** 화면에서 다루는 모든 에러 코드 (서버 코드 + 이미지 전처리 + 네트워크) */
export type AppErrorCode = ErrorCode | ImageErrorCode | "NETWORK_ERROR";

/** 에러 코드별 쉬운 안내 문구 */
export function errorMessage(code: AppErrorCode): string {
  switch (code) {
    case "LOW_QUALITY_IMAGE":
      return "글자가 잘 안 보여요. 밝은 곳에서 문서를 평평하게 놓고 다시 찍어 주세요.";
    case "NOT_IMAGE":
      return "사진 파일만 올릴 수 있어요.";
    case "IMAGE_TOO_SMALL":
      return "사진이 너무 작아요. 문서가 화면에 꽉 차게 다시 찍어 주세요.";
    case "IMAGE_DECODE_FAILED":
      return "사진을 열 수 없어요. 다른 사진으로 다시 해 주세요.";
    case "NETWORK_ERROR":
      return "인터넷 연결을 확인하고 다시 시도해 주세요.";
    case "OPENAI_KEY_MISSING":
      return "API 키가 설정되지 않았어요. (개발자: .env.local 확인)";
    default:
      return "잠시 문제가 생겼어요. 다시 시도해 주세요.";
  }
}
