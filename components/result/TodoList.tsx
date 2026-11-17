"use client";

import { useState } from "react";
import { formatShortDate } from "@/lib/format";
import type { ExplainResponse } from "@/lib/schema";

/** 해야 할 일 체크리스트. 체크 상태는 이 컴포넌트 메모리에만 있다. */
export function TodoList({ todos }: { todos: ExplainResponse["todos"] }) {
  const [checked, setChecked] = useState<boolean[]>(() => todos.map(() => false));
  if (todos.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 p-4" aria-labelledby="todo-title">
      <h2 id="todo-title" className="mb-2 font-bold">
        <span aria-hidden>✅ </span>해야 할 일
      </h2>
      <ul className="flex flex-col">
        {todos.map((todo, i) => (
          <li key={i}>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => setChecked((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                className="mt-1 size-5 shrink-0 accent-brand"
              />
              <span className={checked[i] ? "text-slate-400 line-through" : ""}>
                {todo.task}
                {/* 할 일 문장에 이미 날짜가 있으면 중복해서 붙이지 않는다 */}
                {todo.due && !todo.task.includes(formatShortDate(todo.due)) && (
                  <span className="ml-1 text-sm text-slate-500">({formatShortDate(todo.due)}까지)</span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
