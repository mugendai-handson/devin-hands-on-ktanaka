import Link from "next/link";
import { FolderKanban } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ProjectsPage = async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const memberships = await prisma.projectMember.findMany({
    where: { userId: session.user.id },
    include: {
      project: {
        include: {
          _count: { select: { tasks: true, members: true } },
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-foreground">プロジェクト</h1>

      {memberships.length === 0 ? (
        <p className="text-muted-foreground">参加中のプロジェクトはありません</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {memberships.map(({ project }) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/board`}
              className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FolderKanban size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-card-foreground">{project.name}</h2>
                  <p className="text-xs text-muted-foreground">{project.key}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span>タスク {project._count.tasks}</span>
                <span>メンバー {project._count.members}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default ProjectsPage;
