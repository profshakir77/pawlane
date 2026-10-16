// Fill these in through environment variables before going live.
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@example.com";
export const LEGAL_NAME = process.env.NEXT_PUBLIC_LEGAL_NAME || "Wrenpaw";
export const OWNER_NAME = process.env.NEXT_PUBLIC_OWNER_NAME || "";
export const BUSINESS_LOCATION = process.env.NEXT_PUBLIC_BUSINESS_LOCATION || "";
export const RETURN_ADDRESS = process.env.RETURN_ADDRESS || "We'll email you the return address when you start a return.";
// True once an email service is set up (see lib/email.ts), so pages only
// promise a confirmation email when one is really sent.
export const ORDER_EMAILS = process.env.NEXT_PUBLIC_ORDER_EMAILS === "true";
