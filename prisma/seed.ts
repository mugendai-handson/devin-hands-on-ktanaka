import {
  PrismaClient,
  TaskStatus,
  TaskPriority,
  ProjectMemberRole,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const main = async () => {
  console.log("🌱 Seeding database...");

  // ── Users ──────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { name: "admin" },
    create: {
      email: "admin@example.com",
      name: "admin",
      password: passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: { name: "member" },
    create: {
      email: "member@example.com",
      name: "member",
      password: passwordHash,
      role: UserRole.MEMBER,
    },
  });

  console.log(`  ✓ Users: ${admin.name}, ${member.name}`);

  // ── Project ────────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { id: "seed-project-1" },
    update: {},
    create: {
      id: "seed-project-1",
      name: "Devin Task Board",
      description: "タスク管理アプリの開発プロジェクト",
      key: "DTB",
      ownerId: admin.id,
    },
  });

  console.log(`  ✓ Project: ${project.name} (${project.key})`);

  // ── Project Members ────────────────────────────────
  const membersData = [
    { projectId: project.id, userId: admin.id, role: ProjectMemberRole.OWNER },
    {
      projectId: project.id,
      userId: member.id,
      role: ProjectMemberRole.MEMBER,
    },
  ];

  for (const m of membersData) {
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: m.projectId, userId: m.userId } },
      update: {},
      create: m,
    });
  }

  console.log(`  ✓ Project Members: ${membersData.length} members`);

  // ── Categories (F09 デフォルト) ────────────────────
  const categoriesData = [
    { name: "バグ", color: "oklch(0.55 0.22 27)", projectId: project.id },
    { name: "機能追加", color: "oklch(0.55 0.1 230)", projectId: project.id },
    { name: "改善", color: "oklch(0.65 0.17 160)", projectId: project.id },
    {
      name: "ドキュメント",
      color: "oklch(0.55 0.15 300)",
      projectId: project.id,
    },
  ];

  const categories = [];
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { id: `seed-cat-${c.name}` },
      update: {},
      create: { id: `seed-cat-${c.name}`, ...c },
    });
    categories.push(cat);
  }

  console.log(`  ✓ Categories: ${categories.map((c) => c.name).join(", ")}`);

  // ── Tasks ──────────────────────────────────────────
  const tasksData = [
    {
      taskNumber: 1,
      title: "プロジェクト初期設定",
      description:
        "## 概要\n\nDocker Compose + Next.js + PostgreSQL の環境構築",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      projectId: project.id,
      reporterId: admin.id,
      assigneeId: admin.id,
      sortOrder: 0,
    },
    {
      taskNumber: 2,
      title: "ログイン画面の実装",
      description:
        "## 概要\n\nAuth.js v5 の Credentials Provider を使ったログイン画面",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      projectId: project.id,
      reporterId: admin.id,
      assigneeId: member.id,
      sortOrder: 0,
    },
    {
      taskNumber: 3,
      title: "カンバンボード基本表示",
      description:
        "## 概要\n\n5カラム（BACKLOG / TODO / IN_PROGRESS / IN_REVIEW / DONE）のカンバン表示",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      projectId: project.id,
      reporterId: admin.id,
      assigneeId: member.id,
      sortOrder: 0,
    },
    {
      taskNumber: 4,
      title: "タスク詳細画面",
      description: "## 概要\n\nタスクの全フィールドを表示・編集できる詳細画面",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.MEDIUM,
      projectId: project.id,
      reporterId: member.id,
      assigneeId: null,
      sortOrder: 0,
    },
    {
      taskNumber: 5,
      title: "README の整備",
      description: "## 概要\n\nセットアップ手順・スクリプト一覧を追記",
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      projectId: project.id,
      reporterId: admin.id,
      assigneeId: member.id,
      sortOrder: 1,
    },
  ];

  for (const t of tasksData) {
    await prisma.task.upsert({
      where: {
        projectId_taskNumber: {
          projectId: t.projectId,
          taskNumber: t.taskNumber,
        },
      },
      update: {},
      create: t,
    });
  }

  console.log(`  ✓ Tasks: ${tasksData.length} tasks`);

  // ── TaskCategory (一部タスクにカテゴリを付与) ─────
  const taskCategoryPairs = [
    { taskNumber: 1, categoryName: "改善" },
    { taskNumber: 2, categoryName: "機能追加" },
    { taskNumber: 3, categoryName: "機能追加" },
    { taskNumber: 5, categoryName: "ドキュメント" },
  ];

  for (const pair of taskCategoryPairs) {
    const task = await prisma.task.findUnique({
      where: {
        projectId_taskNumber: {
          projectId: project.id,
          taskNumber: pair.taskNumber,
        },
      },
    });
    const category = categories.find((c) => c.name === pair.categoryName);
    if (task && category) {
      await prisma.taskCategory.upsert({
        where: {
          taskId_categoryId: { taskId: task.id, categoryId: category.id },
        },
        update: {},
        create: { taskId: task.id, categoryId: category.id },
      });
    }
  }

  console.log(`  ✓ Task Categories: ${taskCategoryPairs.length} associations`);

  console.log("✅ Seed completed!");
};

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
