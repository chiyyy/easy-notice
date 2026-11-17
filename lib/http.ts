import "server-only";
import type { ApiError, ErrorCode } from "./schema";

/** 에러 응답은 코드만 보낸다. 사용자 안내 문구는 클라이언트에서 코드별로 정한다. */
export function errorResponse(code: ErrorCode, status: number): Response {
  const body: ApiError = { code };
  return Response.json(body, { status });
}

/** 요청 body를 JSON으로 읽는다. 형식이 깨졌으면 null. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
