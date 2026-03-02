import { randomBytes } from 'crypto';
import { findProjectRoot, loadKey } from '../keystore.js';
import { encrypt, generateKey } from '../crypto.js';
import { ok, fatal, bold, dim } from '../ui.js';

const RELAY = process.env.ENVGIT_RELAY ?? 'https://envgit-relay.akku41809.workers.dev';

export async function share() {
  const projectRoot = findProjectRoot();
  if (!projectRoot) fatal('No envgit project found. Run envgit init first.');

  let key;
  try { key = loadKey(projectRoot); }
  catch (e) { fatal(e.message); }

  // Generate a one-time passphrase — used to encrypt the key before it leaves
  // the machine. The relay stores only ciphertext; it never sees this passphrase.
  const passphrase = generateKey(); // 32 bytes of OS randomness, base64-encoded
  const blob       = encrypt(key, passphrase);

  let token;
  try {
    const res = await fetch(`${RELAY}/share`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ blob }),
    });

    if (res.status === 429) fatal('Rate limit hit — try again in an hour.');
    if (!res.ok)            fatal(`Relay error: ${res.status}`);

    ({ token } = await res.json());
  } catch (e) {
    if (e.cause?.code === 'ENOTFOUND') fatal('Cannot reach relay — check your connection.');
    fatal(`Share failed: ${e.message}`);
  }

  console.log('');
  ok('Key encrypted and uploaded. Link expires in 24 hours, usable once.');
  console.log('');
  console.log(bold('Send this to your teammate:'));
  console.log('');
  console.log(`  envgit join ${token} --code ${passphrase}`);
  console.log('');
  console.log(dim('They can run it directly in their terminal after cloning.'));
  console.log(dim('The link is deleted the moment they use it.'));
  console.log('');
}
