"use client";

import { useActionState, useRef, useEffect } from "react";

import { createTask } from "@/lib/actions/task";

import type { TaskFormState } from "@/lib/actions/task";

type Member = {
  userId: string;
  user: { id: string; name: string };
};

type TaskFormProps = {
  projectId: string;
  members: Member[];
  onClose?: () => void;
};

export const TaskForm = ({ projectId, members, onClose }: TaskFormProps) => {
  const boundAction = createTask.bind(null, projectId);
  const [state, formAction, isPending] = useActionState<TaskFormState, FormData>(boundAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      onClose?.();
    }
  }, [state?.success, onClose]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      {state?.error && (
        <div className="rounded-md bg-danger/10 p-2 text-sm text-danger">{state.error}</div>
      )}

      <div>
        <input
          name="title"
          placeholder="タスクタイトル *"
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {state?.fieldErrors?.title && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <textarea
        name="description"
        placeholder="説明（Markdown 対応）"
        rows={3}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          name="status"
          defaultValue="BACKLOG"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="BACKLOG">Backlog</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>

        <select
          name="priority"
          defaultValue="NONE"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="NONE">優先度なし</option>
          <option value="LOW">低</option>
          <option value="MEDIUM">中</option>
          <option value="HIGH">高</option>
          <option value="URGENT">緊急</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          name="assigneeId"
          defaultValue=""
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">担当者なし</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.user.name}
            </option>
          ))}
        </select>

        <input
          name="dueDate"
          type="date"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "作成中..." : "タスクを作成"}
        </button>
      </div>
    </form>
  );
};
