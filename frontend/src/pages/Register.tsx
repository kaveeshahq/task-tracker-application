import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getApiErrorMessage } from "../utils/errorMessage";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-2xl shadow-slate-900/10 backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
        <section className="order-2 flex items-center px-6 py-10 sm:px-10 lg:order-1 lg:px-12">
          <div className="w-full">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">
                Join the workspace
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Create your account
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Set up your profile and start using task tracking with live
                updates and clear ownership.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Name
                </span>
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </span>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </span>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-sky-700 hover:text-sky-800"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <section className="order-1 relative overflow-hidden bg-gradient-to-br from-sky-950 via-slate-900 to-slate-950 px-8 py-10 text-white sm:px-10 lg:order-2 lg:px-12 lg:py-12">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-[-7rem] top-[-5rem] h-64 w-64 rounded-full bg-cyan-400 blur-3xl" />
            <div className="absolute bottom-[-5rem] right-[-4rem] h-56 w-56 rounded-full bg-sky-500 blur-3xl" />
          </div>

          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-200">
                Built for teams
              </p>
              <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight sm:text-5xl">
                Start with a cleaner, faster task workspace.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                Create an account once and get a dashboard designed for clarity,
                ownership, and a little less friction every day.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                Simple signup
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                Protected access
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                Real-time updates
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
