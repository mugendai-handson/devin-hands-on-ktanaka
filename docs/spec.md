# devin-task-board 仕様書

## DB設計（Prisma スキーマ）

### ER図概要

```
users ─┬─< project_members >── projects
       │                         │
       ├─< tasks (reporter) ─────┤
       ├─< tasks (assignee) ─────┤
       │     │
       │     ├─< task_categories >── categories
       │     ├─< comments
       │     ├─< attachments
       │     └─< tasks (subtasks: parentTaskId)
       │
       ├─< activity_logs
       ├─< notifications
       └─< audit_logs
```

正式な ERD は Mermaid 形式で docs/erd.md に作成する（Issue #8）。

### users

| カラム    | 型                         | 説明                 |
| --------- | -------------------------- | -------------------- |
| id        | String (cuid)              | PK                   |
| email     | String                     | ユニーク             |
| name      | String                     | 表示名               |
| password  | String                     | ハッシュ化（bcrypt） |
| avatarUrl | String?                    | プロフィール画像URL  |
| role      | Enum (ADMIN, MEMBER)       | システム権限         |
| locale    | String (default: "ja")     | 言語設定             |
| theme     | Enum (LIGHT, DARK, SYSTEM) | テーマ設定           |
| createdAt | DateTime                   |                      |
| updatedAt | DateTime                   |                      |

### projects

| カラム      | 型            | 説明                        |
| ----------- | ------------- | --------------------------- |
| id          | String (cuid) | PK                          |
| name        | String        | プロジェクト名              |
| description | String?       | 説明                        |
| key         | String        | プロジェクトキー（例: DTB） |
| ownerId     | String        | FK → users                  |
| createdAt   | DateTime      |                             |
| updatedAt   | DateTime      |                             |

### project_members

| カラム    | 型                                  | 説明               |
| --------- | ----------------------------------- | ------------------ |
| id        | String (cuid)                       | PK                 |
| projectId | String                              | FK → projects      |
| userId    | String                              | FK → users         |
| role      | Enum (OWNER, ADMIN, MEMBER, VIEWER) | プロジェクト内権限 |
| createdAt | DateTime                            |                    |
| updatedAt | DateTime                            |                    |

### tasks

| カラム         | 型                                                 | 説明                       |
| -------------- | -------------------------------------------------- | -------------------------- |
| id             | String (cuid)                                      | PK                         |
| taskNumber     | Int                                                | プロジェクト内連番         |
| title          | String                                             | タイトル（必須）           |
| description    | String?                                            | Markdown対応               |
| status         | Enum (BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE) | ステータス                 |
| priority       | Enum (URGENT, HIGH, MEDIUM, LOW, NONE)             | 優先度                     |
| projectId      | String                                             | FK → projects              |
| assigneeId     | String?                                            | FK → users                 |
| reporterId     | String                                             | FK → users                 |
| parentTaskId   | String?                                            | FK → tasks（サブタスク）   |
| dueDate        | DateTime?                                          | 期限                       |
| startDate      | DateTime?                                          | 開始日（ガントチャート用） |
| estimatedHours | Float?                                             | 見積もり工数               |
| actualHours    | Float?                                             | 実績工数                   |
| sortOrder      | Int                                                | カンバン内並び順           |
| createdAt      | DateTime                                           |                            |
| updatedAt      | DateTime                                           |                            |

### categories

| カラム    | 型            | 説明           |
| --------- | ------------- | -------------- |
| id        | String (cuid) | PK             |
| name      | String        | カテゴリ名     |
| color     | String        | OKLCH カラー値 |
| projectId | String        | FK → projects  |

### task_categories（多対多）

| カラム     | 型     | 説明            |
| ---------- | ------ | --------------- |
| taskId     | String | FK → tasks      |
| categoryId | String | FK → categories |

### comments

| カラム    | 型            | 説明         |
| --------- | ------------- | ------------ |
| id        | String (cuid) | PK           |
| content   | String        | Markdown対応 |
| taskId    | String        | FK → tasks   |
| authorId  | String        | FK → users   |
| createdAt | DateTime      |              |
| updatedAt | DateTime      |              |

### attachments

| カラム     | 型            | 説明          |
| ---------- | ------------- | ------------- |
| id         | String (cuid) | PK            |
| fileName   | String        | ファイル名    |
| fileUrl    | String        | ストレージURL |
| fileSize   | Int           | バイト数      |
| mimeType   | String        | MIMEタイプ    |
| taskId     | String        | FK → tasks    |
| uploaderId | String        | FK → users    |
| createdAt  | DateTime      |               |

### activity_logs

| カラム     | 型                                                                              | 説明                      |
| ---------- | ------------------------------------------------------------------------------- | ------------------------- |
| id         | String (cuid)                                                                   | PK                        |
| action     | Enum (CREATED, UPDATED, DELETED, STATUS_CHANGED, ASSIGNED, COMMENTED, ATTACHED) |                           |
| entityType | String                                                                          | task, comment, project 等 |
| entityId   | String                                                                          | 対象ID                    |
| userId     | String                                                                          | FK → users                |
| projectId  | String                                                                          | FK → projects             |
| oldValue   | Json?                                                                           | 変更前                    |
| newValue   | Json?                                                                           | 変更後                    |
| createdAt  | DateTime                                                                        |                           |

### notifications

| カラム    | 型                                                                                  | 説明                 |
| --------- | ----------------------------------------------------------------------------------- | -------------------- |
| id        | String (cuid)                                                                       | PK                   |
| type      | Enum (TASK_ASSIGNED, TASK_COMMENTED, TASK_STATUS_CHANGED, TASK_DUE_SOON, MENTIONED) |                      |
| title     | String                                                                              |                      |
| message   | String                                                                              |                      |
| isRead    | Boolean                                                                             | 既読フラグ           |
| userId    | String                                                                              | FK → users（受信者） |
| linkUrl   | String?                                                                             | 遷移先URL            |
| createdAt | DateTime                                                                            |                      |

### audit_logs

| カラム     | 型            | 説明         |
| ---------- | ------------- | ------------ |
| id         | String (cuid) | PK           |
| action     | String        | 操作内容     |
| userId     | String        | FK → users   |
| ipAddress  | String?       |              |
| userAgent  | String?       |              |
| resource   | String        | 対象リソース |
| resourceId | String        | 対象ID       |
| details    | Json?         | 詳細情報     |
| createdAt  | DateTime      |              |

---

## 画面一覧

### 認証系

| #   | 画面名             | パス            | 対応US |
| --- | ------------------ | --------------- | ------ |
| 1   | ログイン           | /login          | US-02  |
| 2   | サインアップ       | /signup         | US-01  |
| 3   | パスワードリセット | /reset-password | US-03  |

### メイン画面

| #   | 画面名               | パス                          | 対応US                                   |
| --- | -------------------- | ----------------------------- | ---------------------------------------- |
| 4   | ダッシュボード       | /dashboard                    | US-18                                    |
| 5   | プロジェクト一覧     | /projects                     | US-04                                    |
| 6   | プロジェクト作成     | /projects/new                 | US-05                                    |
| 7   | カンバンボード       | /projects/[id]/board          | US-13, US-14, US-15                      |
| 8   | タスク一覧（リスト） | /projects/[id]/list           | US-16                                    |
| 9   | ガントチャート       | /projects/[id]/gantt          | US-17                                    |
| 10  | タスク詳細           | /projects/[id]/tasks/[taskId] | US-10, US-11, US-12, US-19, US-21, US-23 |
| 11  | プロジェクト設定     | /projects/[id]/settings       | US-06, US-07, US-08, US-20               |

### ユーザー系

| #   | 画面名           | パス              | 対応US              |
| --- | ---------------- | ----------------- | ------------------- |
| 12  | プロフィール設定 | /settings/profile | US-27, US-28, US-30 |
| 13  | 通知一覧         | /notifications    | US-25               |

### 管理者系

| #   | 画面名       | パス              | 対応US |
| --- | ------------ | ----------------- | ------ |
| 14  | メンバー管理 | /admin/members    | US-08  |
| 15  | 監査ログ     | /admin/audit-logs | US-29  |

---

## 機能仕様（F01〜F17）

### F01: 認証（Auth.js v5）

- Credentials Provider（メール + パスワード）
- サインアップ: メール形式バリデーション、パスワード8文字以上
- ログイン後 /dashboard へリダイレクト
- 未認証は /login へリダイレクト（Next.js 16 の proxy.ts で制御）
- JWT セッション管理
- パスワードリセット（Resend でリセットリンク送信、有効期限1時間）
- 対応 US: US-01, US-02, US-03

### F02: プロジェクト管理

- CRUD（一覧・作成・編集・削除）
- プロジェクトキー自動生成（例: "Devin Task Board" → "DTB"）
- プロジェクト一覧のカード表示（タスク数・メンバー数サマリー）
- OWNER のみ削除可能（CASCADE で関連データも削除）
- メンバー管理（OWNER / ADMIN / MEMBER / VIEWER）
- メンバー招待（メールアドレス）
- OWNER は自分自身を削除不可
- VIEWER はタスク閲覧のみで編集不可
- 対応 US: US-04, US-05, US-06, US-07, US-08

### F03: タスク管理（CRUD）

- タスク作成: タイトル（必須）、説明（Markdown）、ステータス、優先度、担当者、期限、カテゴリ、見積もり工数
- タスク番号自動採番（DTB-1, DTB-2...）、起票者自動記録
- インライン編集（変更時にアクティビティログ記録）
- 確認ダイアログ付き削除（CASCADE で関連データも削除）
- VIEWER は削除不可
- サブタスク（parentTaskId による親子関係、担当者・期限設定可能）
- 説明の Markdown プレビュー
- 対応 US: US-09, US-10, US-11, US-12

### F04: カンバンボード

- 5カラム（BACKLOG / TODO / IN_PROGRESS / IN_REVIEW / DONE）
- @dnd-kit によるカラム間・カラム内 D&D
- タスクカード: タイトル、番号、優先度バッジ、担当者アバター、期限、カテゴリタグ
- カラムごとタスク数表示
- クイック作成ボタン（タイトル入力のみ、カラムのステータスで即座に作成）
- D&D 時に楽観的更新 + アクティビティログ記録
- 対応 US: US-13, US-14, US-15

### F05: タスク一覧（リストビュー）

- テーブル形式（番号、タイトル、ステータス、優先度、担当者、期限、カテゴリ）
- カラムソート（昇順/降順）
- 行クリックでタスク詳細へ遷移
- ページネーション（20件/ページ）
- 対応 US: US-16

### F06: ガントチャート

- タスクを横棒表示（startDate〜dueDate）
- 日/週/月の表示切替
- 今日の日付バーティカルライン
- タスクの横棒ドラッグで期限変更
- カテゴリ別・担当者別のグルーピング
- 対応 US: US-17

### F07: ダッシュボード

- サマリーカード: 総タスク数、完了数、進行中数、期限超過数
- recharts: ステータス別棒グラフ、優先度別円グラフ、7日間完了推移グラフ
- 自分にアサインされたタスク一覧（上位5件）
- 期限が近いタスク一覧（上位5件）
- アクティビティフィード（上位10件）
- 対応 US: US-18

### F08: コメント機能

- Markdown対応コメント投稿・編集・削除（本人のみ）
- @メンション（通知トリガー）
- コメント投稿時にアクティビティログ記録
- 対応 US: US-19

### F09: カテゴリ/ラベル管理

- プロジェクトごとのCRUD（名前 + カラー）
- タスクへの複数カテゴリ付与、フィルタリング
- デフォルト: バグ（赤）、機能追加（青）、改善（緑）、ドキュメント（紫）
- 対応 US: US-20

### F10: ファイル添付

- タスク詳細からアップロード（画像jpg/png/gif/webp、PDF、テキスト、Office、上限10MB）
- 画像サムネイルプレビュー、ダウンロード・削除
- アップロード時にアクティビティログ記録
- ストレージ: ローカル（/uploads）
- 対応 US: US-21

### F11: 検索

- グローバル検索バー（ヘッダー固定）、デバウンス300ms
- 検索対象: タスクタイトル、説明、番号、コメント
- 検索結果ハイライト表示
- フィルター: ステータス、優先度、担当者、カテゴリ、期限範囲（AND条件）
- 対応 US: US-22

### F12: アクティビティログ

- タスクの全変更履歴（フィールド単位差分、変更前後の値）
- 記録対象: 作成、更新、ステータス変更、担当者変更、コメント投稿、ファイル添付
- タスク詳細の「アクティビティ」タブ
- プロジェクト全体のアクティビティフィード
- 対応 US: US-23, US-24

### F13: 通知機能

- アプリ内: ヘッダーベルアイコン + 未読バッジ
- トリガー: アサイン、コメント、ステータス変更、期限1日前、@メンション
- 通知一覧画面: 既読/未読切替、一括既読、クリックで該当タスクへ遷移
- メール通知: Resend（タスクリンク含む、ユーザーごとON/OFF設定）
- 対応 US: US-25, US-26

### F14: 多言語対応（i18n）

- next-intl（ja / en）
- 全UI要素翻訳（ボタン、ラベル、メッセージ、エラー文）
- 日付フォーマットのロケール対応（ja: YYYY年MM月DD日 / en: MMM DD, YYYY）
- 設定DB保存で永続化
- 対応 US: US-27

### F15: ダークモード

- next-themes（ライト / ダーク / システム）
- globals.css の .dark CSS変数で切替
- 全画面・全コンポーネント対応
- DB保存で永続化
- 対応 US: US-28

### F16: 監査ログ（管理者）

- ADMIN のみアクセス
- 記録: ログイン/ログアウト、プロジェクト作成/削除、メンバー追加/削除、権限変更
- フィルター: ユーザー、操作種別、日付範囲
- テーブル形式 + ページネーション + IP/UA記録
- 対応 US: US-29

### F17: 複数ユーザー・プロフィール

- 権限レベル: OWNER / ADMIN / MEMBER / VIEWER
- アバター表示、メンバー一覧
- プロフィール設定: 名前、アバターURL、言語、テーマ
- DB保存で永続化
- 対応 US: US-08, US-30

---

## API 設計（OpenAPI 3.1）

API 仕様は docs/openapi.yaml に定義し、実装はこれに準拠する。

### エンドポイント一覧

| メソッド | パス                                  | 概要                         | 対応US |
| -------- | ------------------------------------- | ---------------------------- | ------ |
| POST     | /api/auth/signup                      | サインアップ                 | US-01  |
| POST     | /api/auth/reset-password              | パスワードリセット           | US-03  |
| GET      | /api/projects                         | プロジェクト一覧             | US-04  |
| POST     | /api/projects                         | プロジェクト作成             | US-05  |
| GET      | /api/projects/[id]                    | プロジェクト詳細             | US-04  |
| PATCH    | /api/projects/[id]                    | プロジェクト更新             | US-06  |
| DELETE   | /api/projects/[id]                    | プロジェクト削除             | US-06  |
| GET      | /api/projects/[id]/members            | メンバー一覧                 | US-08  |
| POST     | /api/projects/[id]/members            | メンバー招待                 | US-07  |
| PATCH    | /api/projects/[id]/members/[memberId] | 権限変更                     | US-08  |
| DELETE   | /api/projects/[id]/members/[memberId] | メンバー削除                 | US-08  |
| GET      | /api/projects/[id]/tasks              | タスク一覧                   | US-16  |
| POST     | /api/projects/[id]/tasks              | タスク作成                   | US-09  |
| GET      | /api/tasks/[taskId]                   | タスク詳細                   | US-10  |
| PATCH    | /api/tasks/[taskId]                   | タスク更新                   | US-10  |
| DELETE   | /api/tasks/[taskId]                   | タスク削除                   | US-11  |
| PATCH    | /api/tasks/[taskId]/status            | ステータス変更（D&D用）      | US-14  |
| PATCH    | /api/tasks/[taskId]/sort              | 並び順変更（D&D用）          | US-14  |
| GET      | /api/tasks/[taskId]/subtasks          | サブタスク一覧               | US-12  |
| POST     | /api/tasks/[taskId]/subtasks          | サブタスク作成               | US-12  |
| GET      | /api/tasks/[taskId]/comments          | コメント一覧                 | US-19  |
| POST     | /api/tasks/[taskId]/comments          | コメント投稿                 | US-19  |
| PATCH    | /api/comments/[commentId]             | コメント編集                 | US-19  |
| DELETE   | /api/comments/[commentId]             | コメント削除                 | US-19  |
| GET      | /api/projects/[id]/categories         | カテゴリ一覧                 | US-20  |
| POST     | /api/projects/[id]/categories         | カテゴリ作成                 | US-20  |
| PATCH    | /api/categories/[categoryId]          | カテゴリ更新                 | US-20  |
| DELETE   | /api/categories/[categoryId]          | カテゴリ削除                 | US-20  |
| POST     | /api/tasks/[taskId]/attachments       | ファイルアップロード         | US-21  |
| DELETE   | /api/attachments/[attachmentId]       | ファイル削除                 | US-21  |
| GET      | /api/search                           | グローバル検索               | US-22  |
| GET      | /api/tasks/[taskId]/activities        | タスクのアクティビティ       | US-23  |
| GET      | /api/projects/[id]/activities         | プロジェクトのアクティビティ | US-24  |
| GET      | /api/notifications                    | 通知一覧                     | US-25  |
| PATCH    | /api/notifications/[id]/read          | 既読マーク                   | US-25  |
| PATCH    | /api/notifications/read-all           | 一括既読                     | US-25  |
| GET      | /api/dashboard                        | ダッシュボードデータ         | US-18  |
| GET      | /api/admin/audit-logs                 | 監査ログ一覧                 | US-29  |
| GET      | /api/users/me                         | 自分のプロフィール           | US-30  |
| PATCH    | /api/users/me                         | プロフィール更新             | US-30  |

### レスポンス形式

```json
// 成功
{ "data": T }

// 一覧（ページネーション付き）
{
  "data": T[],
  "pagination": { "page": 1, "perPage": 20, "total": 100, "totalPages": 5 }
}

// エラー
{ "error": { "code": "VALIDATION_ERROR", "message": "タイトルは必須です" } }
```

### ステータスコード

| コード | 用途                 |
| ------ | -------------------- |
| 200    | 成功（取得・更新）   |
| 201    | 成功（作成）         |
| 204    | 成功（削除）         |
| 400    | バリデーションエラー |
| 401    | 未認証               |
| 403    | 権限不足             |
| 404    | リソース未発見       |
| 500    | サーバーエラー       |

## 非機能要件

| 項目               | 内容                                                   |
| ------------------ | ------------------------------------------------------ |
| レスポンシブ       | タブレット（768px）以上で崩れないこと                  |
| ローディング       | shadcn/ui Skeleton でスケルトンUI                      |
| フィードバック     | sonner でトースト通知                                  |
| 楽観的更新         | カンバン D&D 等UXが重要な箇所で採用                    |
| エラーハンドリング | API: 統一エラーレスポンス / UI: error.tsx + トースト   |
| 型安全             | any 禁止、全 API に zod バリデーション                 |
| API仕様            | OpenAPI 3.1 に準拠、docs/openapi.yaml と実装の乖離なし |
