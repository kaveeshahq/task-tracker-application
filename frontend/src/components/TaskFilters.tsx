import type { TaskStatus, Pagination } from "../types";

interface Props {
  status: TaskStatus | "";
  onStatusChange: (status: TaskStatus | "") => void;
  pagination: Pagination | null;
  onPageChange: (page: number) => void;
}

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export default function TaskFilters({
  status,
  onStatusChange,
  pagination,
  onPageChange,
}: Props) {
  const totalLabel = pagination ? `${pagination.total} tasks` : "Tasks";

  return (
    <div className="mb-5 rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            Task filters
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span>{totalLabel}</span>
            {status && (
              <span className="rounded-full bg-sky-50 px-2.5 py-1 font-medium text-sky-700 ring-1 ring-inset ring-sky-100">
                Filtered by {status.replace("_", " ").toLowerCase()}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600">Status</label>
            <select
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value as TaskStatus | "")
              }
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            {status && (
              <button
                onClick={() => onStatusChange("")}
                className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </div>

          {pagination && pagination.totalPages > 0 && (
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600 ring-1 ring-inset ring-slate-200">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              <span className="whitespace-nowrap px-1 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
