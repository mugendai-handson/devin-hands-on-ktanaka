import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateProjectSchema } from "@/lib/validations/project";

import type { NextRequest } from "next/server";
import type { ProjectMemberRole } from "@prisma/client";

const unauthorizedResponse = () =>
  NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
    { status: 401 },
  );

const forbiddenResponse = (message: string) =>
  NextResponse.json(
    { error: { code: "FORBIDDEN", message } },
    { status: 403 },
  );

const notFoundResponse = () =>
  NextResponse.json(
    {
      error: { code: "NOT_FOUND", message: "プロジェクトが見つかりません" },
    },
    { status: 404 },
  );

const internalErrorResponse = () =>
  NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "サーバーエラーが発生しました",
      },
    },
    { status: 500 },
  );

type Membership = { role: ProjectMemberRole } | null;

/**
 * 指定ユーザーがプロジェクトのメンバーであるかを返す。
 * メンバーでない場合は null を返す。
 */
const getMembership = async (
  projectId: string,
  userId: string,
): Promise<Membership> => {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { role: true },
  });
  return member;
};

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: { select: { tasks: true, members: true } },
      },
    });

    if (!project) {
      return notFoundResponse();
    }

    const membership = await getMembership(id, session.user.id);
    if (!membership) {
      return forbiddenResponse("このプロジェクトへのアクセス権限がありません");
    }

    const { _count, ...rest } = project;
    return NextResponse.json({
      data: {
        ...rest,
        taskCount: _count.tasks,
        memberCount: _count.members,
      },
    });
  } catch (error) {
    console.error("[GET /api/projects/[id]]", error);
    return internalErrorResponse();
  }
};

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return notFoundResponse();
    }

    const membership = await getMembership(id, session.user.id);
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return forbiddenResponse("プロジェクトを更新する権限がありません");
    }

    const body = await request.json().catch(() => null);
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 },
      );
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && {
          description: parsed.data.description,
        }),
      },
      include: {
        _count: { select: { tasks: true, members: true } },
      },
    });

    const { _count, ...rest } = updated;
    return NextResponse.json({
      data: {
        ...rest,
        taskCount: _count.tasks,
        memberCount: _count.members,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/projects/[id]]", error);
    return internalErrorResponse();
  }
};

export const DELETE = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return notFoundResponse();
    }

    if (project.ownerId !== session.user.id) {
      const membership = await getMembership(id, session.user.id);
      if (!membership) {
        return notFoundResponse();
      }
      return forbiddenResponse("プロジェクトを削除する権限がありません");
    }

    await prisma.project.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/projects/[id]]", error);
    return internalErrorResponse();
  }
};
