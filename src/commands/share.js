import { findProjectRoot, loadKey } from '../keystore.js';
import { encrypt, generateKey } from '../crypto.js';
import { ok, fatal, bold, dim } from '../ui.js';

export async function share() {
  const projectRoot = findProjectRoot();
  if (!projectRoot) fatal('No envgit project found. Run envgit init first.');

  let key;
  try { key = loadKey(projectRoot); }
  catch (e) { fatal(e.message); }

  // Encrypt the key with a one-time passphrase — never leaves your machine unencrypted
  const passphrase = generateKey();
  const blob       = encrypt(key, passphrase);

  console.log('');
  ok('Key encrypted. Send the command below to your teammate via Signal, iMessage, email — anywhere.');
  console.log('');
  console.log(bold('Run this on their machine:'));
  console.log('');
  console.log(`  envgit join ${blob} --code ${passphrase}`);
  console.log('');
  console.log(dim('The blob is AES-256-GCM encrypted — useless without the passphrase.'));
  console.log(dim('Nothing was uploaded anywhere.'));
  console.log('');
}
