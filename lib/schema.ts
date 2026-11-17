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
  "NOT_IMPLEMENTED", // 아직 구현 전인 실제 LLM 경로 (Phase 2~ 에서 제거)
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

export const ExtractRequestSchema = z.object({
  imageBase64: z.string().min(1),
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

export const DdaySchema = z.object({
  /** 기한까지 남은 일수 (오늘=0, 지났으면 음수) */
  daysLeft: z.number().int(),
  /** 화면 표시용: "D-6", "D-day", "기한 지남" */
  label: z.string(),
});
export type Dday = z.infer<typeof DdaySchema>;

export const ExplainRequestSchema = z.object({
  docType: DocTypeSchema,
  maskedText: z.string().min(1),
  fields: FieldsSchema,
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
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  maskedText: z.string().min(1),
  question: z.string().min(1).max(500),
  history: z.array(ChatMessageSchema).max(20).optional(),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResponseSchema = z.object({
  answer: z.string(),
  evidence: z.string().nullable(),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

// ───────── /api/translate (선택) ─────────

export const LangSchema = z.enum(["en", "zh", "vi"]);
export type Lang = z.infer<typeof LangSchema>;

export const TranslatableSchema = z.object({
  summary: z.array(z.string()),
  todos: z.array(z.object({ task: z.string(), due: IsoDateSchema.nullable() })),
  warnings: z.array(z.string()),
});
export type Translatable = z.infer<typeof TranslatableSchema>;

export const TranslateRequestSchema = z.object({
  result: TranslatableSchema,
  lang: LangSchema,
});
export type TranslateRequest = z.infer<typeof TranslateRequestSchema>;

export const TranslateResponseSchema = TranslatableSchema;
export type TranslateResponse = z.infer<typeof TranslateResponseSchema>;
