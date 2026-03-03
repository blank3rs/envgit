import { join } from 'path';
import { existsSync } from 'fs';
import { requireProjectRoot, loadKey } from '../keystore.js';
import { loadConfig, getEncPath } from '../config.js';
import { readEncEnv } from '../enc.js';
import { writeEnvFile } from '../envfile.js';
import { getCurrentEnv, setCurrentEnv } from '../state.js';
import { ok, fatal, dim, envLabel } from '../ui.js';
import { pickEnv } from '../interactive.js';

export async function unpack(envArg) {
  const projectRoot = requireProjectRoot();
  const key         = loadKey(projectRoot);
  const config      = loadConfig(projectRoot);
  const current     = getCurrentEnv(projectRoot);

  // Priority: explicit arg → active env → interactive pick
  const name = envArg
    ?? current
    ?? await pickEnv(config.envs, 'Which environment to unpack?');

  const encPath = getEncPath(projectRoot, name);
  if (!existsSync(encPath)) {
    fatal(`Environment '${name}' does not exist. Create it with: envgit add-env ${name}`);
  }

  const vars = readEncEnv(projectRoot, name, key);
  writeEnvFile(join(projectRoot, '.env'), vars, { envName: name, projectRoot });
  setCurrentEnv(projectRoot, name);

  const count = Object.keys(vars).length;
  ok(`Unpacked ${envLabel(name)} → .env ${dim(`(${count} var${count !== 1 ? 's' : ''})`)}`);
}
