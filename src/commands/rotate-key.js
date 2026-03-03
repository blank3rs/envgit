import { requireProjectRoot, loadKey, saveKey } from '../keystore.js';
import { loadConfig } from '../config.js';
import { readEncEnv, writeEncEnv } from '../enc.js';
import { generateKey } from '../crypto.js';
import { ok, warn, bold, dim } from '../ui.js';

export async function rotateKey() {
  const projectRoot = requireProjectRoot();
  const oldKey = loadKey(projectRoot);
  const config = loadConfig(projectRoot);

  const oldHint = oldKey.slice(0, 8);

  const newKey = generateKey();
  const newHint = newKey.slice(0, 8);

  console.log('');
  console.log(bold('Rotating encryption key...'));
  console.log('');

  for (const envName of config.envs) {
    const vars = readEncEnv(projectRoot, envName, oldKey);
    writeEncEnv(projectRoot, envName, newKey, vars);
    ok(`Re-encrypted ${envName}`);
  }

  saveKey(projectRoot, newKey);

  console.log('');
  console.log(dim(`Old hint: ${oldHint}`));
  console.log(dim(`New hint: ${newHint}`));
  console.log('');
  warn('Old key is now invalid — teammates need the new one.');
  console.log(dim('Run envgit share, then send teammates the join command.'));
  console.log('');
}
