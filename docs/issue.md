# GitHub Issue 計画

このファイルを元に GitHub Issue を作成する。
仕様は docs/spec.md、ユーザーストーリーは docs/user-stories.md を参照。

---

## Phase 構成

| Phase | 内容 | Issue 数 |
|-------|------|---------|
| Phase 0 | 環境構築 | 6 |
| Phase 1 | 基盤・ドキュメント | 4 |
| Phase 2 | コア機能 | 12 |
| Phase 3 | 拡張機能 | 8 |
| Phase 4 | UX・運用機能 | 13 |
| **合計** | | **43** |

---

## Labels

### Phase ラベル

| Label | Color |
|-------|-------|
| `phase:0` | `#6B7280` |
| `phase:1` | `#3B82F6` |
| `phase:2` | `#10B981` |
| `phase:3` | `#F59E0B` |
| `phase:4` | `#EF4444` |

### Priority ラベル

| Label | Color |
|-------|-------|
| `priority:high` | `#DC2626` |
| `priority:medium` | `#F59E0B` |
| `priority:low` | `#6B7280` |

### Type ラベル

| Label | Color | 説明 |
|-------|-------|------|
| `type:frontend` | `#3B82F6` | UI・コンポーネント・画面 |
| `type:backend` | `#10B981` | API・DB・Server Actions |
| `type:fullstack` | `#8B5CF6` | フロントエンドとバックエンド両方 |
| `type:infra` | `#78716C` | 環境構築・設定 |
| `type:docs` | `#0EA5E9` | ドキュメント |

### Size ラベル

| Label | Color | 説明 |
|-------|-------|------|
| `size:XS` | `#D1D5DB` | 1〜2 ACU |
| `size:S` | `#93C5FD` | 3〜5 ACU |
| `size:M` | `#6EE7B7` | 5〜8 ACU |
| `size:L` | `#FCA5A5` | 8〜10 ACU（1セッション上限） |

---

## Phase 0: 環境構築（#1〜#6）

| # | タイトル | Labels |
|---|---------|--------|
| 1 | 環境構築（Docker Compose, Next.js 16, PostgreSQL, Prisma, Tailwind CSS v4） | `phase:0`, `priority:high`, `type:infra` |
| 2 | globals.css カラー定義（OKLCH + @theme inline） | `phase:0`, `priority:high`, `type:frontend` |
| 3 | Prisma スキーマ + seed データ | `phase:0`, `priority:high`, `type:backend` |
| 4 | Auth.js v5 + 認証画面（ログイン / サインアップ / proxy.ts） | `phase:0`, `priority:high`, `type:fullstack` |
| 5 | レイアウト（サイドバー + ヘッダー + ThemeProvider） | `phase:0`, `priority:high`, `type:frontend` |
| 6 | タスク一覧 + 作成 + カンバン基本表示 | `phase:0`, `priority:high`, `type:fullstack` |

## Phase 1: 基盤・ドキュメント（#7〜#10）

| # | タイトル | Labels | 対応US | Size |
|---|---------|--------|--------|------|
| 7 | ERD図の作成（Mermaid） | `phase:1`, `priority:high`, `type:docs` | - | `size:XS` |
| 8 | OpenAPI 仕様の作成 | `phase:1`, `priority:high`, `type:docs` | - | `size:S` |
| 9 | プロジェクト CRUD API | `phase:1`, `priority:high`, `type:backend` | US-04, US-05, US-06 | `size:M` |
| 10 | プロジェクト UI（一覧・作成・設定） | `phase:1`, `priority:high`, `type:frontend` | US-04, US-05, US-06 | `size:M` |

## Phase 2: コア機能（#11〜#22）

| # | タイトル | Labels | 対応US | Size |
|---|---------|--------|--------|------|
| 11 | プロジェクトメンバー招待 | `phase:2`, `priority:high`, `type:fullstack` | US-07 | `size:M` |
| 12 | プロジェクトメンバー権限管理 | `phase:2`, `priority:high`, `type:fullstack` | US-08 | `size:S` |
| 13 | タスク詳細画面 | `phase:2`, `priority:high`, `type:fullstack` | US-10 | `size:M` |
| 14 | タスクのインライン編集 | `phase:2`, `priority:high`, `type:frontend` | US-10 | `size:S` |
| 15 | タスク削除 | `phase:2`, `priority:medium`, `type:fullstack` | US-11 | `size:XS` |
| 16 | サブタスク機能 | `phase:2`, `priority:medium`, `type:fullstack` | US-12 | `size:M` |
| 17 | カンバン D&D（カラム間ステータス変更） | `phase:2`, `priority:high`, `type:frontend` | US-14 | `size:M` |
| 18 | カンバン D&D（カラム内並び替え） | `phase:2`, `priority:medium`, `type:frontend` | US-14 | `size:S` |
| 19 | カンバン クイック作成 | `phase:2`, `priority:medium`, `type:fullstack` | US-15 | `size:XS` |
| 20 | タスク一覧（リストビュー）完成 | `phase:2`, `priority:high`, `type:frontend` | US-16 | `size:M` |
| 21 | カテゴリ/ラベル管理 | `phase:2`, `priority:medium`, `type:fullstack` | US-20 | `size:S` |
| 22 | タスクへのカテゴリ付与 + フィルタリング | `phase:2`, `priority:medium`, `type:fullstack` | US-20 | `size:M` |

## Phase 3: 拡張機能（#23〜#30）

| # | タイトル | Labels | 対応US | Size |
|---|---------|--------|--------|------|
| 23 | コメント機能（CRUD） | `phase:3`, `priority:high`, `type:fullstack` | US-19 | `size:M` |
| 24 | コメント @メンション | `phase:3`, `priority:medium`, `type:fullstack` | US-19 | `size:M` |
| 25 | ファイル添付機能 | `phase:3`, `priority:medium`, `type:fullstack` | US-21 | `size:L` |
| 26 | グローバル検索 | `phase:3`, `priority:high`, `type:fullstack` | US-22 | `size:M` |
| 27 | 検索フィルター | `phase:3`, `priority:medium`, `type:frontend` | US-22 | `size:S` |
| 28 | アクティビティログ（タスク） | `phase:3`, `priority:medium`, `type:fullstack` | US-23 | `size:M` |
| 29 | アクティビティフィード（プロジェクト） | `phase:3`, `priority:medium`, `type:fullstack` | US-24 | `size:S` |
| 30 | ダッシュボード（サマリーカード + タスク一覧） | `phase:3`, `priority:high`, `type:fullstack` | US-18 | `size:M` |

## Phase 4: UX・運用機能（#31〜#43）

| # | タイトル | Labels | 対応US | Size |
|---|---------|--------|--------|------|
| 31 | ダッシュボード（グラフ + アクティビティフィード） | `phase:4`, `priority:high`, `type:frontend` | US-18 | `size:M` |
| 32 | ガントチャート（基本表示） | `phase:4`, `priority:medium`, `type:frontend` | US-17 | `size:L` |
| 33 | ガントチャート（インタラクション + グルーピング） | `phase:4`, `priority:medium`, `type:frontend` | US-17 | `size:M` |
| 34 | 通知生成 API + トリガー | `phase:4`, `priority:high`, `type:backend` | US-25 | `size:M` |
| 35 | 通知 UI（ベルアイコン + 通知一覧画面） | `phase:4`, `priority:high`, `type:frontend` | US-25 | `size:M` |
| 36 | 通知の既読管理（既読/未読切替 + 一括既読） | `phase:4`, `priority:medium`, `type:fullstack` | US-25 | `size:S` |
| 37 | メール通知（Resend） | `phase:4`, `priority:medium`, `type:backend` | US-26 | `size:M` |
| 38 | 多言語対応セットアップ + 認証・レイアウト翻訳 | `phase:4`, `priority:medium`, `type:fullstack` | US-27 | `size:M` |
| 39 | 多言語対応（残りの全画面翻訳） | `phase:4`, `priority:medium`, `type:frontend` | US-27 | `size:M` |
| 40 | ダークモード | `phase:4`, `priority:medium`, `type:frontend` | US-28 | `size:S` |
| 41 | 監査ログ（管理者画面） | `phase:4`, `priority:low`, `type:fullstack` | US-29 | `size:M` |
| 42 | プロフィール設定画面 | `phase:4`, `priority:medium`, `type:fullstack` | US-30 | `size:S` |
| 43 | OpenAPI 仕様の最終同期 | `phase:4`, `priority:medium`, `type:docs` | - | `size:S` |

---

## Issue 本文テンプレート

```markdown
## 概要

[1〜2文で何をするか]

## 対応ユーザーストーリー

[US-XX（docs/user-stories.md 参照）。該当なしの場合は省略]

## Acceptance Criteria

- [ ] [具体的な完了条件1]
- [ ] [具体的な完了条件2]
- [ ] ...

## 技術的な参考情報

- [関連ファイルパス、ドキュメントリンク、API エンドポイント等]
- 仕様書: docs/spec.md
- コーディング規約: .windsurf/rules/coding-rule.md
```

---

## Issue テンプレート例

### 例: Issue #7 ERD図の作成（Mermaid）

**概要**
DB設計を可視化するERD図を Mermaid 形式で作成し、docs/erd.md に配置する。

**Acceptance Criteria**

- [ ] Mermaid の erDiagram 構文で全11テーブルのERD図を作成
- [ ] テーブル間のリレーション（1:N、N:N）を正確に表現
- [ ] 各テーブルの主要カラム（PK、FK、重要フィールド）を記載
- [ ] docs/erd.md に配置し、README.md からリンク
- [ ] GitHub上でMermaidがレンダリングされることを確認

**技術的な参考情報**

- Prisma スキーマ: prisma/schema.prisma
- DB設計: docs/spec.md の「DB設計」セクション
- Mermaid erDiagram: https://mermaid.js.org/syntax/entityRelationshipDiagram.html

### 例: Issue #17 カンバン D&D（カラム間ステータス変更）

**概要**
カンバンボード画面に @dnd-kit を導入し、カラム間 D&D でステータスを変更する。

**対応ユーザーストーリー**: US-14（docs/user-stories.md 参照）

**Acceptance Criteria**

- [ ] @dnd-kit/core を導入・セットアップ
- [ ] カラム間 D&D でステータス更新（PATCH /api/tasks/[taskId]/status）
- [ ] ドラッグ中にドロップ先カラムがハイライト
- [ ] 楽観的更新（Optimistic Update）で即座にUI反映
- [ ] ステータス変更時にアクティビティログ記録
- [ ] OpenAPI 仕様（docs/openapi.yaml）に準拠

**技術的な参考情報**

- 既存タスクカード: src/components/tasks/TaskCard.tsx
- API パターン: src/app/api/tasks/ の既存実装を参照
- 仕様書: docs/spec.md の「F04: カンバンボード」セクション
- カラム内並び替え: #18 で対応

---

## トレーサビリティマトリクス

| 機能 | ユーザーストーリー | Issue |
|------|------------------|-------|
| F01 認証 | US-01〜03 | #4 |
| F02 プロジェクト | US-04〜08 | #9, #10, #11, #12 |
| F03 タスクCRUD | US-09〜12 | #6, #13, #14, #15, #16 |
| F04 カンバン | US-13〜15 | #6, #17, #18, #19 |
| F05 リスト | US-16 | #20 |
| F06 ガント | US-17 | #32, #33 |
| F07 ダッシュボード | US-18 | #30, #31 |
| F08 コメント | US-19 | #23, #24 |
| F09 カテゴリ | US-20 | #21, #22 |
| F10 添付 | US-21 | #25 |
| F11 検索 | US-22 | #26, #27 |
| F12 アクティビティ | US-23〜24 | #28, #29 |
| F13 通知 | US-25〜26 | #34, #35, #36, #37 |
| F14 i18n | US-27 | #38, #39 |
| F15 ダークモード | US-28 | #40 |
| F16 監査ログ | US-29 | #41 |
| F17 ユーザー | US-08, US-30 | #12, #42 |
| - OpenAPI 同期 | - | #43 |
