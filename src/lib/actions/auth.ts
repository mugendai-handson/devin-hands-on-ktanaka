"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { signupSchema, loginSchema } from "@/lib/validations/auth";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export const signup = async (
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> => {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "このメールアドレスは既に登録されています" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // signIn throws NEXT_REDIRECT on success — rethrow it
    if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      error: "アカウントは作成されましたが、自動ログインに失敗しました",
    };
  }

  return null;
};

export const login = async (
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> => {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  return null;
};

export const signOutAction = async () => {
  await signOut({ redirectTo: "/login" });
};
