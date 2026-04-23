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
