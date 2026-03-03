import { requireProjectRoot, loadKey } from '../keystore.js';
import { resolveEnv } from '../config.js';
import { readEncEnv, writeEncEnv } from '../enc.js';
import { getCurrentEnv } from '../state.js';
import { ok, fatal, label, envLabel } from '../ui.js';
import { pickKey, promptInput } from '../interactive.js';

export async function renameKey(oldName, newName, options) {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const envName = resolveEnv(projectRoot, options.env, getCurrentEnv(projectRoot));

  const vars = readEncEnv(projectRoot, envName, key);

  const from = oldName ?? await pickKey(vars, `Key to rename in [${envName}]`);
  const to   = newName ?? await promptInput(`New name for ${from}`);

  if (!(from in vars)) fatal(`Key '${from}' not found in ${envLabel(envName)}`);
  if (to in vars)      fatal(`Key '${to}' already exists in ${envLabel(envName)}`);

  const ordered = {};
  for (const [k, v] of Object.entries(vars)) {
    ordered[k === from ? to : k] = v;
  }

  writeEncEnv(projectRoot, envName, key, ordered);
  ok(`Renamed ${from} → ${to} in ${envLabel(envName)}`);
}
