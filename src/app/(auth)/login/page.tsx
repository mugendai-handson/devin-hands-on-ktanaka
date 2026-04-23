"use client";

import { useActionState } from "react";
import Link from "next/link";

import { login } from "@/lib/actions/auth";

import type { AuthState } from "@/lib/actions/auth";

const LoginPage = () => {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    login,
    null,
  );

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">ログイン</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          メールアドレスとパスワードでログイン
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
            {state.error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@example.com"
          />
          {state?.fieldErrors?.email && (
            <p className="mt-1 text-xs text-danger">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••"
          />
          {state?.fieldErrors?.password && (
            <p className="mt-1 text-xs text-danger">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        アカウントをお持ちでない方は{" "}
        <Link
          href="/signup"
          className="font-medium text-primary hover:underline"
        >
          サインアップ
        </Link>
      </p>

      <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
        admin@example.com / password123
      </p>
    </>
  );
};
export default LoginPage;
