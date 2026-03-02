import { join } from 'path';
import { existsSync } from 'fs';
import { requireProjectRoot, loadKey } from '../keystore.js';
import { resolveEnv } from '../config.js';
import { writeEncEnv } from '../enc.js';
import { readEnvFile } from '../envfile.js';
import { getCurrentEnv } from '../state.js';
import { ok, fatal, label, dim } from '../ui.js';

export async function importEnv(options) {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const envName = resolveEnv(projectRoot, options.env, getCurrentEnv(projectRoot));

  const filePath = join(projectRoot, options.file);
  if (!existsSync(filePath)) {
    fatal(`File not found: ${options.file}`);
  }

  const vars = readEnvFile(filePath);
  const count = Object.keys(vars).length;

  writeEncEnv(projectRoot, envName, key, vars);
  ok(`Imported ${count} variable${count !== 1 ? 's' : ''} from ${dim(options.file)} into ${label(envName)}`);
}
