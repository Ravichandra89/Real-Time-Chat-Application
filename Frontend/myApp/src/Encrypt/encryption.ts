export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// 1. Generate the Keys
export const generateECDHKeyPair = async (): Promise<CryptoKeyPair> => {
  return crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey"]
  );
};

// 2. Export and Import public keys
export const exportPublicKey = async (key: CryptoKey): Promise<string> => {
  const spkiBuffer = await crypto.subtle.exportKey("spki", key);
  return arrayBufferToBase64(spkiBuffer);
};

export const importPublicKey = async (
  spkiBase64: string
): Promise<CryptoKey> => {
  const spkiBuffer = base64ToArrayBuffer(spkiBase64);
  return crypto.subtle.importKey(
    "spki",
    spkiBuffer,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
};

// Derive the shared AES key using ECDH

export const deriveAESKey = (
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<CryptoKey> => {
  return crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: publicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
};

// Encrypt and Decrypt the message
export const encryptMessage = async (
  aesKey: CryptoKey,
  plaintext: string
): Promise<{ ciphertext: string; iv: string }> => {
  //  Generating IV for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(plaintext);

  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    encodedText
  );

  return {
    ciphertext: arrayBufferToBase64(cipherBuffer),
    iv: arrayBufferToBase64(iv.buffer),
  };
};

export const decryptMessage = async (
  aesKey: CryptoKey,
  ciphertextBase64: string,
  ivBase64: string
): Promise<string> => {
  const cipherBuffer = base64ToArrayBuffer(ciphertextBase64);
  const ivBuffer = base64ToArrayBuffer(ivBase64);
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(ivBuffer),
    },
    aesKey,
    cipherBuffer
  );

  const decoder = new TextDecoder();
  return decoer.decode(decryptedBuffer);
};
