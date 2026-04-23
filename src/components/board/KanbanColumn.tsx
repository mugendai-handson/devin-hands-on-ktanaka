import { TaskCard } from "@/components/tasks/TaskCard";

import type { TaskPriority, TaskStatus } from "@prisma/client";

type Task = {
  id: string;
  taskNumber: number;
  title: string;
  priority: TaskPriority;
  dueDate: Date | null;
  assignee: { name: string } | null;
};

type KanbanColumnProps = {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  projectKey: string;
};

export const KanbanColumn = ({
  status,
  label,
  tasks,
  projectKey,
}: KanbanColumnProps) => {
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2"
        data-status={status}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} projectKey={projectKey} />
        ))}
        {tasks.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            タスクなし
          </p>
        )}
      </div>
    </div>
  );
};
