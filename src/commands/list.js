import { requireProjectRoot, loadKey } from '../keystore.js';
import { resolveEnv, loadConfig } from '../config.js';
import { readEncEnv } from '../enc.js';
import { getCurrentEnv } from '../state.js';
import { fatal, label, dim, bold } from '../ui.js';

export async function list(options) {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const config = loadConfig(projectRoot);
  const envName = resolveEnv(projectRoot, options.env, getCurrentEnv(projectRoot));

  if (!config.envs.includes(envName)) {
    fatal(`Environment '${envName}' does not exist. Available: ${config.envs.join(', ')}`);
  }

  const vars = readEncEnv(projectRoot, envName, key);
  const entries = Object.entries(vars);

  console.log('');
  if (entries.length === 0) {
    console.log(`${label(envName)} is empty.`);
    console.log('');
    return;
  }

  console.log(label(envName));
  for (const [k, v] of entries) {
    if (options.showValues) {
      console.log(`  ${bold(k)}=${dim(v)}`);
    } else {
      console.log(`  ${k}`);
    }
  }
  console.log('');
}
