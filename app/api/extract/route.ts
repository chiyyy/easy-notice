import { env } from "@/lib/env";
import { errorFor, errorFromException, readJson } from "@/lib/http";
import { maskField, maskText } from "@/lib/mask";
import { mockExtract } from "@/lib/mock";
import { generateValidated, imageContent, textContent } from "@/lib/openai";
import { EXTRACT_INSTRUCTIONS, EXTRACT_USER_TEXT } from "@/lib/prompts";
import { ExtractLlmSchema, ExtractRequestSchema, ExtractWireSchema, type ExtractResponse } from "@/lib/schema";

// Vercel 서버 함수 최대 실행 시간(초). GPT 응답을 기다려야 해서 기본값보다 길게 둔다.
export const maxDuration = 60;

/** full_text가 이보다 짧으면 사진이 흐리거나 문서가 아니라고 본다 */
const MIN_TEXT_LENGTH = 30;

// 1단계(GPT 1차 Vision 추출) + 2단계(개인정보 마스킹)
// Route Handler: app/api/**/route.ts에서 HTTP 메서드 이름으로 함수를 내보내면 그 요청을 서버에서 처리한다.
export async function POST(request: Request) {
  const parsed = ExtractRequestSchema.safeParse(await readJson(request));
  if (!parsed.success) return errorFor("BAD_REQUEST");

  if (env.mockLlm) {
    const body: ExtractResponse = await mockExtract();
    return Response.json(body);
  }

  try {
    // 이미지는 이 호출에만 쓰이고 서버 어디에도 저장하지 않는다
    const raw = await generateValidated(
      {
        name: "extract",
        wireSchema: ExtractWireSchema,
        instructions: EXTRACT_INSTRUCTIONS,
        content: [imageContent(parsed.data.imageBase64), textContent(EXTRACT_USER_TEXT)],
        temperature: 0,
      },
      ExtractLlmSchema,
    );
    if (!raw) return errorFor("EXTRACT_PARSE_ERROR");
    if (raw.full_text.trim().length < MIN_TEXT_LENGTH) return errorFor("LOW_QUALITY_IMAGE");

    // 2단계: 원문과 각 필드를 마스킹. 이후 단계(GPT 2차·질문·번역)는 이 결과만 쓴다.
    const text = maskText(raw.full_text);
    const place = maskField(raw.place);
    const contact = maskField(raw.contact);
    const items = raw.items.map((item) => maskField(item));

    const body: ExtractResponse = {
      docType: raw.doc_type,
      maskedText: text.text,
      fields: {
        deadline: raw.deadline,
        amount: raw.amount,
        place: place.value,
        items: items.map((i) => i.value).filter((v): v is string => v !== null),
        contact: contact.value,
      },
      maskedCount: text.count + place.count + contact.count + items.reduce((n, i) => n + i.count, 0),
    };
    return Response.json(body);
  } catch (err) {
    return errorFromException(err, "extract");
  }
}
