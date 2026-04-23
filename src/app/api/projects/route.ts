import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  createProjectSchema,
  generateProjectKey,
  listProjectsQuerySchema,
} from "@/lib/validations/project";

import type { NextRequest } from "next/server";

const unauthorizedResponse = () =>
  NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
    { status: 401 },
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

export const GET = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const url = new URL(request.url);
    const parsedQuery = listProjectsQuerySchema.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      perPage: url.searchParams.get("perPage") ?? undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsedQuery.error.issues[0].message,
          },
        },
        { status: 400 },
      );
    }

    const { page, perPage } = parsedQuery.data;
    const userId = session.user.id;

    const where = {
      members: { some: { userId } },
    };

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          _count: { select: { tasks: true, members: true } },
        },
      }),
    ]);

    const data = projects.map((project) => {
      const { _count, ...rest } = project;
      return {
        ...rest,
        taskCount: _count.tasks,
        memberCount: _count.members,
      };
    });

    return NextResponse.json({
      data,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return internalErrorResponse();
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json().catch(() => null);
    const parsed = createProjectSchema.safeParse(body);
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

    const userId = session.user.id;
    const key = parsed.data.key ?? generateProjectKey(parsed.data.name);

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          key,
          ownerId: userId,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: created.id,
          userId,
          role: "OWNER",
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        data: {
          ...project,
          taskCount: 0,
          memberCount: 1,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return internalErrorResponse();
  }
};
