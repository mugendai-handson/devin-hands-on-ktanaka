import { auth } from "@/lib/auth";

const DashboardPage = async () => {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="text-3xl font-bold">ダッシュボード</h1>
      <p className="text-muted-foreground">
        ようこそ、{session?.user?.name ?? "ゲスト"} さん
      </p>
    </div>
  );
};
export default DashboardPage;
