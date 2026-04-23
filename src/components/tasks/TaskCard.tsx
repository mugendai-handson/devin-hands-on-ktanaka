import { Calendar, User } from "lucide-react";
import { format } from "date-fns";

import type { TaskPriority } from "@prisma/client";

type TaskCardProps = {
  task: {
    id: string;
    taskNumber: number;
    title: string;
    priority: TaskPriority;
    dueDate: Date | null;
    assignee: { name: string } | null;
  };
  projectKey: string;
};

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  URGENT: { label: "緊急", className: "bg-danger text-danger-foreground" },
  HIGH: { label: "高", className: "bg-danger/70 text-danger-foreground" },
  MEDIUM: { label: "中", className: "bg-warning text-warning-foreground" },
  LOW: { label: "低", className: "bg-success text-success-foreground" },
  NONE: { label: "なし", className: "bg-muted text-muted-foreground" },
};

export const TaskCard = ({ task, projectKey }: TaskCardProps) => {
  const priority = priorityConfig[task.priority];

  return (
    <div className="rounded-md border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {projectKey}-{task.taskNumber}
        </span>
        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${priority.className}`}>
          {priority.label}
        </span>
      </div>

      <p className="text-sm font-medium text-card-foreground">{task.title}</p>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        {task.dueDate ? (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {format(new Date(task.dueDate), "MM/dd")}
          </span>
        ) : (
          <span />
        )}

        {task.assignee ? (
          <span className="flex items-center gap-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {task.assignee.name[0]}
            </div>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-muted-foreground/50">
            <User size={12} />
          </span>
        )}
      </div>
    </div>
  );
};
