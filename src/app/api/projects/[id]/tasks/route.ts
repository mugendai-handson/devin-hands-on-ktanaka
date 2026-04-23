import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createTaskSchema } from "@/lib/validations/task";

import type { NextRequest } from "next/server";

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 },
      );
    }

    const { id: projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json(
        {
          error: { code: "NOT_FOUND", message: "プロジェクトが見つかりません" },
        },
        { status: 404 },
      );
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
        categories: { include: { category: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ data: tasks });
  } catch (error) {
    console.error("[GET /api/projects/[id]/tasks]", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "サーバーエラーが発生しました",
        },
      },
      { status: 500 },
    );
  }
};

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 },
      );
    }

    const { id: projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json(
        {
          error: { code: "NOT_FOUND", message: "プロジェクトが見つかりません" },
        },
        { status: 404 },
      );
    }

    // 権限チェック
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: session.user.id } },
    });
    if (!member || member.role === "VIEWER") {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "タスクを作成する権限がありません",
          },
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

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

    // 連番採番
    const lastTask = await prisma.task.findFirst({
      where: { projectId },
      orderBy: { taskNumber: "desc" },
      select: { taskNumber: true },
    });
    const nextNumber = (lastTask?.taskNumber ?? 0) + 1;

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status,
        priority: parsed.data.priority,
        assigneeId: parsed.data.assigneeId,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        projectId,
        reporterId: session.user.id,
        taskNumber: nextNumber,
      },
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects/[id]/tasks]", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "サーバーエラーが発生しました",
        },
      },
      { status: 500 },
    );
  }
};
