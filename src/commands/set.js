import { join } from 'path';
import { existsSync } from 'fs';
import { requireProjectRoot, loadKey } from '../keystore.js';
import { resolveEnv } from '../config.js';
import { readEncEnv, writeEncEnv } from '../enc.js';
import { readEnvFile } from '../envfile.js';
import { getCurrentEnv } from '../state.js';
import { ok, fatal, label } from '../ui.js';

export async function set(assignments, options) {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const envName = resolveEnv(projectRoot, options.env, getCurrentEnv(projectRoot));

  const vars = readEncEnv(projectRoot, envName, key);

  if (options.file) {
    const filePath = join(projectRoot, options.file);
    if (!existsSync(filePath)) {
      fatal(`File not found: ${options.file}`);
    }
    const fileVars = readEnvFile(filePath);
    const entries = Object.entries(fileVars);
    if (entries.length === 0) {
      fatal(`No variables found in ${options.file}`);
    }
    for (const [k, v] of entries) {
      vars[k] = v;
      ok(`Set ${k} in ${label(envName)}`);
    }
  } else {
    for (const assignment of assignments) {
      const eqIdx = assignment.indexOf('=');
      if (eqIdx === -1) {
        fatal(`Invalid assignment '${assignment}'. Expected KEY=VALUE format.`);
      }
      const k = assignment.slice(0, eqIdx).trim();
      const v = assignment.slice(eqIdx + 1);
      vars[k] = v;
      ok(`Set ${k} in ${label(envName)}`);
    }
  }

  writeEncEnv(projectRoot, envName, key, vars);
}
