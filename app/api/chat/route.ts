import { env } from "@/lib/env";
import { errorFor, errorFromException, readJson } from "@/lib/http";
import { mockChat } from "@/lib/mock";
import { generateValidated, textContent } from "@/lib/openai";
import { buildChatInstructions } from "@/lib/prompts";
import { ChatRequestSchema, ChatResponseSchema, ChatWireSchema, type ChatResponse } from "@/lib/schema";
import { verifyEvidence } from "@/lib/validate";

// Vercel 서버 함수 최대 실행 시간(초)
export const maxDuration = 60;

/** 이전 대화는 최근 몇 개만 보낸다 (토큰 절약) */
const MAX_HISTORY = 10;

// 문서 기반 질문·답변. 마스킹된 텍스트와 질문만 받는다(이미지 없음). 질문 내용은 로그로 남기지 않는다.
export async function POST(request: Request) {
  const parsed = ChatRequestSchema.safeParse(await readJson(request));
  if (!parsed.success) return errorFor("BAD_REQUEST");

  const { maskedText, question, history = [], level = "easy" } = parsed.data;

  if (env.mockLlm) {
    const body: ChatResponse = await mockChat(question);
    return Response.json(body);
  }

  try {
    const result = await generateValidated(
      {
        name: "chat",
        wireSchema: ChatWireSchema,
        instructions: buildChatInstructions(maskedText, level),
        history: history.slice(-MAX_HISTORY),
        content: [textContent(question)],
        temperature: 0.2,
      },
      ChatResponseSchema,
    );
    if (!result) return errorFor("CHAT_FAILED");

    // 근거 문장이 원문에 실제로 있을 때만 보여 준다 (고쳐 쓴 문장이면 null)
    const body: ChatResponse = { answer: result.answer, evidence: verifyEvidence(result.evidence, maskedText) };
    return Response.json(body);
  } catch (err) {
    return errorFromException(err, "chat");
  }
}
