import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validations/project";

import type { NextRequest } from "next/server";

const unauthorized = () =>
  NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
    { status: 401 },
  );

const notFound = () =>
  NextResponse.json(
    { error: { code: "NOT_FOUND", message: "プロジェクトが見つかりません" } },
    { status: 404 },
  );

const forbidden = (message: string) =>
  NextResponse.json(
    { error: { code: "FORBIDDEN", message } },
    { status: 403 },
  );

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const { id } = await params;
    const userId = session.user.id;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: { select: { tasks: true, members: true } },
      },
    });

    if (!project) return notFound();

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    });

    if (project.ownerId !== userId && !membership) {
      return forbidden("このプロジェクトを閲覧する権限がありません");
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
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "サーバーエラーが発生しました" },
      },
      { status: 500 },
    );
  }
};

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const { id } = await params;
    const userId = session.user.id;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return notFound();

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    });

    const role = membership?.role;
    if (role !== "OWNER" && role !== "ADMIN") {
      return forbidden("プロジェクトを更新する権限がありません");
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
      data: parsed.data,
      include: { _count: { select: { tasks: true, members: true } } },
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
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "サーバーエラーが発生しました" },
      },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const { id } = await params;
    const userId = session.user.id;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return notFound();

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    });

    if (membership?.role !== "OWNER") {
      return forbidden("プロジェクトを削除できるのはオーナーのみです");
    }

    await prisma.project.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/projects/[id]]", error);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "サーバーエラーが発生しました" },
      },
      { status: 500 },
    );
  }
};
