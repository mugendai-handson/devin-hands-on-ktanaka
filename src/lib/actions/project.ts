"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  createProjectSchema,
  generateProjectKey,
  updateProjectSchema,
} from "@/lib/validations/project";

import type { ProjectMemberRole } from "@prisma/client";

export type ProjectFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

type Membership = { role: ProjectMemberRole } | null;

const getMembership = async (projectId: string, userId: string): Promise<Membership> => {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { role: true },
  });
  return member;
};

const emptyToUndefined = (value: FormDataEntryValue | null): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

/**
 * プロジェクトを作成し、完了後に作成したプロジェクトのボードへリダイレクトする。
 */
export const createProject = async (
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "認証が必要です" };
  }
  const userId = session.user.id;

  const raw = {
    name: emptyToUndefined(formData.get("name")),
    description: emptyToUndefined(formData.get("description")),
    key: emptyToUndefined(formData.get("key")),
    color: emptyToUndefined(formData.get("color")),
  };

  const parsed = createProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const key = parsed.data.key ?? generateProjectKey(parsed.data.name);

  let createdId: string;
  try {
    const created = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          key,
          color: parsed.data.color ?? null,
          ownerId: userId,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId,
          role: "OWNER",
        },
      });

      return project;
    });
    createdId = created.id;
  } catch (error) {
    console.error("[createProject]", error);
    return { error: "プロジェクトの作成に失敗しました" };
  }

  revalidatePath("/projects");
  redirect(`/projects/${createdId}/board`);
};

/**
 * プロジェクト設定を更新する（OWNER / ADMIN のみ）。
 */
export const updateProject = async (
  projectId: string,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "認証が必要です" };
  }

  const membership = await getMembership(projectId, session.user.id);
  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    return { error: "プロジェクトを更新する権限がありません" };
  }

  const raw = {
    name: emptyToUndefined(formData.get("name")),
    description: formData.get("description") === null
      ? undefined
      : (emptyToUndefined(formData.get("description")) ?? null),
    key: emptyToUndefined(formData.get("key")),
    color: formData.get("color") === null
      ? undefined
      : (emptyToUndefined(formData.get("color")) ?? null),
  };

  const parsed = updateProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
        ...(parsed.data.key !== undefined && { key: parsed.data.key }),
        ...(parsed.data.color !== undefined && { color: parsed.data.color }),
      },
    });
  } catch (error) {
    console.error("[updateProject]", error);
    return { error: "プロジェクトの更新に失敗しました" };
  }

  revalidatePath(`/projects/${projectId}/settings`);
  revalidatePath("/projects");
  return { success: true };
};

/**
 * プロジェクトを削除する（OWNER のみ）。
 * 関連タスク・メンバー等は CASCADE で削除される。
 */
export const deleteProject = async (projectId: string): Promise<ProjectFormState> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "認証が必要です" };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) {
    return { error: "プロジェクトが見つかりません" };
  }
  if (project.ownerId !== session.user.id) {
    return { error: "プロジェクトを削除する権限がありません" };
  }

  try {
    await prisma.project.delete({ where: { id: projectId } });
  } catch (error) {
    console.error("[deleteProject]", error);
    return { error: "プロジェクトの削除に失敗しました" };
  }

  revalidatePath("/projects");
  redirect("/projects");
};
