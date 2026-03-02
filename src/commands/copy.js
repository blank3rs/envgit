import { requireProjectRoot, loadKey } from '../keystore.js';
import { readEncEnv, writeEncEnv } from '../enc.js';
import { ok, fatal, label } from '../ui.js';

export async function copy(keyName, options) {
  if (!options.from || !options.to) {
    fatal('Both --from and --to environments are required.');
  }

  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);

  const srcVars = readEncEnv(projectRoot, options.from, key);

  if (!(keyName in srcVars)) {
    fatal(`Key '${keyName}' not found in ${label(options.from)}`);
  }

  const dstVars = readEncEnv(projectRoot, options.to, key);
  dstVars[keyName] = srcVars[keyName];
  writeEncEnv(projectRoot, options.to, key, dstVars);

  ok(`Copied ${keyName} from ${label(options.from)} → ${label(options.to)}`);
}
