"use client";
import Link from "next/link";
import { useState } from "react";

export default function Forgot() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const email = new FormData(e.currentTarget).get("email");
    const res = await fetch("/api/admin/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setMsg((await res.json().catch(() => ({}))).message ?? "Check your inbox.");
    setBusy(false);
  }
  return (
    <div className="grid min-h-screen place-items-center bg-meadow px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-3xl bg-paper p-8">
        <h1 className="text-3xl font-extrabold">Forgot password</h1>
        <p className="text-sm text-ink/65">Enter the admin email. We'll send a link to choose a new password.</p>
        <input name="email" type="email" className="input" placeholder="Admin email" required autoComplete="username" />
        {msg && <p role="status" className="rounded-xl bg-meadow p-3 text-sm">{msg}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Sending..." : "Send reset link"}</button>
        <Link href="/admin/login" className="block text-center text-sm underline">Back to sign in</Link>
      </form>
    </div>
  );
}
