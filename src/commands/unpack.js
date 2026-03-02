import { join } from 'path';
import { existsSync } from 'fs';
import { requireProjectRoot, loadKey } from '../keystore.js';
import { getEncPath } from '../config.js';
import { readEncEnv } from '../enc.js';
import { writeEnvFile } from '../envfile.js';
import { setCurrentEnv } from '../state.js';
import { ok, fatal, label, dim } from '../ui.js';

export async function unpack(envName) {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);

  const encPath = getEncPath(projectRoot, envName);
  if (!existsSync(encPath)) {
    fatal(`Environment '${envName}' does not exist. Use 'envgit add-env ${envName}' to create it.`);
  }

  const vars = readEncEnv(projectRoot, envName, key);
  const dotenvPath = join(projectRoot, '.env');
  writeEnvFile(dotenvPath, vars, { envName, projectRoot });
  setCurrentEnv(projectRoot, envName);

  const count = Object.keys(vars).length;
  console.log(dim(projectRoot));
  ok(`Unpacked ${label(envName)} → .env ${dim(`(${count} variable${count !== 1 ? 's' : ''})`)}`);
}
