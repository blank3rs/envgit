import { requireProjectRoot } from '../keystore.js';
import { loadConfig } from '../config.js';
import { setCurrentEnv, getCurrentEnv } from '../state.js';
import { ok, fatal, envLabel, dim } from '../ui.js';
import { pickEnv } from '../interactive.js';

export async function use(envName) {
  const projectRoot = requireProjectRoot();
  const config      = loadConfig(projectRoot);
  const current     = getCurrentEnv(projectRoot);

  const name = envName ?? await pickEnv(config.envs, 'Switch to environment');

  if (!config.envs.includes(name)) {
    fatal(`Environment '${name}' does not exist. Create it with: envgit add-env ${name}`);
  }

  if (name === current) {
    ok(`Already on ${envLabel(name)}`);
    return;
  }

  setCurrentEnv(projectRoot, name);

  console.log('');
  ok(`Switched to ${envLabel(name)}`);
  console.log(dim(`  Run envgit unpack to write .env for this environment.`));
  console.log('');
}
