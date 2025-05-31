// lib/encryption-edge.ts  (works in Edge and in the browser)
const ITERATIONS = 100_000;
const KEY_LENGTH = 256;                 // bits
const IV_LENGTH = 12;                   // bytes
const SALT_LENGTH = 16;                 // bytes

async function getKeyMaterial(secret: string) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, [
    "deriveKey",
  ]);
}

async function deriveKey(secret: string, salt: Uint8Array) {
  const keyMaterial = await getKeyMaterial(secret);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(text: string) {
  const iv   = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key  = await deriveKey(process.env.ENCRYPTION_SECRET!, salt);

  const enc  = new TextEncoder();
  const cipherText = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );

  // salt | iv | ciphertext   → base64
  const combined = new Uint8Array([
    ...salt,
    ...iv,
    ...new Uint8Array(cipherText),
  ]);
  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(b64: string) {
  const data = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const salt = data.slice(0, SALT_LENGTH);
  const iv   = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const cipher = data.slice(SALT_LENGTH + IV_LENGTH);

  const key  = await deriveKey(process.env.ENCRYPTION_SECRET!, salt);
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher
  );
  return new TextDecoder().decode(plainBuf);
}
