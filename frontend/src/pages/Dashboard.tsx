import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/useAuth";
import type { Task, TaskStatus, TaskInput, Pagination } from "../types";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters";
import { useSocket } from "../hooks/useSocket";
import { getApiErrorMessage } from "../utils/errorMessage";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const totalTasks = pagination?.total ?? tasks.length;
  const totalPages = pagination?.totalPages ?? 1;
  const visibleCount = tasks.length;

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getTasks({
        page,
        limit: 10,
        status: status || undefined,
      });
      setTasks(res.data);
      setPagination(res.pagination);
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Failed to load tasks"));
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadTasks();
    });
  }, [loadTasks]);

  // Real-time updates: keep the visible list in sync with server events
  useSocket({
    onCreated: (task) => {
      setTasks((prev) => {
        // Avoid duplicates (e.g. the creator already refetched)
        if (prev.some((t) => t.id === task.id)) return prev;
        // Only show on page 1, and respect the active status filter
        if (page !== 1) return prev;
        if (status && task.status !== status) return prev;
        return [task, ...prev];
      });
    },
    onUpdated: (task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    },
    onDeleted: (task) => {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    },
  });

  const handleCreate = async (input: TaskInput) => {
    await createTask(input);
    await loadTasks();
  };

  const handleUpdate = async (input: TaskInput) => {
    if (!editing) return;
    await updateTask(editing.id, input);
    await loadTasks();
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    await deleteTask(task.id);
    await loadTasks();
  };

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-white/70 bg-white/70 px-5 py-4 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">
                Task Tracker
              </p>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
                Organized work, live updates, less friction.
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                {user?.name} · {user?.role}
              </div>
              <button
                onClick={logout}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        <main className="mt-6 space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-7 text-white shadow-2xl shadow-slate-900/10 sm:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-200">
                  {isAdmin ? "Team overview" : "Personal workspace"}
                </p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                  {isAdmin
                    ? "All tasks in one place"
                    : "Your active tasks in focus"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Track progress, edit work in place, and keep the queue moving
                  with live updates that stay in sync across collaborators.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    Visible
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{visibleCount}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{totalTasks}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    Pages
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{totalPages}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {isAdmin ? "All tasks" : "My tasks"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Manage, filter, and update tasks without leaving the page.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              + New task
            </button>
          </div>

          <TaskFilters
            status={status}
            onStatusChange={(s) => {
              setStatus(s);
              setPage(1);
            }}
            pagination={pagination}
            onPageChange={setPage}
          />

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 px-6 py-10 text-center text-slate-600 shadow-sm">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-6 py-14 text-center shadow-sm">
              <h3 className="text-2xl font-semibold text-slate-900">
                No tasks found
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                {status
                  ? "Try clearing the filter or create a new task to get started."
                  : "Create the first task and start building your queue."}
              </p>
              <button
                onClick={openCreate}
                className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                + New task
              </button>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  showOwner={isAdmin}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showForm && (
        <TaskForm
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
