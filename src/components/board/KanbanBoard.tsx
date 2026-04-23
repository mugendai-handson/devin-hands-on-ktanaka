import { KanbanColumn } from "@/components/board/KanbanColumn";

import type { TaskPriority, TaskStatus } from "@prisma/client";

type Task = {
  id: string;
  taskNumber: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  assignee: { name: string } | null;
};

type KanbanBoardProps = {
  tasks: Task[];
  projectKey: string;
};

const columns: { status: TaskStatus; label: string }[] = [
  { status: "BACKLOG", label: "Backlog" },
  { status: "TODO", label: "Todo" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "IN_REVIEW", label: "In Review" },
  { status: "DONE", label: "Done" },
];

export const KanbanBoard = ({ tasks, projectKey }: KanbanBoardProps) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <KanbanColumn
          key={col.status}
          status={col.status}
          label={col.label}
          tasks={tasks.filter((t) => t.status === col.status)}
          projectKey={projectKey}
        />
      ))}
    </div>
  );
};
