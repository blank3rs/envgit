import { requireProjectRoot, loadKey } from '../keystore.js';
import { resolveEnv } from '../config.js';
import { readEncEnv } from '../enc.js';
import { getCurrentEnv } from '../state.js';
import { fatal, label } from '../ui.js';

export async function get(key, options) {
  const projectRoot = requireProjectRoot();
  const encKey = loadKey(projectRoot);
  const envName = resolveEnv(projectRoot, options.env, getCurrentEnv(projectRoot));

  const vars = readEncEnv(projectRoot, envName, encKey);

  if (!(key in vars)) {
    fatal(`Key '${key}' not found in ${label(envName)}`);
  }

  console.log(vars[key]);
}
