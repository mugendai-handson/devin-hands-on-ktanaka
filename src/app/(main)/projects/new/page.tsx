import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { ProjectCreateForm } from "@/components/projects/ProjectCreateForm";

const NewProjectPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={16} />
          プロジェクト一覧へ戻る
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">新規プロジェクト</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          タスクを整理するためのプロジェクトを作成します。
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <ProjectCreateForm />
      </div>
    </div>
  );
};
export default NewProjectPage;
