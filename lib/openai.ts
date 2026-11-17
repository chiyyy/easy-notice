import "server-only";

// OpenAI 호출은 이 파일에서만 한다 (API 키는 서버 환경 변수에만 있다).
// - store: false → 요청·응답이 OpenAI 계정 대시보드에 저장되지 않게
// - 프롬프트·응답 내용은 로그로 남기지 않는다. 에러는 코드와 HTTP 상태만.

import OpenAI, { APIConnectionTimeoutError, APIError, AuthenticationError } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ResponseInputContent } from "openai/resources/responses/responses";
import type { z } from "zod";
import { env } from "./env";
import type { ErrorCode } from "./schema";

const TIMEOUT_MS = 45_000;

export class LlmError extends Error {
  readonly code: ErrorCode;
  constructor(code: ErrorCode) {
    super(code);
    this.code = code;
  }
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!env.openaiApiKey) throw new LlmError("OPENAI_KEY_MISSING");
  // 재시도는 아래 generateValidated에서 직접 관리하므로 SDK 자동 재시도는 끈다
  client ??= new OpenAI({ apiKey: env.openaiApiKey, timeout: TIMEOUT_MS, maxRetries: 0 });
  return client;
}

/** 이미지 입력 (GPT 1차 전용). base64 JPEG를 data URL로 감싼다. */
export function imageContent(base64: string): ResponseInputContent {
  return { type: "input_image", image_url: `data:image/jpeg;base64,${base64}`, detail: "high" };
}

export function textContent(text: string): ResponseInputContent {
  return { type: "input_text", text };
}

type GenerateOptions<W extends z.ZodType> = {
  /** 로그용 이름 (예: "extract") */
  name: string;
  /** 모델에 넘기는 구조화 출력 스키마 */
  wireSchema: W;
  instructions: string;
  content: ResponseInputContent[];
  temperature: number;
};

function toLlmError(err: unknown, name: string): LlmError {
  if (err instanceof LlmError) return err;
  let code: ErrorCode = "OPENAI_ERROR";
  if (err instanceof APIConnectionTimeoutError) code = "OPENAI_TIMEOUT";
  else if (err instanceof AuthenticationError) code = "OPENAI_KEY_MISSING"; // 키가 틀렸을 때도 개발자가 키를 확인하도록
  const status = err instanceof APIError ? err.status : undefined;
  console.error(`[openai:${name}] ${code}`, status ?? (err instanceof Error ? err.name : "unknown"));
  return new LlmError(code);
}

/**
 * 구조화 출력으로 호출하고 strictSchema로 검사한다.
 * 형식이 틀리면 1회 다시 요청하고, 그래도 틀리면 null을 돌려준다(라우트에서 원인별 에러 코드로 바꿈).
 * 네트워크·인증·타임아웃 같은 API 에러는 LlmError로 던진다.
 */
export async function generateValidated<W extends z.ZodType, T>(
  opts: GenerateOptions<W>,
  strictSchema: z.ZodType<T>,
  attempts = 2,
): Promise<T | null> {
  const openai = getClient();
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await openai.responses.parse({
        model: env.openaiModel,
        store: false,
        temperature: opts.temperature,
        instructions: opts.instructions,
        input: [{ role: "user", content: opts.content }],
        text: { format: zodTextFormat(opts.wireSchema, opts.name) },
      });
      const checked = strictSchema.safeParse(res.output_parsed);
      if (checked.success) return checked.data;
      console.error(`[openai:${opts.name}] 형식 검사 실패 (시도 ${i + 1}/${attempts})`);
    } catch (err) {
      // API 에러는 다시 시도해도 같으므로 바로 던진다. 응답 파싱 실패(JSON·zod)만 재시도한다.
      if (err instanceof APIError || err instanceof LlmError) throw toLlmError(err, opts.name);
      console.error(`[openai:${opts.name}] 응답 파싱 실패 (시도 ${i + 1}/${attempts})`, err instanceof Error ? err.name : "");
    }
  }
  return null;
}
