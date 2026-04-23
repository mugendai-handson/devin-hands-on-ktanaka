import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "プロジェクト名は必須です").max(100, "プロジェクト名は100文字以内で入力してください"),
  description: z.string().max(1000, "説明は1000文字以内で入力してください").optional(),
  key: z
    .string()
    .regex(/^[A-Z0-9]{2,10}$/, "プロジェクトキーは英大文字と数字 2〜10 文字で入力してください")
    .optional(),
});

export const updateProjectSchema = z
  .object({
    name: z.string().min(1, "プロジェクト名は必須です").max(100, "プロジェクト名は100文字以内で入力してください").optional(),
    description: z.string().max(1000, "説明は1000文字以内で入力してください").nullable().optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "更新する項目を指定してください",
  });

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;

/**
 * プロジェクト名からプロジェクトキーを自動生成する。
 * 例: "Devin Task Board" -> "DTB"
 *     "hello" -> "HEL"
 *     "日本語プロジェクト" -> "PROJECT" (フォールバック)
 */
export const generateProjectKey = (name: string): string => {
  const words = name
    .trim()
    .split(/[\s_\-]+/)
    .filter((w) => w.length > 0);

  const acronym = words
    .map((w) => {
      const firstAscii = w.match(/[A-Za-z0-9]/);
      return firstAscii ? firstAscii[0].toUpperCase() : "";
    })
    .join("");

  if (acronym.length >= 2) {
    return acronym.slice(0, 10);
  }

  const firstWord = words[0] ?? "";
  const asciiOnly = firstWord.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (asciiOnly.length >= 2) {
    return asciiOnly.slice(0, 10);
  }

  return "PROJECT";
};
