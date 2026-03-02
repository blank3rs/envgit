import { existsSync } from 'fs';
import { join } from 'path';
import { requireProjectRoot, globalKeyPath } from '../keystore.js';
import { loadConfig } from '../config.js';
import { getCurrentEnv } from '../state.js';
import chalk from 'chalk';
import { bold, label, dim } from '../ui.js';

export async function status() {
  const projectRoot = requireProjectRoot();
  const config = loadConfig(projectRoot);
  const current = getCurrentEnv(projectRoot);

  let keySource;
  if (process.env.ENVGIT_KEY) {
    keySource = chalk.green('ENVGIT_KEY') + dim(' (env var)');
  } else if (config.key_id) {
    const keyPath = globalKeyPath(config.key_id);
    keySource = existsSync(keyPath)
      ? chalk.green('~/.config/envgit/keys/') + dim(config.key_id.slice(0, 8) + '…')
      : chalk.red('not found on this machine') + dim(' — run: envgit keygen --set <key>');
  } else {
    // Legacy
    const legacyPath = join(projectRoot, '.envgit.key');
    keySource = existsSync(legacyPath) ? dim('.envgit.key (legacy)') : chalk.red('(not found)');
  }

  const dotenvExists = existsSync(join(projectRoot, '.env'));

  console.log('');
  console.log(`${bold('Project:')}  ${dim(projectRoot)}`);
  console.log(`${bold('Envs:')}     ${config.envs.map((e) => (e === current ? chalk.cyan(e) : e)).join(', ')}`);
  console.log(`${bold('Default:')}  ${config.default_env}`);
  console.log(`${bold('Active:')}   ${current ? label(current) : dim('(none — run envgit unpack <env>)')}`);
  console.log(`${bold('Key:')}      ${keySource}`);
  console.log(`${bold('.env:')}     ${dotenvExists ? chalk.green('present') : chalk.yellow('missing')}`);
  console.log('');
}
