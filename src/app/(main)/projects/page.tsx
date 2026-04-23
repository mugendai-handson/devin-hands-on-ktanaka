import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const roleLabel: Record<string, string> = {
  OWNER: "オーナー",
  ADMIN: "管理者",
  MEMBER: "メンバー",
  VIEWER: "閲覧者",
};

const ProjectsPage = async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const memberships = await prisma.projectMember.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      project: {
        include: {
          owner: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { tasks: true, members: true } },
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">プロジェクト</h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus size={16} />
          新規作成
        </Link>
      </div>

      {memberships.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">参加中のプロジェクトはありません</p>
          <Link
            href="/projects/new"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus size={16} />
            最初のプロジェクトを作成
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {memberships.map(({ project, role }) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/board`}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-primary-foreground"
                  style={{ backgroundColor: project.color ?? "oklch(0.35 0.08 230)" }}
                >
                  <FolderKanban size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-card-foreground">
                    {project.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {project.key} ／ {roleLabel[role] ?? role}
                  </p>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>タスク {project._count.tasks}</span>
                  <span>メンバー {project._count.members}</span>
                </div>
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground"
                  title={`オーナー: ${project.owner.name}`}
                >
                  {project.owner.name.slice(0, 1)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default ProjectsPage;
