import { requireProjectRoot, loadKey } from '../keystore.js';
import { resolveEnv } from '../config.js';
import { readEncEnv } from '../enc.js';
import { getCurrentEnv } from '../state.js';
import { fatal, label, envLabel } from '../ui.js';
import { pickKey } from '../interactive.js';

export async function get(key, options) {
  const projectRoot = requireProjectRoot();
  const encKey = loadKey(projectRoot);
  const envName = resolveEnv(projectRoot, options.env, getCurrentEnv(projectRoot));

  const vars = readEncEnv(projectRoot, envName, encKey);

  const keyName = key ?? await pickKey(vars, `Key to get from [${envName}]`);

  if (!(keyName in vars)) fatal(`Key '${keyName}' not found in ${envLabel(envName)}`);

  console.log(vars[keyName]);
}
