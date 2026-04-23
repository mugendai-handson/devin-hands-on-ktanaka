import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).default("BACKLOG"),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW", "NONE"]).default("NONE"),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
