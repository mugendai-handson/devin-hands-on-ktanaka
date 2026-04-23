import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProjectSettingsForm } from "@/components/projects/ProjectSettingsForm";
import { ProjectDeleteButton } from "@/components/projects/ProjectDeleteButton";

const roleLabel: Record<string, string> = {
  OWNER: "オーナー",
  ADMIN: "管理者",
  MEMBER: "メンバー",
  VIEWER: "閲覧者",
};

const ProjectSettingsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [project, membership] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.user.id } },
      select: { role: true },
    }),
  ]);

  if (!project || !membership) {
    notFound();
  }

  const canEdit = membership.role === "OWNER" || membership.role === "ADMIN";
  const canDelete = membership.role === "OWNER";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link
          href={`/projects/${id}/board`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={16} />
          ボードへ戻る
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">プロジェクト設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {project.name}（あなたの権限: {roleLabel[membership.role] ?? membership.role}）
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-card-foreground">基本情報</h2>
        <ProjectSettingsForm
          projectId={project.id}
          initialName={project.name}
          initialDescription={project.description}
          initialKey={project.key}
          initialColor={project.color}
          canEdit={canEdit}
        />
      </div>

      {canDelete && (
        <div className="rounded-lg border border-danger/30 bg-card p-6">
          <h2 className="text-lg font-semibold text-danger">危険な操作</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            プロジェクトを削除すると、関連するタスク・コメント・添付ファイルが全て削除されます。この操作は取り消せません。
          </p>
          <div className="mt-4">
            <ProjectDeleteButton projectId={project.id} projectName={project.name} />
          </div>
        </div>
      )}
    </div>
  );
};
export default ProjectSettingsPage;
