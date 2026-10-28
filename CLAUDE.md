@AGENTS.md

# 쉬운말 번역기 (easy-notice) — 작업 기준 문서

어려운 생활 문서(고지서·임대차계약서·병원·학교 안내문) 사진을 **쉬운 말 3줄 요약 + 핵심 정보(기한·금액) + 해야 할 일 체크리스트**로 바꿔 주는 모바일 웹.
핵심 가치: "무슨 내용인지"보다 **"내가 언제까지 무엇을 해야 하는지"**.

- 사용자: 어르신, 외국인 주민·유학생, 사회초년생·대학생, 보호자
- 마감: **11/17 시연 가능 완성** (11/18 수업 발표·30초 시연, 12/2 교내 경진대회)
- 시연 시나리오: 휴대폰으로 과태료 고지서 촬영 → 분석 중 → 결과(요약·정보 카드·할 일) → 용어 풀이
- 개발자는 React+TS 경험자, Next.js App Router·LLM 연동은 처음 → 서버/클라이언트 컴포넌트, Route Handler 등 Next.js 개념이 나오면 짧게 설명할 것

## 아키텍처 (변경 금지 — 교수님 피드백으로 확정)

```
이미지 → [1] Ollama Vision 추출 → [2] 개인정보 마스킹 → [3] 프롬프트 생성 → [4] GPT(OpenAI) → [5] 검증·후처리 → 쉬운 안내문
         └──────── /api/extract ────────┘   └──────────── /api/explain ────────────┘
```

**절대 규칙**
- 원본 이미지는 **로컬 Ollama에서만** 처리. OpenAI로 이미지 전송 코드 금지.
- OpenAI에는 **마스킹된 텍스트만** 전송.
- 이미지·문서 텍스트 **서버 저장 금지**(DB·파일 없음). localStorage 저장도 금지.
- 개인정보가 포함될 수 있는 텍스트(원문, maskedText, 질문 등)는 **console.log 금지**. 에러 로그는 에러 코드·메시지만.
- API 키는 Route Handler(서버)에서만. 서버 전용 모듈(`lib/openai.ts`, `lib/ollama.ts`)은 `import "server-only"`.

## 기술 스택 (변경 금지)
- Next.js 16 App Router (src 디렉터리 없음, `cacheComponents: true`), React 19, TypeScript strict, Tailwind CSS v4
- 백엔드: Route Handlers `app/api/**/route.ts` (POST만 사용 → 캐시되지 않음)
- Local LLM: Ollama HTTP API `/api/chat` + `format`(JSON schema), 기본 모델 `qwen2.5vl:7b`
- 생성형 AI: `openai` 공식 Node SDK, 구조화 출력(zod 연동 헬퍼), 기본 모델 `gpt-4o-mini`
- 검증: zod / 음성: Web Speech API / 테스트: vitest(순수 함수 위주)
- **추가 금지**: DB, 로그인, 결제, 분석 도구, 상태관리 라이브러리, UI 컴포넌트 라이브러리, 다른 LLM SDK. 새 패키지는 추가 전 이유 설명 후 확인.
- Next.js 코드 작성 전 `node_modules/next/dist/docs/`의 해당 문서 확인 (학습 데이터와 API가 다를 수 있음).

## 환경 변수 (`.env.local`은 커밋 금지, `.env.example`은 커밋)
```
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_VISION_MODEL=qwen2.5vl:7b
MOCK_LLM=false
```
`MOCK_LLM=true` → Ollama·OpenAI 호출 없이 `fixtures/`의 과태료 고지서 샘플을 1~2초 지연 후 반환. 키/Ollama 없이 UI 개발·시연 리허설 가능해야 함.

## 폴더 구조
```
app/
  page.tsx                 ① 홈·문서 촬영
  analyzing/page.tsx       ② 분석 중
  result/page.tsx          ③ 결과 (탭: 요약 / 원문·용어 / 질문하기 / 번역)
  api/extract/route.ts     1~2단계: Ollama Vision + 마스킹
  api/explain/route.ts     3~5단계: 프롬프트 + GPT + 검증
  api/chat/route.ts        문서 기반 Q&A
  api/translate/route.ts   번역 (선택)
components/                작은 단위 UI 컴포넌트 ('use client'는 필요한 곳만)
lib/
  ollama.ts, openai.ts     server-only
  mask.ts                  개인정보 마스킹
  prompts/                 모든 프롬프트 문자열 (extract, common, bill, contract, notice, chat, translate)
  schema.ts                zod 스키마 + z.infer 타입 (API 요청/응답 전부)
  dday.ts, validate.ts     D-day(Asia/Seoul), 날짜·금액 교차 검증
  image.ts                 클라이언트 이미지 전처리
  store.tsx                분석 결과 공유 React Context
fixtures/                  MOCK 응답 JSON
samples/                   실제 문서 이미지 (커밋 금지)
__tests__/                 vitest
```

## API 계약 요약
| 엔드포인트 | 요청 | 응답 |
|---|---|---|
| `POST /api/extract` | `{ imageBase64 }` | `{ docType, maskedText, fields:{deadline,amount,place,items,contact}, maskedCount }` |
| `POST /api/explain` | `{ docType, maskedText, fields, level:"easy"\|"normal" }` | `{ summary[3], paragraphs, todos, warnings, terms, fields, dday, mismatchWarning }` |
| `POST /api/chat` | `{ maskedText, question, history? }` | `{ answer, evidence \| null }` |
| `POST /api/translate` | `{ result, lang:"en"\|"zh"\|"vi" }` | 번역된 요약·할 일·주의 |

에러 코드: `OLLAMA_UNAVAILABLE`, `OLLAMA_TIMEOUT`(90초), `EXTRACT_PARSE_ERROR`, `LOW_QUALITY_IMAGE`(full_text 30자 미만), `EXPLAIN_FAILED`.
zod 검증 실패 시 1회 재시도. 교차 검증 불일치 시 1단계(원문) 값 우선 + `mismatchWarning`. maskedText에 없는 term 제거.

## 마스킹 규칙 (lib/mask.ts → `[개인정보]`, 치환 개수 반환, 단위 테스트 필수)
주민/외국인등록번호(6-7, 13자리, 뒷자리 첫 숫자 1~8) · 휴대전화 01X · 일반 전화 0XX(대표번호 1588-XXXX, 120 등은 유지) · 카드 4-4-4-4 · 계좌(하이픈 포함 10~14자리, "계좌" 근처 긴 숫자) · 라벨(성명/이름/납부자/임차인/임대인/수신인/환자명) 뒤 2~4자 한글 이름 · 주소는 상세(동·호수·번지)만.
날짜(2026-10-20), 금액(40,000원)은 절대 마스킹되면 안 됨.

## 프롬프트 규칙 (lib/prompts)
- 공통: 문서에 없는 내용 지어내지 않기 / `[개인정보]` 그대로 / 날짜·금액은 문서 그대로 / "~요"체
- easy: 한 문장 30자 안팎, 한자어·법률 용어 쉬운 말로 / normal: 핵심 용어 유지 + 괄호 설명
- bill: 금액·납부 기한·감경 조건·미납 불이익·납부 방법 필수
- contract: 기간·보증금·월세·특약·불리한 조항(warnings) 필수
- notice/medical/other: 일시·장소·준비물·신청·제출 방법

## UI/UX 규칙 (와이어프레임: docs/ui-wireframe.png)
- 모바일 우선(기준 375px), 데스크톱은 가운데 정렬 최대 430px
- 기본 글자 16px+, 큰 글씨 모드는 html font-size 약 1.2배
- 터치 영역 44px+, 주요 버튼은 아래쪽에 크게
- 색상: 메인 #2563eb, 경고 주황, D-day 빨강, 배경 흰색/연회색, 고대비
- UI 문구도 쉬운 말("업로드"→"사진 올리기", "분석"→"읽는 중")
- 접근성: aria-label, alt, 키보드 포커스 표시. 모든 화면에 로딩·빈·에러 상태 처리
- 결과가 Context에 없으면(새로고침 등) 홈으로 리다이렉트

## 코드 품질
- `any` 금지, API 타입은 zod 스키마에서 `z.infer`
- 프롬프트 문자열은 lib/prompts에만
- 순수 함수(mask, dday, validate, 프롬프트 조립)는 vitest 테스트
- README는 현재 분량 유지, 실행 방법·API가 실제와 달라지면 함께 수정

## 명령어
```bash
npm run dev                 # http://localhost:3000
npm run dev -- -H 0.0.0.0   # 같은 와이파이의 휴대폰에서 접속
npm run lint
npx tsc --noEmit
npm test                    # vitest run
ollama pull qwen2.5vl:7b
```

## 작업 방식
- Phase 단위로 진행, **각 Phase 끝나면 멈추고 보고 → 확인 후 다음 Phase**. 여러 Phase 한꺼번에 진행 금지.
- Phase 종료 전 `npm run lint`, `npx tsc --noEmit`, `npm test` 통과 확인
- 브랜치: `main` ← `develop` ← `feature/phaseN-<설명>`. 모든 개발은 develop에서 브랜치를 따서 진행 (main·develop에 직접 커밋 금지, 병합은 사용자 확인 후)
- 커밋은 Phase 단위, 한국어 conventional 메시지 (예: `feat: 개인정보 마스킹 모듈 추가`)
- 사용자에게 보고·설명은 한국어로
- 보고 형식: ① 만든 파일 목록 ② 직접 확인 방법(명령·클릭 순서) ③ 다음 Phase 계획 ④ 사용자가 할 일

| Phase | 내용 |
|---|---|
| 0 | 세팅: CLAUDE.md, .env.example, 패키지, 폴더, zod 스키마, fixtures, MOCK_LLM |
| 1 | 홈 + 이미지 전처리 + 분석 중 화면 + Context (MOCK으로 흐름 끝까지) |
| 2 | /api/extract (Ollama) + mask.ts + 테스트 |
| 3 | /api/explain (프롬프트·구조화 출력·검증·D-day) + 결과 요약 탭 → 기능 1·2 |
| 4 | 원문·용어 탭(하이라이트·팝업) → 기능 3, MVP |
| 5 | 질문하기 탭 + /api/chat → 기능 4 |
| 6 | 큰 글씨, TTS, 에러·반응형 점검, 시연 준비(-H 0.0.0.0, Cloudflare Tunnel) |
| 7 | (선택) 번역 탭 + /api/translate → 기능 5 |
