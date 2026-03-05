import { findProjectRoot, saveKey } from '../keystore.js';
import { decrypt } from '../crypto.js';
import { ok, fatal, dim } from '../ui.js';

export async function join(blob, options) {
  if (!blob)          fatal('Blob required. Usage: envgit join <blob> --code <passphrase>');
  if (!options.code)  fatal('Passphrase required. Usage: envgit join <blob> --code <passphrase>');

  const projectRoot = findProjectRoot();
  if (!projectRoot) fatal('No envgit project found. Be inside the project directory.');

  let key;
  try {
    key = decrypt(blob, options.code);
  } catch {
    fatal('Decryption failed — wrong --code, or the blob was corrupted.');
  }

  const decoded = Buffer.from(key, 'base64');
  if (decoded.length !== 32) {
    fatal('Decrypted value is not a valid envgit key. Wrong --code?');
  }

  const keyPath = saveKey(projectRoot, key);

  console.log('');
  ok('Key saved.');
  console.log(dim(`  Stored at: ${keyPath}`));
  console.log('');
  console.log(dim('Run `envgit verify` to confirm it works.'));
  console.log(dim('Run `envgit unpack` to write your .env file.'));
  console.log('');
}
