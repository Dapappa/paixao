import nacl from "tweetnacl";
import {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8,
} from "tweetnacl-util";

/* ─────────────────────────────────────────────
   Key Pair Generation
   ───────────────────────────────────────────── */

export interface KeyPair {
  publicKey: string; // base64
  secretKey: string; // base64
}

/** Generate a NaCl box keypair. Returns both keys as base64 strings. */
export function generateKeyPair(): KeyPair {
  const kp = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(kp.publicKey),
    secretKey: encodeBase64(kp.secretKey),
  };
}

/* ─────────────────────────────────────────────
   Encrypt / Decrypt
   ───────────────────────────────────────────── */

export interface EncryptedPayload {
  encrypted: string; // base64
  nonce: string; // base64
}

/**
 * Encrypt a plaintext message using NaCl box (asymmetric authenticated encryption).
 * @param plaintext        - the message to encrypt
 * @param recipientPublicKey - recipient's public key (base64)
 * @param senderSecretKey    - sender's secret key (base64)
 */
export function encryptMessage(
  plaintext: string,
  recipientPublicKey: string,
  senderSecretKey: string,
): EncryptedPayload {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageUint8 = decodeUTF8(plaintext);
  const pubKey = decodeBase64(recipientPublicKey);
  const secKey = decodeBase64(senderSecretKey);

  const encrypted = nacl.box(messageUint8, nonce, pubKey, secKey);
  if (!encrypted) {
    throw new Error("Encryption failed");
  }

  return {
    encrypted: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
}

/**
 * Decrypt an encrypted message using NaCl box.
 * @param encrypted         - encrypted content (base64)
 * @param nonce             - nonce used during encryption (base64)
 * @param senderPublicKey   - sender's public key (base64)
 * @param recipientSecretKey - recipient's secret key (base64)
 */
export function decryptMessage(
  encrypted: string,
  nonce: string,
  senderPublicKey: string,
  recipientSecretKey: string,
): string {
  const encryptedUint8 = decodeBase64(encrypted);
  const nonceUint8 = decodeBase64(nonce);
  const pubKey = decodeBase64(senderPublicKey);
  const secKey = decodeBase64(recipientSecretKey);

  const decrypted = nacl.box.open(encryptedUint8, nonceUint8, pubKey, secKey);
  if (!decrypted) {
    throw new Error("Decryption failed — invalid key or corrupted message");
  }

  return encodeUTF8(decrypted);
}

/* ─────────────────────────────────────────────
   Private Key Storage (localStorage)
   ───────────────────────────────────────────── */

const PRIVATE_KEY_STORAGE_KEY = "passionDen_privateKey";

/** Persist the user's private key to localStorage. */
export function storePrivateKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRIVATE_KEY_STORAGE_KEY, key);
}

/** Retrieve the user's private key from localStorage. Returns null if absent. */
export function getPrivateKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
}

/** Remove the stored private key from localStorage. */
export function clearPrivateKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PRIVATE_KEY_STORAGE_KEY);
}

/* ─────────────────────────────────────────────
   Phase 1 Helpers — plaintext-as-base64
   Full E2E can be toggled on later; these helpers
   let the app store plaintext in the encrypted_content
   column using the same shape.
   ───────────────────────────────────────────── */

const DUMMY_NONCE = encodeBase64(new Uint8Array(nacl.box.nonceLength)); // all zeros

/** Base64-encode plaintext so it can be stored in encrypted_content. */
export function encodeForStorage(plaintext: string): EncryptedPayload {
  return {
    encrypted: encodeBase64(decodeUTF8(plaintext)),
    nonce: DUMMY_NONCE,
  };
}

/** Decode a base64 encrypted_content back to plaintext (Phase 1 path). */
export function decodeFromStorage(encoded: string): string {
  return encodeUTF8(decodeBase64(encoded));
}
