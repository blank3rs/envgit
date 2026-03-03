import { requireProjectRoot, loadKey } from '../keystore.js';
import { resolveEnv } from '../config.js';
import { readEncEnv, writeEncEnv } from '../enc.js';
import { getCurrentEnv } from '../state.js';
import { ok, fatal, label, envLabel } from '../ui.js';
import { pickKey, promptConfirm } from '../interactive.js';

export async function deleteKey(keyName, options) {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const envName = resolveEnv(projectRoot, options.env, getCurrentEnv(projectRoot));

  const vars = readEncEnv(projectRoot, envName, key);

  const name = keyName ?? await pickKey(vars, `Key to delete from [${envName}]`);

  if (!(name in vars)) fatal(`Key '${name}' not found in ${envLabel(envName)}`);

  if (!keyName) {
    const confirmed = await promptConfirm(`Delete ${name} from [${envName}]?`);
    if (!confirmed) { process.exit(0); }
  }

  delete vars[name];
  writeEncEnv(projectRoot, envName, key, vars);
  ok(`Deleted ${name} from ${envLabel(envName)}`);
}
