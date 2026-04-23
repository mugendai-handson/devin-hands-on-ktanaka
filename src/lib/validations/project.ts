import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "プロジェクト名は必須です"),
  description: z.string().optional(),
  key: z
    .string()
    .regex(/^[A-Z0-9]{2,10}$/, "キーは 2〜10 文字の英大文字・数字で指定してください")
    .optional(),
});

export const updateProjectSchema = z
  .object({
    name: z.string().min(1, "プロジェクト名は必須です").optional(),
    description: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "更新する項目を指定してください",
  });

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
