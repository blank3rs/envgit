import { findProjectRoot, saveKey } from '../keystore.js';
import { decrypt } from '../crypto.js';
import { ok, fatal, bold, dim } from '../ui.js';

const RELAY = process.env.ENVGIT_RELAY ?? 'https://envgit-relay.akku41809.workers.dev';

export async function join(token, options) {
  if (!token)         fatal('Token required. Usage: envgit join <token> --code <passphrase>');
  if (!options.code)  fatal('Passphrase required. Usage: envgit join <token> --code <passphrase>');

  const projectRoot = findProjectRoot();
  if (!projectRoot) fatal('No envgit project found. Clone the repo and run envgit init first, or just be inside the project directory.');

  let blob;
  try {
    const res = await fetch(`${RELAY}/join/${token}`);

    if (res.status === 404) fatal('Token not found or already used. Ask your teammate to run envgit share again.');
    if (res.status === 410) fatal('Token has expired. Ask your teammate to run envgit share again.');
    if (!res.ok)            fatal(`Relay error: ${res.status}`);

    ({ blob } = await res.json());
  } catch (e) {
    if (e.cause?.code === 'ENOTFOUND') fatal('Cannot reach relay — check your connection.');
    fatal(`Join failed: ${e.message}`);
  }

  let key;
  try {
    key = decrypt(blob, options.code);
  } catch {
    fatal('Decryption failed — wrong --code, or the blob was tampered with.');
  }

  // Validate it looks like a real key before saving
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
  console.log(dim('Run `envgit unpack dev` to write your .env file.'));
  console.log('');
}
