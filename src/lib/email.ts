import { formatUsd } from "./currency";
import { SUPPORT_EMAIL } from "./business";
import { SITE_URL } from "./seo";

// Order emails, sent over plain HTTPS (no extra packages).
// Set ONE of these in Vercel, plus EMAIL_FROM:
//   BREVO_API_KEY   free plan; the sender can be a verified Gmail address
//   RESEND_API_KEY  needs your own domain (e.g. wrenpaw.com) verified first
// EMAIL_FROM is the sender address, e.g. "you@gmail.com" or "hello@wrenpaw.com".
// Then set NEXT_PUBLIC_ORDER_EMAILS="true" so the site mentions the email.

type Mail = { to: string; subject: string; html: string; text: string };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

async function send(m: Mail): Promise<boolean> {
  const from = process.env.EMAIL_FROM;
  if (!from) return false;
  const name = process.env.NEXT_PUBLIC_STORE_NAME || "Wrenpaw";
  if (process.env.BREVO_API_KEY) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name, email: from }, to: [{ email: m.to }], replyTo: { email: SUPPORT_EMAIL },
        subject: m.subject, htmlContent: m.html, textContent: m.text,
      }),
    });
    if (!res.ok) throw new Error(`Brevo ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return true;
  }
  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: `${name} <${from}>`, to: [m.to], reply_to: SUPPORT_EMAIL, subject: m.subject, html: m.html, text: m.text }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return true;
  }
  return false;
}

type OrderForEmail = {
  number: number;
  email: string | null;
  name: string | null;
  subtotalCents: number;
  items: { title: string; quantity: number; unitPriceCents: number }[];
};

export async function sendOrderConfirmation(o: OrderForEmail): Promise<boolean> {
  if (!o.email) return false;
  const first = (o.name ?? "").split(" ")[0] || "there";
  const rows = o.items
    .map((i) => `<tr><td style="padding:8px 0">${esc(i.title)} &times; ${i.quantity}</td><td style="padding:8px 0;text-align:right">${formatUsd(i.unitPriceCents * i.quantity)}</td></tr>`)
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1F1D1A">
<h1 style="font-family:Georgia,serif;font-weight:400">Thank you, ${esc(first)}</h1>
<p>We've received your order <strong>#${o.number}</strong> and payment.</p>
<table style="width:100%;border-collapse:collapse;border-top:1px solid #E6E0D6;border-bottom:1px solid #E6E0D6">${rows}
<tr><td style="padding:8px 0"><strong>Total (free tracked shipping)</strong></td><td style="padding:8px 0;text-align:right"><strong>${formatUsd(o.subtotalCents)}</strong></td></tr></table>
<p>It takes 1 to 3 business days to pack, then most parcels arrive in 7 to 15 business days. When it ships, you can follow it here: <a href="${SITE_URL}/track">${SITE_URL}/track</a></p>
<p>Questions? Just reply to this email or write to ${esc(SUPPORT_EMAIL)}.</p>
<p>Wrenpaw</p></div>`;
  const text = `Thank you, ${first}. We've received order #${o.number} and payment.\n\n${o.items
    .map((i) => `${i.title} x ${i.quantity}: ${formatUsd(i.unitPriceCents * i.quantity)}`)
    .join("\n")}\nTotal (free tracked shipping): ${formatUsd(o.subtotalCents)}\n\nPacking takes 1 to 3 business days, then most parcels arrive in 7 to 15 business days. Track it at ${SITE_URL}/track\n\nQuestions? Reply to this email or write to ${SUPPORT_EMAIL}.`;
  return send({ to: o.email, subject: `Your Wrenpaw order #${o.number} is confirmed`, html, text });
}

type AbandonedForEmail = {
  email: string;
  name: string | null;
  items: { title: string; quantity: number; slug: string }[];
};

// One gentle reminder for someone who filled in checkout but didn't pay.
export async function sendCheckoutReminder(o: AbandonedForEmail): Promise<boolean> {
  const first = (o.name ?? "").split(" ")[0] || "there";
  const link = `${SITE_URL}/products/${o.items[0]?.slug ?? ""}`;
  const rows = o.items.map((i) => `<li style="padding:4px 0">${esc(i.title)}${i.quantity > 1 ? ` &times; ${i.quantity}` : ""}</li>`).join("");
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1F1D1A">
<h1 style="font-family:Georgia,serif;font-weight:400">Still thinking it over, ${esc(first)}?</h1>
<p>You started an order with us but didn't get to the payment step. Here's what you picked:</p>
<ul style="padding-left:18px">${rows}</ul>
<p><a href="${link}" style="display:inline-block;background:#1F1D1A;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none">Pick up where you left off</a></p>
<p>Shipping is free with tracking to the USA and Canada, and you have 30 days to return anything that doesn't suit your pet.</p>
<p>If something went wrong at checkout, or you have a question about sizing, just reply to this email.</p>
<p>Wrenpaw</p>
<p style="font-size:12px;color:#8a857d">This is a one-time reminder. We won't email you about this order again.</p></div>`;
  const text = `Still thinking it over, ${first}?\n\nYou started an order with us but didn't get to the payment step:\n${o.items
    .map((i) => `- ${i.title}${i.quantity > 1 ? ` x ${i.quantity}` : ""}`)
    .join("\n")}\n\nPick up where you left off: ${link}\n\nFree tracked shipping to the USA and Canada, and 30 days to return anything.\nQuestions? Just reply to this email.\n\nThis is a one-time reminder.`;
  return send({ to: o.email, subject: "You left something for your pet", html, text });
}

// Admin password reset link, sent only to ADMIN_EMAIL.
export async function sendAdminPasswordReset(to: string, link: string): Promise<boolean> {
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1F1D1A">
<h1 style="font-family:Georgia,serif;font-weight:400">Reset your admin password</h1>
<p>Someone asked to reset the password for the Wrenpaw store admin. If it was you, use the button below. The link works once and expires in 30 minutes.</p>
<p><a href="${link}" style="display:inline-block;background:#1F1D1A;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none">Choose a new password</a></p>
<p>If you didn't ask for this, you can ignore this email. Your password stays the same.</p></div>`;
  const text = `Reset your Wrenpaw admin password (link works once, expires in 30 minutes):\n${link}\n\nIf you didn't ask for this, ignore this email.`;
  return send({ to, subject: "Reset your Wrenpaw admin password", html, text });
}
