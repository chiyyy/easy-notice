import "server-only";
import { LlmError } from "./openai";
import type { ApiError, ErrorCode } from "./schema";

/** 에러 응답은 코드만 보낸다. 사용자 안내 문구는 클라이언트에서 코드별로 정한다. */
export function errorResponse(code: ErrorCode, status: number): Response {
  const body: ApiError = { code };
  return Response.json(body, { status });
}

const STATUS: Partial<Record<ErrorCode, number>> = {
  BAD_REQUEST: 400,
  LOW_QUALITY_IMAGE: 422,
  OPENAI_KEY_MISSING: 500,
  OPENAI_TIMEOUT: 504,
  OPENAI_ERROR: 502,
  EXTRACT_PARSE_ERROR: 502,
  EXPLAIN_FAILED: 502,
};

/** 에러 코드 → 응답 (상태 코드는 코드에 맞춰 자동) */
export function errorFor(code: ErrorCode): Response {
  return errorResponse(code, STATUS[code] ?? 500);
}

/** 라우트에서 잡은 예외를 응답으로. 예상 못 한 에러는 이름만 기록한다. */
export function errorFromException(err: unknown, route: string): Response {
  if (err instanceof LlmError) return errorFor(err.code);
  console.error(`[${route}] INTERNAL_ERROR`, err instanceof Error ? err.name : "unknown");
  return errorFor("INTERNAL_ERROR");
}

/** 요청 body를 JSON으로 읽는다. 형식이 깨졌으면 null. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
