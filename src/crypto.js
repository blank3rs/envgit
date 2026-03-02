import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for GCM

export function generateKey() {
  return randomBytes(32).toString('base64');
}

export function encrypt(plaintext, keyBase64) {
  const key = Buffer.from(keyBase64, 'base64');
  try {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    const result = JSON.stringify({
      v: 1,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      data: encrypted.toString('base64'),
    });
    encrypted.fill(0);
    return result;
  } finally {
    key.fill(0);
  }
}

export function decrypt(ciphertext, keyBase64) {
  const key = Buffer.from(keyBase64, 'base64');
  try {
    const { iv, tag, data } = JSON.parse(ciphertext);
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data, 'base64')),
      decipher.final(),
    ]);
    const result = decrypted.toString('utf8');
    decrypted.fill(0);
    return result;
  } finally {
    key.fill(0);
  }
}
