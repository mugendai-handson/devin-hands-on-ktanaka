import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createProjectSchema,
  listProjectsQuerySchema,
} from "@/lib/validations/project";

import type { NextRequest } from "next/server";

const KEY_PATTERN = /^[A-Z0-9]{2,10}$/;

const generateProjectKey = (name: string): string => {
  const words = name
    .normalize("NFKC")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);

  const initials = words
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (initials.length >= 2) return initials.slice(0, 10);

  const sanitized = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);

  return sanitized.length >= 2 ? sanitized : `${sanitized}PJ`.slice(0, 10);
};

const ensureUniqueKey = async (baseKey: string): Promise<string> => {
  if (!KEY_PATTERN.test(baseKey)) {
    throw new Error("INVALID_KEY");
  }

  const existing = await prisma.project.findFirst({ where: { key: baseKey } });
  if (!existing) return baseKey;

  for (let i = 2; i <= 99; i += 1) {
    const suffix = String(i);
    const maxBase = 10 - suffix.length;
    const candidate = `${baseKey.slice(0, maxBase)}${suffix}`;
    if (!KEY_PATTERN.test(candidate)) continue;
    const conflict = await prisma.project.findFirst({ where: { key: candidate } });
    if (!conflict) return candidate;
  }

  throw new Error("KEY_CONFLICT");
};

export const GET = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 },
      );
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

    const where: Prisma.ProjectWhereInput = {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    };

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          _count: { select: { tasks: true, members: true } },
        },
      }),
    ]);

    const data = projects.map(({ _count, ...rest }) => ({
      ...rest,
      taskCount: _count.tasks,
      memberCount: _count.members,
    }));

    return NextResponse.json({
      data,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
      },
    });
  } catch (error) {
    console.error("[GET /api/projects]", error);
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

export const POST = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 },
      );
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

    const { name, description, key: inputKey } = parsed.data;
    const baseKey = inputKey ?? generateProjectKey(name);

    let key: string;
    try {
      key = await ensureUniqueKey(baseKey);
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "プロジェクトキーの自動生成に失敗しました。key を指定してください",
          },
        },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          name,
          description,
          key,
          ownerId: userId,
          members: {
            create: {
              userId,
              role: "OWNER",
            },
          },
        },
        include: {
          _count: { select: { tasks: true, members: true } },
        },
      });
      return created;
    });

    const { _count, ...rest } = project;
    return NextResponse.json(
      {
        data: {
          ...rest,
          taskCount: _count.tasks,
          memberCount: _count.members,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: {
            code: "CONFLICT",
            message: "同じキーのプロジェクトが既に存在します",
          },
        },
        { status: 409 },
      );
    }
    console.error("[POST /api/projects]", error);
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
