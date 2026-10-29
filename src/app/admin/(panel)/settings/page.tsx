"use client";
import { useState } from "react";

export default function Settings() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("password") !== fd.get("confirm")) return setMsg({ ok: false, text: "The two new passwords don't match." });
    setBusy(true);
    const res = await fetch("/api/admin/password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: fd.get("current"), password: fd.get("password") }),
    });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) { form.reset(); setMsg({ ok: true, text: "Password changed. Use the new one next time you sign in." }); }
    else setMsg({ ok: false, text: j.error ?? "Something went wrong." });
  }

  return (
    <div className="max-w-md">
      <h1 className="text-3xl font-extrabold">Settings</h1>
      <section className="mt-8 rounded-2xl border border-ink/10 p-6">
        <h2 className="text-xl font-bold">Change password</h2>
        <p className="mt-1 text-sm text-ink/60">At least 10 characters, with letters and numbers. Forgot it? Use "Forgot password?" on the sign-in page.</p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input name="current" type="password" className="input" placeholder="Current password" required autoComplete="current-password" />
          <input name="password" type="password" className="input" placeholder="New password" required minLength={10} autoComplete="new-password" />
          <input name="confirm" type="password" className="input" placeholder="Repeat new password" required minLength={10} autoComplete="new-password" />
          {msg && <p role="status" className={`rounded-xl p-3 text-sm ${msg.ok ? "bg-meadow" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Saving..." : "Change password"}</button>
        </form>
      </section>
    </div>
  );
}
