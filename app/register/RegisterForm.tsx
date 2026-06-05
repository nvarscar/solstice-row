"use client";

import { useState, useRef } from "react";
import { Waves, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

interface FormData {
  name: string;
  captain: string;
  captainEmail: string;
  captainPhone: string;
  club: string;
  members: string;
  pledgePerKm: string;
  notes: string;
  turnstileToken: string;
}

const INITIAL: FormData = {
  name: "",
  captain: "",
  captainEmail: "",
  captainPhone: "",
  club: "",
  members: "1",
  pledgePerKm: "",
  notes: "",
  turnstileToken: "",
};

const inputClass =
  "w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-solstice-gold/50 focus:border-solstice-gold/50 transition-all";

export default function RegisterForm({ siteKey }: { siteKey: string }) {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [error, setError] = useState("");
  const turnstileRef = useRef<TurnstileInstance>(null);

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.turnstileToken) {
      setError("Please complete the CAPTCHA verification.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          captain: form.captain,
          captainEmail: form.captainEmail,
          captainPhone: form.captainPhone,
          club: form.club,
          members: parseInt(form.members) || 1,
          pledgePerKm: parseFloat(form.pledgePerKm) || 0,
          notes: form.notes,
          turnstileToken: form.turnstileToken,
        }),
      });
      if (res.ok) {
        setSubmittedName(form.name);
        setSubmitted(true);
      } else {
        const d = await res.json();
        setError(d.error || "Registration failed. Please try again.");
        turnstileRef.current?.reset();
        setForm((prev) => ({ ...prev, turnstileToken: "" }));
      }
    } catch {
      setError("Network error. Please try again.");
      turnstileRef.current?.reset();
      setForm((prev) => ({ ...prev, turnstileToken: "" }));
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen admin-bg">
      <header className="border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <Waves className="w-5 h-5 text-solstice-gold group-hover:text-solstice-gold-light transition-colors" />
            <span className="font-bold text-white text-lg tracking-tight">
              Solstice<span className="text-solstice-gold">Row</span>
            </span>
          </a>
          <a
            href="/"
            className="flex items-center gap-1.5 text-forest-300 text-sm hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {submitted ? (
          <div className="text-center py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-white text-3xl font-bold mb-3">Registration Submitted!</h1>
            <p className="text-forest-300 text-lg mb-2">
              Thanks for registering{" "}
              <span className="text-solstice-gold font-semibold">{submittedName}</span>.
            </p>
            <p className="text-forest-400 mb-8 max-w-md mx-auto">
              Your registration is pending review by the club. We&apos;ll be in touch at{" "}
              <span className="text-forest-200">{form.captainEmail}</span> to confirm your spot.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-solstice-gold text-forest-950 font-bold rounded-xl hover:bg-solstice-gold-light transition-colors"
            >
              Back to Main Site
            </a>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <span className="text-solstice-gold text-sm font-semibold uppercase tracking-widest">
                Elk Lake Summer Solstice Row
              </span>
              <h1 className="text-white text-4xl font-bold mt-2 mb-2">Register Your Team</h1>
              <p className="text-forest-300">Victoria City Rowing Club · July 21, 2026</p>
              <p className="text-forest-400 text-sm mt-2">
                Your registration will be reviewed by the club before it appears on the leaderboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Team Info */}
              <div className="card-glass rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">Team Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-forest-200 mb-1.5">
                      Team Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="e.g. Rusted Riggers"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-forest-200 mb-1.5">
                      Club / Organization
                    </label>
                    <input
                      type="text"
                      value={form.club}
                      onChange={(e) => set("club", e.target.value)}
                      placeholder="e.g. VCRC, VRS"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-forest-200 mb-1.5">
                      Number of Rowers <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={form.members}
                      onChange={(e) => set("members", e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Captain Contact */}
              <div className="card-glass rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">Captain / Lead Contact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-forest-200 mb-1.5">
                      Captain Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.captain}
                      onChange={(e) => set("captain", e.target.value)}
                      placeholder="Full name"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-forest-200 mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.captainEmail}
                      onChange={(e) => set("captainEmail", e.target.value)}
                      placeholder="captain@example.com"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-forest-200 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={form.captainPhone}
                      onChange={(e) => set("captainPhone", e.target.value)}
                      placeholder="Optional"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Fundraising */}
              <div className="card-glass rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-1">Fundraising</h2>
                <p className="text-forest-400 text-sm mb-4">
                  Optional — helps track your team&apos;s fundraising goal on the leaderboard.
                </p>
                <div>
                  <label className="block text-sm text-forest-200 mb-1.5">
                    Pledge rate ($ per km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.pledgePerKm}
                    onChange={(e) => set("pledgePerKm", e.target.value)}
                    placeholder="e.g. 2.50"
                    className="w-full sm:max-w-xs bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-solstice-gold/50 focus:border-solstice-gold/50 transition-all"
                  />
                  <p className="text-forest-500 text-xs mt-1.5">
                    Average pledge is $2–$3 per km. Donors may pledge on the{" "}
                    <a
                      href="https://vcrc.bc.ca/donate"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-solstice-gold hover:underline"
                    >
                      VCRC donation page
                    </a>
                    .
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="card-glass rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">Additional Notes</h2>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Any questions or special requests for the organizers…"
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-solstice-gold/50 focus:border-solstice-gold/50 transition-all resize-none"
                />
              </div>

              {/* CAPTCHA */}
              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={siteKey}
                  onSuccess={(token) => set("turnstileToken", token)}
                  onError={() => {
                    setError("CAPTCHA verification failed. Please try again.");
                    setForm((prev) => ({ ...prev, turnstileToken: "" }));
                  }}
                  onExpire={() => {
                    setForm((prev) => ({ ...prev, turnstileToken: "" }));
                  }}
                  options={{
                    theme: "dark",
                    size: "normal",
                  }}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-solstice-gold text-forest-950 font-bold text-base rounded-xl hover:bg-solstice-gold-light disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit Registration"
                )}
              </button>

              <p className="text-forest-500 text-xs text-center pb-8">
                Registrations are reviewed before appearing on the public leaderboard.
                We&apos;ll contact you at the email provided to confirm your spot.
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
