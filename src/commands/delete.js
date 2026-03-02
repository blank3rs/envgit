import { requireProjectRoot, loadKey } from '../keystore.js';
import { resolveEnv } from '../config.js';
import { readEncEnv, writeEncEnv } from '../enc.js';
import { getCurrentEnv } from '../state.js';
import { ok, fatal, label } from '../ui.js';

export async function deleteKey(keyName, options) {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const envName = resolveEnv(projectRoot, options.env, getCurrentEnv(projectRoot));

  const vars = readEncEnv(projectRoot, envName, key);

  if (!(keyName in vars)) {
    fatal(`Key '${keyName}' not found in ${label(envName)}`);
  }

  delete vars[keyName];
  writeEncEnv(projectRoot, envName, key, vars);
  ok(`Deleted ${keyName} from ${label(envName)}`);
}
