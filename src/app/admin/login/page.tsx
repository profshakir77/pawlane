"use client";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    if (res.ok) window.location.href = new URLSearchParams(location.search).get("next") || "/admin";
    else setError((await res.json()).error);
  }
  return (
    <div className="grid min-h-screen place-items-center bg-meadow px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-3xl bg-paper p-8">
        <h1 className="text-3xl font-extrabold">Store admin</h1>
        <input name="email" type="email" className="input" placeholder="Email" required autoComplete="username" />
        <input name="password" type="password" className="input" placeholder="Password" required autoComplete="current-password" />
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button className="btn-primary w-full">Sign in</button>
        <Link href="/admin/forgot" className="block text-center text-sm underline">Forgot password?</Link>
      </form>
    </div>
  );
}
