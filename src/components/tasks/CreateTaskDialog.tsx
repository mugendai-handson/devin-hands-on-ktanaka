"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { TaskForm } from "@/components/tasks/TaskForm";

type Member = {
  userId: string;
  user: { id: string; name: string };
};

type CreateTaskDialogProps = {
  projectId: string;
  members: Member[];
};

export const CreateTaskDialog = ({ projectId, members }: CreateTaskDialogProps) => {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        <Plus size={16} />
        タスクを作成
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-lg">
      <h3 className="mb-3 text-sm font-semibold text-foreground">新しいタスク</h3>
      <TaskForm
        projectId={projectId}
        members={members}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};
