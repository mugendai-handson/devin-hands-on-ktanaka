---
trigger: always_on
---

# devin-task-board Rules

## プロジェクト概要

リッチなタスク管理アプリ（Jira ミニ版）。Docker Compose + Next.js 16 + PostgreSQL + Prisma。

## 技術スタック（厳守）

- Next.js 16.2（App Router）、React 19、TypeScript 必須
- PostgreSQL 16 + Prisma ORM
- Tailwind CSS v4（OKLCH色空間）
- Auth.js v5（next-auth@5、Credentials Provider）
- next-intl（ja / en）
- zod（フォーム + API バリデーション）
- recharts（グラフ）、@dnd-kit/core（D&D）、date-fns（日付）
- react-markdown + remark-gfm（Markdown）
- resend（メール通知）
- Docker Compose
- 状態管理ライブラリ（Redux, Zustand 等）は使わない

## Agent Skills

`npx skills add vercel-labs/next-skills` でインストール済み。
Next.js のベストプラクティス（RSC境界、async API、ファイル規約等）は
`.agents/skills/` 内の SKILL.md および `node_modules/next/dist/docs/` を参照すること。

## ディレクトリ構成

```
src/app/(auth)/          # ログイン、サインアップ
src/app/(main)/          # 認証必須（dashboard, projects, notifications, settings, admin）
src/app/api/             # OpenAPI 3.1 準拠の Route Handlers
src/app/globals.css      # カラー定義（OKLCH + @theme inline）
src/app/proxy.ts         # 認証ガード（Next.js 16: 旧 middleware.ts）
src/components/ui/       # 共通UIコンポーネント
src/components/layout/   # Header, Sidebar
src/components/tasks/    # TaskCard, TaskForm, TaskDetail
src/components/board/    # KanbanBoard, KanbanColumn
src/components/gantt/    # GanttChart
src/components/dashboard/ # StatCard, Charts
src/components/comments/ # CommentList, CommentForm
src/components/notifications/ # NotificationBell, NotificationList
src/lib/prisma.ts        # Prisma シングルトン
src/lib/auth.ts          # Auth.js v5 設定
src/lib/validations/     # zod スキーマ
src/lib/actions/         # Server Actions（"use server"）
src/types/               # TypeScript 型定義
src/messages/            # i18n（ja.json, en.json）
docs/openapi.yaml        # OpenAPI 3.1 仕様（実装はこれに準拠）
docs/spec.md             # 機能仕様書（画面一覧、DB設計、機能仕様）
docs/issues.md           # Issue 計画（Phase 0〜4、35 Issue）
prisma/schema.prisma     # DB スキーマ定義
```

## カラー定義（globals.css で CSS変数として定義）

tailwind.config は編集しない。色は globals.css の `:root` と `.dark` に OKLCH で定義し、
`@theme inline` でTailwindユーティリティに公開する。

```css
:root {
  --primary: oklch(0.35 0.08 230);
  --primary-foreground: oklch(0.98 0 0);
  --success: oklch(0.65 0.17 160);
  --warning: oklch(0.75 0.15 85);
  --danger: oklch(0.55 0.22 27);
}
.dark {
  --primary: oklch(0.55 0.1 230);
  --primary-foreground: oklch(0.1 0 0);
}
@theme inline {
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
}
```

## API設計

- OpenAPI 3.1 仕様を `docs/openapi.yaml` に定義し、それに準拠して実装する
- エンドポイント: `/api/[resource]`、REST
- レスポンス形式: 成功 `{ data: T }` / エラー `{ error: { code: string, message: string } }`
- 全 API Route で zod バリデーション必須
- ステータスコード: 400（バリデーション）、401（認証）、403（権限）、404（Not Found）

---

## 関数定義

### React コンポーネント

```tsx
// ◯ アロー関数 + named export
export const TaskCard = ({ task }: TaskCardProps) => {
  return <div>{task.title}</div>;
};

// ✕ function 宣言
export default function TaskCard({ task }: TaskCardProps) {
  return <div>{task.title}</div>;
}
```

### ユーティリティ関数

```ts
// ◯
export const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

// ✕
export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
```

### Server Actions

```ts
// ◯ Server Actions もアロー関数
"use server";

export const createTask = async (formData: FormData) => {
  // ...
};
```

### 例外: page.tsx / layout.tsx / error.tsx / loading.tsx

Next.js の特殊ファイルは `export default` が必要なため、アロー関数 + default export で書く。

```tsx
// ◯ page.tsx
const DashboardPage = async () => {
  const tasks = await prisma.task.findMany();
  return <TaskList tasks={tasks} />;
};
export default DashboardPage;

// ◯ layout.tsx
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};
export default MainLayout;
```

---

## import 規約

### import 順序（グループ間は空行で区切る）

```tsx
// 1. React / Next.js
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

// 2. 外部ライブラリ
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";

// 3. 内部モジュール（エイリアス @/）
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TaskCard } from "@/components/tasks/TaskCard";

// 4. 型 import（必ず import type を使う）
import type { Task, Project } from "@/types";
import type { Metadata } from "next";
```

### import type の使い分け

```tsx
// ◯ 型のみの import は必ず import type
import type { Task } from "@/types";
import type { Prisma } from "@prisma/client";

// ◯ 値と型を混在させない — 分ける
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

// ✕ 型を通常の import で取り込まない
import { Task } from "@/types"; // 値として使わないなら import type にする
```

---

## React 19 + Next.js 16 パターン

### Server Components（デフォルト）

```tsx
// ◯ Server Component: async + Prisma 直接呼び出し
export const TaskList = async ({ projectId }: { projectId: string }) => {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ul>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </ul>
  );
};

// ✕ Server Component 内で fetch で内部 API を叩かない
const tasks = await fetch("/api/tasks").then((r) => r.json());
```

### Server Actions（データ変更は Server Actions を使う）

```tsx
// src/lib/actions/task.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const createTaskSchema = z.object({
  title: z.string().min(1),
  projectId: z.string().cuid(),
});

export const createTask = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = createTaskSchema.parse({
    title: formData.get("title"),
    projectId: formData.get("projectId"),
  });

  await prisma.task.create({
    data: {
      ...parsed,
      reporterId: session.user.id,
      status: "BACKLOG",
      taskNumber: await getNextTaskNumber(parsed.projectId),
    },
  });

  revalidatePath(`/projects/${parsed.projectId}/board`);
};
```

### Client Component でのフォーム（useActionState）

```tsx
"use client";

import { useActionState } from "react";
import { createTask } from "@/lib/actions/task";

export const TaskForm = ({ projectId }: { projectId: string }) => {
  const [state, formAction, isPending] = useActionState(createTask, null);

  return (
    <form action={formAction}>
      <input name="title" required />
      <input type="hidden" name="projectId" value={projectId} />
      <button type="submit" disabled={isPending}>
        {isPending ? "作成中..." : "タスクを作成"}
      </button>
    </form>
  );
};
```

### 楽観的更新（useOptimistic）

```tsx
"use client";

import { useOptimistic } from "react";
import { updateTaskStatus } from "@/lib/actions/task";

export const KanbanCard = ({ task }: { task: Task }) => {
  const [optimisticTask, setOptimisticTask] = useOptimistic(task);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setOptimisticTask({ ...task, status: newStatus });
    await updateTaskStatus(task.id, newStatus);
  };

  return <div data-status={optimisticTask.status}>{optimisticTask.title}</div>;
};
```

### データ取得の使い分け

| パターン                       | いつ使うか                                                    |
| ------------------------------ | ------------------------------------------------------------- |
| Server Component + Prisma 直接 | ページ表示時のデータ取得（メイン）                            |
| Server Actions                 | データ変更（作成・更新・削除）                                |
| Route Handlers（API Routes）   | 外部連携・Webhook・クライアントからのインクリメンタルサーチ等 |
| `use()` hook                   | Server Component からの Promise を Client Component で unwrap |

---

## エラーハンドリングの具体パターン

### API Route のエラーハンドリング

```tsx
// src/app/api/projects/[id]/tasks/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

import type { NextRequest } from "next/server";

const createTaskSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW", "NONE"]).default("NONE"),
});

export const POST = async (
  request: NextRequest,
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
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.errors[0].message,
          },
        },
        { status: 400 },
      );
    }

    const task = await prisma.task.create({
      data: { ...parsed.data, projectId, reporterId: session.user.id },
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
```

### Client Component のエラーハンドリング（sonner トースト）

```tsx
"use client";

import { toast } from "sonner";

export const DeleteTaskButton = ({ taskId }: { taskId: string }) => {
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error.message);
        return;
      }
      toast.success("タスクを削除しました");
    } catch {
      toast.error("ネットワークエラーが発生しました");
    }
  };

  return <button onClick={handleDelete}>削除</button>;
};
```

### error.tsx（ルートレベルエラーバウンダリ）

```tsx
"use client";

export const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-semibold">エラーが発生しました</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="btn-primary">
        再試行
      </button>
    </div>
  );
};
export default ErrorPage;
```

### loading.tsx（Skeleton）

```tsx
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
};
export default Loading;
```

---

## Best Practices

### React Compiler（自動メモ化）

- React Compiler 1.0 が安定版としてNext.js 16 に統合済み
- `useMemo`、`useCallback`、`React.memo` を手動で書かない — Compiler が自動処理する
- ただし副作用のある関数を Compiler が誤ってメモ化するリスクがあるため、純粋でない関数には注意する

### async Request API（Next.js 16 必須）

```tsx
// ◯ params, searchParams, cookies(), headers() は必ず await
const TaskPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  // ...
};
export default TaskPage;

// ✕ await なしでアクセスしない
const TaskPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params; // Next.js 16 ではエラー
};
```

### View Transitions（Next.js 16.2 / React 19.2）

```tsx
// Link に transitionTypes を指定してアニメーション
import Link from "next/link";

<Link href={`/projects/${project.id}`} transitionTypes={["slide"]}>
  {project.name}
</Link>;
```

### useEffectEvent（React 19.2）

```tsx
// ◯ Effect 内の非リアクティブロジックを分離
import { useEffect, useEffectEvent } from "react";

const useTaskNotification = (task: Task) => {
  const onStatusChange = useEffectEvent((newStatus: string) => {
    // このロジックは Effect の依存配列に影響しない
    toast.info(`タスク ${task.title} が ${newStatus} に変更されました`);
  });

  useEffect(() => {
    const unsubscribe = subscribeToTaskUpdates(task.id, onStatusChange);
    return () => unsubscribe();
  }, [task.id]); // onStatusChange を依存配列に入れなくて良い
};
```

### Suspense 境界の戦略的配置

```tsx
// ◯ データ取得が独立した部分ごとに Suspense で囲む
const DashboardPage = async () => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Suspense fallback={<StatCardSkeleton />}>
        <TaskSummary />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <ActivityChart />
      </Suspense>
    </div>
  );
};
export default DashboardPage;

// ✕ ページ全体を1つの Suspense で囲まない（最も遅いデータ取得がボトルネックになる）
```

### parallel データ取得

```tsx
// ◯ Promise.all で並列取得
const ProjectPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const [project, tasks, members] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.task.findMany({ where: { projectId: id } }),
    prisma.projectMember.findMany({ where: { projectId: id } }),
  ]);
  // ...
};

// ✕ 順番に await しない（ウォーターフォール）
const project = await prisma.project.findUnique({ where: { id } });
const tasks = await prisma.task.findMany({ where: { projectId: id } });
const members = await prisma.projectMember.findMany({
  where: { projectId: id },
});
```

---

## コーディング規約

- `any` 型禁止。型は `src/types/` に集約
- コンポーネント: PascalCase、フック: camelCase、ディレクトリ: kebab-case
- Server Components がデフォルト。`"use client"` は末端のみ
- props は interface で定義（type ではなく）
- Server Components 内では Prisma を直接呼ぶ（fetch で内部API を叩かない）
- データ変更は Server Actions（`"use server"`）を使う。Client Component から直接 Prisma を呼ばない
- エラー: API は try-catch + 統一レスポンス、UI は sonner トースト + Skeleton
- Tailwind ユーティリティのみ使用。インラインスタイル・CSS Modules 禁止
- ダークモード: Tailwind `dark:` バリアント + next-themes（ThemeProvider）
- `useMemo` / `useCallback` / `React.memo` は手動で書かない（React Compiler が自動処理）
- セミコロンなし、シングルクォート

## Issue駆動の実装範囲

- 実装対象は、対象Issueの「概要」「Acceptance Criteria」「技術的な参考情報」に含まれる範囲のみとする
- `docs/spec.md` と `docs/user-stories.md` は参照資料であり、対象Issueに記載のない後続機能や将来構成を先回りして実装しない
- スコープ判断に迷う場合は、Issueの記載を優先し、不明点は確認する
- PRには対象Issueに直接関係しない変更（リファクタ、将来用ディレクトリ、未使用設定、別Issue相当の追加）を含めない

## PR差分原則

- PRの差分は、対象Issueの実装に直接関係する変更のみとする
- PRの差分には、対象Issueに直接関係しない変更（リファクタ、将来用ディレクトリ、未使用設定、別Issue相当の追加）を含めない

## Next.js 16 の注意点

- `middleware.ts` は非推奨 → `proxy.ts` にリネーム（Edge Runtime 非対応）
- async Request API: `params`, `searchParams`, `cookies()`, `headers()` は必ず await
- Turbopack がデフォルト。`--turbopack` フラグ不要
- Cache Components: `'use cache'` ディレクティブ + `cacheLife()` + `cacheTag()`
- React Compiler 1.0 安定版。`reactCompiler: true` で有効化
- View Transitions: `<Link transitionTypes={['slide']}>`
- `useEffectEvent()`: Effect 内の非リアクティブロジック分離

## DB設計

- Prisma model: PascalCase 単数形。全テーブルに id(cuid), createdAt, updatedAt
- 外部キー: 適切に ON DELETE CASCADE
- インデックス: status, priority, assigneeId, projectId
- ソフトデリート不採用（物理削除）
- 開発環境のDB適用は `prisma migrate dev` を使用し、既存 migration の反映は `prisma migrate deploy` を使用する

## コミット規約

Conventional Commits: `type(scope): description`
type: feat, fix, docs, style, refactor, test, chore

## 禁止事項

- `any` 型、`console.log` のコミット、インラインスタイル、CSS Modules
- Redux / Zustand / Jotai 等の状態管理ライブラリ
- `pages/` ディレクトリ、`getServerSideProps` / `getStaticProps`
- `tailwind.config` でのカラー定義（globals.css の CSS変数を使う）
- HSL でのカラー定義（OKLCH を使う）
- `useMemo` / `useCallback` / `React.memo` の手動使用（React Compiler に任せる）
- `function` 宣言でのコンポーネント・関数定義（アロー関数を使う）
- `import` で型のみを取り込む（`import type` を使う）
- Server Component 内で `fetch('/api/...')` で内部 API を叩く（Prisma を直接使う）
- Client Component から Prisma を直接使う（Server Actions を経由する）
- 順番に `await` を並べるウォーターフォール（`Promise.all` で並列化する）
