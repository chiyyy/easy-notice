import { z } from "zod";

// ───────── 공통 ─────────

export const DocTypeSchema = z.enum(["bill", "contract", "notice", "medical", "other"]);
export type DocType = z.infer<typeof DocTypeSchema>;

export const LevelSchema = z.enum(["easy", "normal"]);
export type Level = z.infer<typeof LevelSchema>;

/** 날짜 문자열 YYYY-MM-DD */
const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** 1단계에서 뽑은 핵심 정보 (마스킹 후) */
export const FieldsSchema = z.object({
  deadline: IsoDateSchema.nullable(),
  amount: z.number().int().nonnegative().nullable(),
  place: z.string().nullable(),
  items: z.array(z.string()),
  contact: z.string().nullable(),
});
export type Fields = z.infer<typeof FieldsSchema>;

/** 요청으로 받는 마스킹 원문 (한 장짜리 문서는 보통 5천 자 이하) */
const MaskedTextInputSchema = z.string().min(1).max(20_000);

/** 요청으로 받는 핵심 정보 (응답용 FieldsSchema에 길이 제한을 더한 것) */
const FieldsInputSchema = FieldsSchema.extend({
  place: z.string().max(500).nullable(),
  items: z.array(z.string().max(500)).max(30),
  contact: z.string().max(500).nullable(),
});

// ───────── 에러 ─────────

export const ErrorCodeSchema = z.enum([
  "BAD_REQUEST",
  "OPENAI_KEY_MISSING",
  "OPENAI_TIMEOUT",
  "OPENAI_ERROR",
  "EXTRACT_PARSE_ERROR",
  "LOW_QUALITY_IMAGE",
  "EXPLAIN_FAILED",
  "CHAT_FAILED",
  "TRANSLATE_FAILED",
  "NOT_IMPLEMENTED", // 아직 구현 전인 경로
  "INTERNAL_ERROR",
]);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ApiErrorSchema = z.object({ code: ErrorCodeSchema });
export type ApiError = z.infer<typeof ApiErrorSchema>;

// ───────── 1~2단계: /api/extract ─────────

/** GPT 1차(Vision)가 돌려주는 원시 추출 결과 (구조화 출력 스키마로도 사용) */
export const ExtractLlmSchema = z.object({
  doc_type: DocTypeSchema,
  full_text: z.string(),
  deadline: IsoDateSchema.nullable(),
  amount: z.number().int().nonnegative().nullable(),
  place: z.string().nullable(),
  items: z.array(z.string()),
  contact: z.string().nullable(),
});
export type ExtractLlm = z.infer<typeof ExtractLlmSchema>;

/**
 * 모델에 구조화 출력 형식으로 넘기는 "느슨한" 스키마.
 * 날짜 형식·개수 같은 세부 조건은 모델 스키마에 넣지 않고, 받은 뒤 위의 엄격한 스키마로 검사한다(실패 시 1회 재시도).
 */
export const ExtractWireSchema = z.object({
  doc_type: DocTypeSchema,
  full_text: z.string(),
  deadline: z.string().nullable().describe("YYYY-MM-DD"),
  amount: z.number().nullable().describe("원 단위 정수"),
  place: z.string().nullable(),
  items: z.array(z.string()),
  contact: z.string().nullable(),
});

export const ExtractRequestSchema = z.object({
  // 1600px JPEG는 보통 1MB 안팎. Vercel 본문 한도(4.5MB)를 넘지 않게 상한을 둔다
  imageBase64: z.string().min(1).max(4_400_000),
});
export type ExtractRequest = z.infer<typeof ExtractRequestSchema>;

export const ExtractResponseSchema = z.object({
  docType: DocTypeSchema,
  maskedText: z.string(),
  fields: FieldsSchema,
  maskedCount: z.number().int().nonnegative(),
});
export type ExtractResponse = z.infer<typeof ExtractResponseSchema>;

// ───────── 3~5단계: /api/explain ─────────

/** GPT 구조화 출력 스키마 */
export const ExplainLlmSchema = z.object({
  summary: z.array(z.string()).length(3),
  paragraphs: z.array(z.object({ title: z.string(), easy: z.string() })),
  todos: z.array(z.object({ task: z.string(), due: IsoDateSchema.nullable() })),
  warnings: z.array(z.string()),
  terms: z.array(
    z.object({
      word: z.string(),
      meaning: z.string(),
      example: z.string().nullable(),
    }),
  ),
});
export type ExplainLlm = z.infer<typeof ExplainLlmSchema>;

/** GPT 2차에 넘기는 느슨한 스키마 (검사는 ExplainLlmSchema로) */
export const ExplainWireSchema = z.object({
  summary: z.array(z.string()).describe("정확히 3문장"),
  paragraphs: z.array(z.object({ title: z.string(), easy: z.string() })),
  todos: z.array(z.object({ task: z.string(), due: z.string().nullable().describe("YYYY-MM-DD") })),
  warnings: z.array(z.string()),
  terms: z.array(z.object({ word: z.string(), meaning: z.string(), example: z.string().nullable() })),
});

export const DdaySchema = z.object({
  /** 기한까지 남은 일수 (오늘=0, 지났으면 음수) */
  daysLeft: z.number().int(),
  /** 화면 표시용: "D-6", "D-day", "기한 지남" */
  label: z.string(),
});
export type Dday = z.infer<typeof DdaySchema>;

export const ExplainRequestSchema = z.object({
  docType: DocTypeSchema,
  maskedText: MaskedTextInputSchema,
  fields: FieldsInputSchema,
  level: LevelSchema,
});
export type ExplainRequest = z.infer<typeof ExplainRequestSchema>;

export const ExplainResponseSchema = ExplainLlmSchema.extend({
  fields: FieldsSchema,
  dday: DdaySchema.nullable(),
  mismatchWarning: z.boolean(),
});
export type ExplainResponse = z.infer<typeof ExplainResponseSchema>;

// ───────── /api/chat ─────────

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(2000),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  maskedText: MaskedTextInputSchema,
  question: z.string().min(1).max(500),
  history: z.array(ChatMessageSchema).max(20).optional(),
  level: LevelSchema.optional(),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResponseSchema = z.object({
  answer: z.string(),
  evidence: z.string().nullable(),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

/** GPT에 넘기는 질문·답변 스키마 (근거는 받은 뒤 원문에 실제로 있는지 코드로 확인) */
export const ChatWireSchema = z.object({
  answer: z.string(),
  evidence: z.string().nullable().describe("답의 근거가 된 원문 문장을 글자 그대로. 없으면 null"),
});

// ───────── /api/translate ─────────

export const LangSchema = z.enum(["en", "zh", "vi"]);
export type Lang = z.infer<typeof LangSchema>;

/** 번역할 부분: 요약·할 일·주의할 점 (2차 결과. 원문·이미지는 보내지 않는다) */
export const TranslatableSchema = z.object({
  summary: z.array(z.string().max(500)).max(5),
  todos: z.array(z.object({ task: z.string().max(500), due: IsoDateSchema.nullable() })).max(10),
  warnings: z.array(z.string().max(500)).max(10),
});
export type Translatable = z.infer<typeof TranslatableSchema>;

export const TranslateRequestSchema = z.object({
  result: TranslatableSchema,
  lang: LangSchema,
});
export type TranslateRequest = z.infer<typeof TranslateRequestSchema>;

export const TranslateResponseSchema = TranslatableSchema.extend({
  /** 번역문에 원문의 숫자(금액·날짜)가 빠졌으면 true → 한국어 요약을 확인하라고 안내 */
  numberMismatch: z.boolean(),
});
export type TranslateResponse = z.infer<typeof TranslateResponseSchema>;

/** GPT에 넘기는 번역 스키마. 문장 배열만 받고, 기한(due)은 코드에서 그대로 붙인다 */
export const TranslateWireSchema = z.object({
  summary: z.array(z.string()),
  todos: z.array(z.string()),
  warnings: z.array(z.string()),
});
export type TranslateWire = z.infer<typeof TranslateWireSchema>;

/** 번역 결과 검사: 문장 개수가 원본과 같아야 한다 */
export function translateStrictSchema(src: Translatable) {
  const line = z.string().trim().min(1);
  return z.object({
    summary: z.array(line).length(src.summary.length),
    todos: z.array(line).length(src.todos.length),
    warnings: z.array(line).length(src.warnings.length),
  });
}
