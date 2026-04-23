"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteProject } from "@/lib/actions/project";

interface ProjectDeleteButtonProps {
  projectId: string;
  projectName: string;
}

export const ProjectDeleteButton = ({ projectId, projectName }: ProjectDeleteButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  const canDelete = confirmText === projectName;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProject(projectId);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        プロジェクトを削除
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => !isPending && setIsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-card-foreground">
              プロジェクトを削除しますか？
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              この操作は取り消せません。プロジェクト内のすべてのタスク・コメント・添付ファイルが削除されます。
            </p>
            <p className="mt-3 text-sm text-foreground">
              確認のため、プロジェクト名{" "}
              <span className="font-semibold">{projectName}</span> を入力してください。
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={projectName}
              className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canDelete || isPending}
                className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
