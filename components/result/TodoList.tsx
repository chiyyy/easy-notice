"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { formatShortDate } from "@/lib/format";
import type { ExplainResponse } from "@/lib/schema";

/** 해야 할 일 체크리스트. 체크 상태는 이 컴포넌트 메모리에만 있다. */
export function TodoList({ todos }: { todos: ExplainResponse["todos"] }) {
  const [checked, setChecked] = useState<boolean[]>(() => todos.map(() => false));
  if (todos.length === 0) return null;

  return (
    <section className="px-5 py-6" aria-labelledby="todo-title">
      <h2 id="todo-title" className="text-heading font-bold">
        해야 할 일
      </h2>
      <ul className="mt-2">
        {todos.map((todo, i) => (
          <li key={i}>
            <label className="flex min-h-12 cursor-pointer items-start gap-3 py-2.5">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => setChecked((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                className="peer sr-only"
              />
              {/* 실제 체크박스는 숨기고 같은 상태를 그린다. 키보드 포커스는 peer로 표시 */}
              <span
                className={`mt-0.5 flex size-[1.375rem] shrink-0 items-center justify-center rounded-full border-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand ${
                  checked[i] ? "border-brand bg-brand" : "border-line"
                }`}
                aria-hidden
              >
                {checked[i] && <Check className="size-3.5 text-white" strokeWidth={3} />}
              </span>
              <span className={`text-body leading-relaxed ${checked[i] ? "text-muted line-through" : "text-ink"}`}>
                {todo.task}
                {/* 할 일 문장에 이미 날짜가 있으면 중복해서 붙이지 않는다 */}
                {todo.due && !todo.task.includes(formatShortDate(todo.due)) && (
                  <span className="ml-1.5 text-label text-muted">{formatShortDate(todo.due)}까지</span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
