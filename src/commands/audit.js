import chalk from 'chalk';
import { requireProjectRoot, loadKey } from '../keystore.js';
import { loadConfig } from '../config.js';
import { readEncEnv } from '../enc.js';
import { bold, dim, ok } from '../ui.js';

export async function audit() {
  const projectRoot = requireProjectRoot();
  const key         = loadKey(projectRoot);
  const config      = loadConfig(projectRoot);

  if (config.envs.length < 2) {
    console.log('');
    console.log(dim('  Only one environment — nothing to compare.'));
    console.log(dim('  Add more with: envgit add-env <name>'));
    console.log('');
    return;
  }

  // Load all envs
  const envVars = {};
  for (const envName of config.envs) {
    envVars[envName] = readEncEnv(projectRoot, envName, key);
  }

  // Collect every key across all envs
  const allKeys = [...new Set(config.envs.flatMap(e => Object.keys(envVars[e])))].sort();

  if (allKeys.length === 0) {
    console.log(dim('\n  No variables found across any environment.\n'));
    return;
  }

  // Find keys that are missing from at least one env
  const missing = {};   // key → [envs it's missing from]
  const present = {};   // key → [envs it's in]

  for (const key of allKeys) {
    missing[key] = config.envs.filter(e => !(key in envVars[e]));
    present[key] = config.envs.filter(e =>  (key in envVars[e]));
  }

  const problemKeys = allKeys.filter(k => missing[k].length > 0);
  const cleanKeys   = allKeys.filter(k => missing[k].length === 0);

  // ── Header ────────────────────────────────────────────────────────────────
  console.log('');
  console.log(bold('Audit') + dim(` — ${config.envs.join(', ')}`));
  console.log('');

  // ── Missing keys ──────────────────────────────────────────────────────────
  if (problemKeys.length === 0) {
    ok(`All ${allKeys.length} keys are present in every environment.`);
    console.log('');
    return;
  }

  // Column header
  const pad = Math.max(...allKeys.map(k => k.length), 4) + 2;
  const envHeaders = config.envs.map(e => e.padEnd(8)).join('  ');
  console.log(dim('  ' + 'KEY'.padEnd(pad) + envHeaders));
  console.log(dim('  ' + '─'.repeat(pad + config.envs.length * 10)));

  for (const key of problemKeys) {
    const cols = config.envs.map(e => {
      if (key in envVars[e]) return chalk.green('  ✓'.padEnd(10));
      return chalk.red('  ✗'.padEnd(10));
    }).join('');
    console.log(`  ${chalk.bold(key.padEnd(pad))}${cols}`);
  }

  if (cleanKeys.length > 0) {
    console.log(dim(`\n  ${cleanKeys.length} key${cleanKeys.length !== 1 ? 's' : ''} present in all envs (hidden)`));
  }

  console.log('');
  console.log(chalk.yellow(bold(`${problemKeys.length} key${problemKeys.length !== 1 ? 's' : ''} missing from one or more environments.`)));

  // Per-env fix hints
  console.log('');
  for (const envName of config.envs) {
    const needed = problemKeys.filter(k => !(k in envVars[envName]));
    if (needed.length > 0) {
      console.log(dim(`  Fix ${envName}:  envgit set ${needed.join('=... ')}=... --env ${envName}`));
    }
  }

  console.log('');
}
