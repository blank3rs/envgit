import { generateKey } from '../crypto.js';
import { findProjectRoot, saveKey, loadKey, globalKeyPath } from '../keystore.js';
import { loadConfig } from '../config.js';
import { ok, warn, fatal, bold, dim } from '../ui.js';

export async function keygen(options) {
  const projectRoot = findProjectRoot();

  if (options.show) {
    if (!projectRoot) {
      fatal('No envgit project found — cannot show key.');
    }
    let key;
    try {
      key = loadKey(projectRoot);
    } catch (e) {
      fatal(e.message);
    }
    const hint = key.slice(0, 8);
    console.log('');
    console.log(bold('Current key:'));
    console.log(`  ${key}`);
    console.log('');
    console.log(dim(`Hint (first 8 chars): ${hint}`));
    console.log(dim('Share via a secure channel (not git, not chat).'));
    console.log(dim('Teammate saves it with: envgit keygen --set <key>'));
    console.log('');
    return;
  }

  if (options.set) {
    const key = options.set;
    const decoded = Buffer.from(key, 'base64');
    if (decoded.length !== 32) {
      fatal(`Invalid key — must decode to exactly 32 bytes (got ${decoded.length}). Generate one with: envgit keygen`);
    }
    if (!projectRoot) {
      fatal('No envgit project found. Run envgit init first, or clone a repo that uses envgit.');
    }
    const keyPath = saveKey(projectRoot, key);
    ok(`Key saved for this project`);
    console.log(dim(`  Stored at: ${keyPath}`));
    console.log(dim(`  Hint: ${key.slice(0, 8)}`));
    console.log('');
    console.log(dim('Run `envgit verify` to confirm it works.'));
    console.log('');
    return;
  }

  // Generate new key
  const key = generateKey();
  const hint = key.slice(0, 8);

  if (projectRoot) {
    const keyPath = saveKey(projectRoot, key);
    ok(`New key generated`);
    console.log(dim(`  Stored at: ${keyPath}`));
  } else {
    console.log('');
    console.log(bold('Generated key (no project found — not saved):'));
  }

  console.log('');
  console.log(bold('Key:'));
  console.log(`  ${key}`);
  console.log('');
  console.log(dim(`Hint (first 8 chars): ${hint}`));
  console.log(dim('Share via a secure channel (not git, not chat).'));
  console.log(dim('Teammate saves it with: envgit keygen --set <key>'));
  console.log('');
}
