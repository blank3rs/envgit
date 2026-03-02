import { requireProjectRoot, loadKey } from '../keystore.js';
import { resolveEnv } from '../config.js';
import { readEncEnv, writeEncEnv } from '../enc.js';
import { getCurrentEnv } from '../state.js';
import { ok, fatal, label } from '../ui.js';

export async function renameKey(oldName, newName, options) {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const envName = resolveEnv(projectRoot, options.env, getCurrentEnv(projectRoot));

  const vars = readEncEnv(projectRoot, envName, key);

  if (!(oldName in vars)) {
    fatal(`Key '${oldName}' not found in ${label(envName)}`);
  }

  if (newName in vars) {
    fatal(`Key '${newName}' already exists in ${label(envName)}`);
  }

  const ordered = {};
  for (const [k, v] of Object.entries(vars)) {
    ordered[k === oldName ? newName : k] = v;
  }

  writeEncEnv(projectRoot, envName, key, ordered);
  ok(`Renamed ${oldName} → ${newName} in ${label(envName)}`);
}
