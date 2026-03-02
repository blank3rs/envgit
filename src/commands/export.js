import { requireProjectRoot, loadKey } from '../keystore.js';
import { resolveEnv } from '../config.js';
import { readEncEnv } from '../enc.js';
import { getCurrentEnv } from '../state.js';
import { fatal } from '../ui.js';

export async function exportEnv(options) {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const envName = resolveEnv(projectRoot, options.env, getCurrentEnv(projectRoot));

  const vars = readEncEnv(projectRoot, envName, key);
  const format = options.format || 'dotenv';

  if (format === 'json') {
    process.stdout.write(JSON.stringify(vars, null, 2) + '\n');
  } else if (format === 'shell') {
    for (const [k, v] of Object.entries(vars)) {
      const escaped = v.replace(/"/g, '\\"');
      process.stdout.write(`export ${k}="${escaped}"\n`);
    }
  } else if (format === 'dotenv') {
    for (const [k, v] of Object.entries(vars)) {
      const needsQuotes = /[\s"'\\#]/.test(v) || v === '';
      const escaped = v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      process.stdout.write(`${k}=${needsQuotes ? `"${escaped}"` : v}\n`);
    }
  } else {
    fatal(`Unknown format '${format}'. Use: dotenv, json, shell`);
  }
}
