import { useState } from "react";
import type { Task, TaskInput, TaskStatus } from "../types";
import { getApiErrorMessage } from "../utils/errorMessage";

interface Props {
  initial?: Task | null;
  onSubmit: (input: TaskInput) => Promise<void>;
  onClose: () => void;
}

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export default function TaskForm({ initial, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? "TODO");
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? initial.dueDate.slice(0, 10) : "",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const input: TaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        dueDate: dueDate || undefined,
      };
      await onSubmit(input);
      onClose();
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Failed to save task"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/50 bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-800 px-6 py-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-200">
            Task details
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {initial ? "Edit task" : "Create task"}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Keep the team moving with a clear title, status, and due date.
          </p>
        </div>

        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Title
              </span>
              <input
                autoFocus
                type="text"
                placeholder="Ship the dashboard refresh"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </span>
              <textarea
                placeholder="Describe the outcome, blockers, or acceptance criteria."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Due date
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="rounded-full border border-slate-200 px-5 py-2.5 font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-slate-900 px-5 py-2.5 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
