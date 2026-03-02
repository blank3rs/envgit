import { requireProjectRoot, loadKey } from '../keystore.js';
import { loadConfig, getEncPath } from '../config.js';
import { readEncEnv } from '../enc.js';
import { ok, fail, bold, dim } from '../ui.js';

export async function verify() {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const config = loadConfig(projectRoot);

  console.log('');
  console.log(bold('Verifying all environments...'));
  console.log('');

  let allOk = true;
  for (const envName of config.envs) {
    try {
      const vars = readEncEnv(projectRoot, envName, key);
      const count = Object.keys(vars).length;
      ok(`${envName} ${dim(`(${count} var${count !== 1 ? 's' : ''})`)}`);
    } catch (e) {
      fail(`${envName} — ${e.message}`);
      allOk = false;
    }
  }

  console.log('');
  if (allOk) {
    ok('All environments verified successfully.');
  } else {
    fail('Some environments failed to decrypt. Check your key.');
    process.exit(1);
  }
  console.log('');
}
