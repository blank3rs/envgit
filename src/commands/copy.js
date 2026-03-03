import { requireProjectRoot, loadKey } from '../keystore.js';
import { loadConfig } from '../config.js';
import { readEncEnv, writeEncEnv } from '../enc.js';
import { ok, fatal, label, envLabel } from '../ui.js';
import { pickKey, pickEnv } from '../interactive.js';

export async function copy(keyName, options) {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const config = loadConfig(projectRoot);

  const from = options.from ?? await pickEnv(config.envs, 'Copy from environment');
  const to   = options.to   ?? await pickEnv(config.envs.filter(e => e !== from), 'Copy to environment');

  const srcVars = readEncEnv(projectRoot, from, key);

  const name = keyName ?? await pickKey(srcVars, `Key to copy from [${from}]`);

  if (!(name in srcVars)) fatal(`Key '${name}' not found in ${envLabel(from)}`);

  const dstVars = readEncEnv(projectRoot, to, key);
  dstVars[name] = srcVars[name];
  writeEncEnv(projectRoot, to, key, dstVars);

  ok(`Copied ${name} from ${envLabel(from)} → ${envLabel(to)}`);
}
