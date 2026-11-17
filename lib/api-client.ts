import type { z } from "zod";
import type { AppErrorCode } from "./errors";
import { ApiErrorSchema } from "./schema";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; code: AppErrorCode };

/** 우리 Route Handler에 POST하고 응답을 zod로 검증한다 (클라이언트용) */
export async function postJson<T>(
  url: string,
  body: unknown,
  schema: z.ZodType<T>,
  signal: AbortSignal,
): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    return { ok: false, code: "NETWORK_ERROR" };
  }

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = ApiErrorSchema.safeParse(json);
    return { ok: false, code: err.success ? err.data.code : "INTERNAL_ERROR" };
  }
  const parsed = schema.safeParse(json);
  return parsed.success ? { ok: true, data: parsed.data } : { ok: false, code: "INTERNAL_ERROR" };
}
