import { requireProjectRoot, loadKey } from '../keystore.js';
import { loadConfig } from '../config.js';
import { readEncEnv } from '../enc.js';
import { getCurrentEnv } from '../state.js';
import { dim, envLabel } from '../ui.js';
import chalk from 'chalk';

export async function envs() {
  const projectRoot = requireProjectRoot();
  const key     = loadKey(projectRoot);
  const config  = loadConfig(projectRoot);
  const current = getCurrentEnv(projectRoot);

  console.log('');
  for (const envName of config.envs) {
    const isActive = envName === current;
    const bullet   = isActive ? chalk.green('●') : chalk.dim('○');
    const vars     = readEncEnv(projectRoot, envName, key);
    const count    = Object.keys(vars).length;
    const label    = isActive ? envLabel(envName) : chalk.dim(`[${envName}]`);
    const countStr = dim(`${count} var${count !== 1 ? 's' : ''}`);
    const hint     = isActive ? chalk.dim(' ← active') : '';
    console.log(`  ${bullet} ${label} ${countStr}${hint}`);
  }

  if (!current) {
    console.log('');
    console.log(dim('  No active environment. Run: envgit use <env>'));
  }
  console.log('');
}
