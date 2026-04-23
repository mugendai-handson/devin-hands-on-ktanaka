const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
};
export default AuthLayout;
