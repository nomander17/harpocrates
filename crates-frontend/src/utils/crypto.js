import argon2 from "argon2-browser/dist/argon2-bundled.min.js";
import { toast } from "sonner";

export function uint8ArrayToHex(uint8Array) {
  return Array.from(uint8Array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToUint8Array(hexString) {
  if (hexString.length % 2 !== 0) {
    throw new Error("Invalid hexString");
  }
  const arrayBuffer = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    const byteValue = parseInt(hexString.substr(i, 2), 16);
    if (isNaN(byteValue)) {
      throw new Error("Invalid hexString");
    }
    arrayBuffer[i / 2] = byteValue;
  }
  return arrayBuffer;
}

export function generateSalt(byteLength = 16) {
  const array = new Uint8Array(byteLength);
  crypto.getRandomValues(array);
  return array;
}

export async function generateHash(password, salt, argon2_params) {
  const hash = await argon2.hash({
    pass: password,
    salt: salt,
    type: argon2_params.type,
    time: argon2_params.time,
    mem: argon2_params.mem,
    hashLen: argon2_params.hashLen,
    parallelism: argon2_params.parallelism,
  });

  return hash.hashHex;
}

export async function getEncryptionKey() {
  const keyHex = sessionStorage.getItem("encryption_key");
  if (!keyHex) return null;
  const keyBytes = hexToUint8Array(keyHex);
  return crypto.subtle.importKey("raw", keyBytes, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function decryptText(ciphertext, iv, key) {
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    toast.error("Failed to decrypt data. Check your password.");
    return "Decryption Failed";
  }
}

export async function encryptText(plaintext, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedText
  );
  return {
    ciphertext: uint8ArrayToHex(new Uint8Array(ciphertext)),
    iv: uint8ArrayToHex(iv),
  };
}
