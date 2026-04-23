"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { createProject } from "@/lib/actions/project";
import { generateProjectKey } from "@/lib/validations/project";

import type { ProjectFormState } from "@/lib/actions/project";

const COLOR_PRESETS: { value: string; label: string }[] = [
  { value: "#2563eb", label: "ブルー" },
  { value: "#16a34a", label: "グリーン" },
  { value: "#dc2626", label: "レッド" },
  { value: "#f59e0b", label: "オレンジ" },
  { value: "#9333ea", label: "パープル" },
  { value: "#0ea5e9", label: "シアン" },
];

export const ProjectCreateForm = () => {
  const [state, formAction, isPending] = useActionState<ProjectFormState, FormData>(
    createProject,
    null,
  );
  const [name, setName] = useState("");
  const [customKey, setCustomKey] = useState<string | null>(null);
  const [color, setColor] = useState(COLOR_PRESETS[0].value);

  const autoKey = name.trim() === "" ? "" : generateProjectKey(name);
  const keyValue = customKey ?? autoKey;

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
          プロジェクト名 <span className="text-danger">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: Devin Task Board"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {state?.fieldErrors?.name && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-foreground">
          説明
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="プロジェクトの概要を入力"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {state?.fieldErrors?.description && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="key" className="mb-1 block text-sm font-medium text-foreground">
          プロジェクトキー
        </label>
        <input
          id="key"
          name="key"
          type="text"
          value={keyValue}
          onChange={(e) => {
            setCustomKey(e.target.value.toUpperCase());
          }}
          placeholder="DTB"
          maxLength={10}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          英大文字と数字 2〜10 文字。空欄の場合は名前から自動生成されます。
        </p>
        {state?.fieldErrors?.key && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.key[0]}</p>
        )}
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-foreground">アイコン色</span>
        <input type="hidden" name="color" value={color} />
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setColor(preset.value)}
              aria-label={preset.label}
              aria-pressed={color === preset.value}
              className={`h-8 w-8 rounded-md border-2 transition-all ${
                color === preset.value
                  ? "border-foreground scale-110"
                  : "border-transparent hover:border-border"
              }`}
              style={{ backgroundColor: preset.value }}
            />
          ))}
          <label className="ml-2 flex items-center gap-2 text-xs text-muted-foreground">
            カスタム
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-input bg-transparent"
            />
          </label>
        </div>
        {state?.fieldErrors?.color && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.color[0]}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Link
          href="/projects"
          className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "作成中..." : "プロジェクトを作成"}
        </button>
      </div>
    </form>
  );
};
