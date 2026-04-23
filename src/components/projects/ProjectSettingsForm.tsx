"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { updateProject } from "@/lib/actions/project";

import type { ProjectFormState } from "@/lib/actions/project";

interface ProjectSettingsFormProps {
  projectId: string;
  initialName: string;
  initialDescription: string | null;
  initialKey: string;
  initialColor: string | null;
  canEdit: boolean;
}

const DEFAULT_COLOR = "#2563eb";

export const ProjectSettingsForm = ({
  projectId,
  initialName,
  initialDescription,
  initialKey,
  initialColor,
  canEdit,
}: ProjectSettingsFormProps) => {
  const boundAction = updateProject.bind(null, projectId);
  const [state, formAction, isPending] = useActionState<ProjectFormState, FormData>(
    boundAction,
    null,
  );
  const [color, setColor] = useState(initialColor ?? DEFAULT_COLOR);

  useEffect(() => {
    if (state?.success) {
      toast.success("プロジェクトを更新しました");
    }
  }, [state?.success]);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  return (
    <form action={formAction} className="space-y-5">
      <fieldset disabled={!canEdit || isPending} className="space-y-5 disabled:opacity-60">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
            プロジェクト名
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
            defaultValue={initialName}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
            defaultValue={initialDescription ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
            defaultValue={initialKey}
            maxLength={10}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
            }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            英大文字と数字 2〜10 文字。
          </p>
          {state?.fieldErrors?.key && (
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.key[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="color" className="mb-1 block text-sm font-medium text-foreground">
            アイコン色
          </label>
          <div className="flex items-center gap-3">
            <input
              id="color"
              name="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded border border-input bg-transparent"
            />
            <span className="text-xs text-muted-foreground">{color}</span>
          </div>
          {state?.fieldErrors?.color && (
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.color[0]}</p>
          )}
        </div>

        {canEdit && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "保存中..." : "保存"}
            </button>
          </div>
        )}
      </fieldset>

      {!canEdit && (
        <p className="text-sm text-muted-foreground">
          プロジェクト設定は OWNER または ADMIN のみ編集できます。
        </p>
      )}
    </form>
  );
};
