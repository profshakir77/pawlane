"use client";
import Link from "next/link";
import { useState } from "react";

export default function Reset() {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("confirm")) return setError("The two passwords don't match.");
    const token = new URLSearchParams(location.search).get("token") ?? "";
    const res = await fetch("/api/admin/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password: fd.get("password") }) });
    if (res.ok) setDone(true);
    else setError((await res.json().catch(() => ({}))).error ?? "Something went wrong.");
  }
  return (
    <div className="grid min-h-screen place-items-center bg-meadow px-5">
      {done ? (
        <div className="w-full max-w-sm space-y-4 rounded-3xl bg-paper p-8 text-center">
          <h1 className="text-3xl font-extrabold">Password changed</h1>
          <Link href="/admin/login" className="btn-primary w-full">Sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-3xl bg-paper p-8">
          <h1 className="text-3xl font-extrabold">Choose a new password</h1>
          <p className="text-sm text-ink/65">At least 10 characters, with letters and numbers.</p>
          <input name="password" type="password" className="input" placeholder="New password" required minLength={10} autoComplete="new-password" />
          <input name="confirm" type="password" className="input" placeholder="Repeat new password" required minLength={10} autoComplete="new-password" />
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full">Save new password</button>
        </form>
      )}
    </div>
  );
}
