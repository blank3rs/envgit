import { readFileSync, writeFileSync, existsSync } from 'fs';
import { encrypt, decrypt } from './crypto.js';
import { getEncPath } from './config.js';
import { parseEnv, stringifyEnv } from './envfile.js';

export function readEncEnv(projectRoot, envName, key) {
  const encPath = getEncPath(projectRoot, envName);
  if (!existsSync(encPath)) return {};
  const ciphertext = readFileSync(encPath, 'utf8').trim();
  if (!ciphertext) return {};
  try {
    const plaintext = decrypt(ciphertext, key);
    return parseEnv(plaintext);
  } catch (e) {
    throw new Error(`Failed to decrypt ${envName}.enc — wrong key? (${e.message})`);
  }
}

export function writeEncEnv(projectRoot, envName, key, vars) {
  const encPath = getEncPath(projectRoot, envName);
  const plaintext = stringifyEnv(vars);
  const ciphertext = encrypt(plaintext, key);
  writeFileSync(encPath, ciphertext, 'utf8');
}
