import chalk from 'chalk';
import { requireProjectRoot, loadKey } from '../keystore.js';
import { loadConfig } from '../config.js';
import { readEncEnv } from '../enc.js';
import { getCurrentEnv } from '../state.js';
import { dim } from '../ui.js';

export async function envs() {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const config = loadConfig(projectRoot);
  const current = getCurrentEnv(projectRoot);

  console.log('');
  for (const envName of config.envs) {
    const isActive = envName === current;
    const bullet = isActive ? chalk.green('●') : ' ';
    const vars = readEncEnv(projectRoot, envName, key);
    const count = Object.keys(vars).length;
    const countStr = dim(`(${count} var${count !== 1 ? 's' : ''})`);
    const activeSuffix = isActive ? chalk.cyan(' (active)') : '';
    console.log(`  ${bullet} ${isActive ? chalk.bold(envName) : envName} ${countStr}${activeSuffix}`);
  }
  console.log('');
}
