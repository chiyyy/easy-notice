"use client";

import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
const isSupported = () => "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

function findKoreanVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  return synth.getVoices().find((v) => v.lang.replace("_", "-").toLowerCase().startsWith("ko"));
}

/**
 * 브라우저 내장 음성(Web Speech API)으로 글을 읽어 준다. 외부 서버로 글을 보내지 않는다.
 * - supported: 서버 렌더링 때는 false, 브라우저에서 지원 여부를 확인한 뒤 true
 * - 화면이 사라지거나 숨겨지면(React Activity) 읽기를 멈춘다
 */
export function useSpeech() {
  const supported = useSyncExternalStore(noopSubscribe, isSupported, () => false);
  const [speaking, setSpeaking] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  // 읽기를 새로 시작하거나 멈출 때마다 바뀌는 번호. 이전 읽기의 늦은 이벤트를 무시하는 데 쓴다.
  const tokenRef = useRef(0);

  const stop = useCallback(() => {
    tokenRef.current += 1;
    if (isSupported()) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  // useLayoutEffect cleanup은 화면이 숨겨질 때도 실행된다 → 다른 화면에서 계속 말하지 않게
  useLayoutEffect(() => stop, [stop]);

  const speak = useCallback((lines: string[]) => {
    if (!isSupported() || lines.length === 0) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const token = ++tokenRef.current;
    const voice = findKoreanVoice(synth);
    // 음성 목록을 이미 받았는데 한국어가 없으면 엉뚱한 언어로 읽게 되므로 알려 준다
    if (!voice && synth.getVoices().length > 0) {
      setNoVoice(true);
      return;
    }
    setNoVoice(false);

    const finish = () => {
      if (tokenRef.current === token) setSpeaking(false);
    };
    lines.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ko-KR";
      if (voice) u.voice = voice;
      u.rate = 0.95;
      u.onerror = finish;
      if (i === lines.length - 1) u.onend = finish;
      synth.speak(u);
    });
    setSpeaking(true);
  }, []);

  return { supported, speaking, noVoice, speak, stop };
}
