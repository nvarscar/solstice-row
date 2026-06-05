"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ username: "admin", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push(params.get("from") || "/admin/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error — is the server running?");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen admin-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-solstice-gold/20 border border-solstice-gold/40 mb-4">
            <span className="text-2xl">🚣</span>
          </div>
          <h1 className="text-3xl font-bold text-solstice-gold">Solstice Row</h1>
          <p className="text-forest-300 mt-1 text-sm">Admin Panel · VCRC</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card-glass rounded-2xl p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-forest-200 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-solstice-gold/50 focus:border-solstice-gold/50 transition-all"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-forest-200 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-solstice-gold/50 focus:border-solstice-gold/50 transition-all"
              placeholder="Enter password"
              autoFocus
              suppressHydrationWarning
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2.5 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-solstice-gold text-forest-950 font-bold rounded-lg hover:bg-solstice-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>

        <p className="text-center text-forest-400 text-xs mt-4">
          Initial password is printed in Docker container logs on first run.
        </p>
        <p className="text-center mt-2">
          <a href="/" className="text-forest-400 text-xs hover:text-forest-200 transition-colors">
            ← Back to website
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
