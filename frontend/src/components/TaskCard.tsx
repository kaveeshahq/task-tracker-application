import type { Task } from "../types";
import StatusBadge from "./StatusBadge";

interface Props {
  task: Task;
  showOwner: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskCard({ task, showOwner, onEdit, onDelete }: Props) {
  const formatDate = (value?: string | null) =>
    value
      ? new Date(value).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:shadow-xl">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Due {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {task.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
            {showOwner && task.owner && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                Owner: {task.owner.name}
              </span>
            )}
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
              Updated {formatDate(task.updatedAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-row gap-2 sm:flex-col sm:items-end">
          <button
            onClick={() => onEdit(task)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task)}
            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
