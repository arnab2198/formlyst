import { createHash, randomInt } from 'node:crypto';

// Alphanumeric only: these tokens get embedded directly in URLs (reset-password
// path segment, OAuth handoff query param) without percent-encoding, and
// characters like # % & ^ have special meaning in a URL and corrupt it.
const CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateOpaqueToken(length = 48): string {
  let out = '';
  for (let i = 0; i < length; i++) out += CHARSET[randomInt(CHARSET.length)];
  return out;
}

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  const visible = local.slice(0, 1);
  return `${visible}${'*'.repeat(Math.max(local.length - 1, 1))}@${domain}`;
}
