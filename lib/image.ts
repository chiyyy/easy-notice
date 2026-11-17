// 클라이언트 이미지 전처리: 회전 보정 → 리사이즈 → JPEG 압축 → base64
// 브라우저 API(createImageBitmap, canvas)를 쓰므로 클라이언트 컴포넌트에서만 호출한다.

export const MAX_SIDE = 1600;
export const MIN_SIDE = 400;
const JPEG_QUALITY = 0.85;
const FALLBACK_QUALITY = 0.7;
/** Vercel 요청 본문 한도(4.5MB)보다 여유 있게 */
const MAX_BASE64_LENGTH = 3_500_000;

export type ImageErrorCode = "NOT_IMAGE" | "IMAGE_TOO_SMALL" | "IMAGE_DECODE_FAILED";

export class ImageError extends Error {
  readonly code: ImageErrorCode;
  constructor(code: ImageErrorCode) {
    super(code);
    this.code = code;
  }
}

export type PreparedImage = {
  /** 썸네일 표시용 data URL (메모리에만 보관) */
  dataUrl: string;
  /** API로 보낼 base64 (data: 접두어 제외) */
  base64: string;
};

/** 긴 변이 max를 넘으면 비율을 유지해 줄인 크기. 작으면 그대로. */
export function fitSize(width: number, height: number, max: number = MAX_SIDE) {
  const longSide = Math.max(width, height);
  if (longSide <= max) return { width, height };
  const scale = max / longSide;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export async function preprocessImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith("image/")) throw new ImageError("NOT_IMAGE");

  let bitmap: ImageBitmap;
  try {
    // 휴대폰 사진의 EXIF 회전 정보를 반영해서 똑바로 세운다
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageError("IMAGE_DECODE_FAILED");
  }

  try {
    if (Math.max(bitmap.width, bitmap.height) < MIN_SIDE) throw new ImageError("IMAGE_TOO_SMALL");

    const { width, height } = fitSize(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ImageError("IMAGE_DECODE_FAILED");
    // JPEG는 투명도가 없으니 흰 배경을 깔아 둔다 (PNG 스크린샷 대비)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    let dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    if (dataUrl.length > MAX_BASE64_LENGTH) dataUrl = canvas.toDataURL("image/jpeg", FALLBACK_QUALITY);

    return { dataUrl, base64: dataUrl.slice(dataUrl.indexOf(",") + 1) };
  } finally {
    bitmap.close();
  }
}
