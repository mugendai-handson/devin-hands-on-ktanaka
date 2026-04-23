# Devin Task Board

タスク管理アプリ

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + React 19 + TypeScript
- **DB**: PostgreSQL 16 + Prisma
- **スタイル**: Tailwind CSS v4
- **インフラ**: Docker Compose

## セットアップ

### 前提条件

- Node.js 22+
- Docker / Docker Compose

### 1. リポジトリのクローン

```bash
git clone https://github.com/micci184/devin-handson.git
cd devin-handson
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

### 3. Docker Compose で起動

```bash
docker compose up -d
```

## ドキュメント

- [機能仕様書](docs/spec.md)
- [ユーザーストーリー](docs/user-stories.md)
- [Issue 計画](docs/issue.md)
- [OpenAPI 3.1 仕様](docs/openapi.yaml) — API はこの仕様に準拠して実装する

### OpenAPI 仕様のプレビュー

`docs/openapi.yaml` を Swagger UI / Redoc などで閲覧する例:

```bash
# Redocly CLI でブラウザプレビュー
npx @redocly/cli@latest preview-docs docs/openapi.yaml

# Redocly CLI で lint
npx @redocly/cli@latest lint docs/openapi.yaml
```
