import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar userRole={userRole} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userName={session?.user?.name} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};
export default MainLayout;
