"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signup } from "@/lib/actions/auth";

import type { AuthState } from "@/lib/actions/auth";

const SignupPage = () => {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(signup, null);

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">サインアップ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          新しいアカウントを作成
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
            名前
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="山田 太郎"
          />
          {state?.fieldErrors?.name && (
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
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
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="8文字以上"
          />
          {state?.fieldErrors?.password && (
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "作成中..." : "アカウントを作成"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        既にアカウントをお持ちの方は{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          ログイン
        </Link>
      </p>
    </>
  );
};
export default SignupPage;
