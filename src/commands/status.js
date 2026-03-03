import { existsSync } from 'fs';
import { join } from 'path';
import { requireProjectRoot, globalKeyPath } from '../keystore.js';
import { loadConfig } from '../config.js';
import { getCurrentEnv } from '../state.js';
import chalk from 'chalk';
import { bold, dim, envLabel } from '../ui.js';

export async function status() {
  const projectRoot = requireProjectRoot();
  const config      = loadConfig(projectRoot);
  const current     = getCurrentEnv(projectRoot);

  // Key source
  let keySource;
  if (process.env.ENVGIT_KEY) {
    keySource = chalk.green('ENVGIT_KEY') + dim(' (env var)');
  } else if (config.key_id) {
    const keyPath = globalKeyPath(config.key_id);
    keySource = existsSync(keyPath)
      ? chalk.green('✓ key found') + dim(` ~/.config/envgit/keys/${config.key_id.slice(0, 8)}…`)
      : chalk.red('✗ key missing') + dim(' — run: envgit join <token> --code <passphrase>');
  } else {
    const legacyPath = join(projectRoot, '.envgit.key');
    keySource = existsSync(legacyPath) ? dim('.envgit.key (legacy)') : chalk.red('✗ not found');
  }

  const dotenvExists = existsSync(join(projectRoot, '.env'));

  // Active env banner — front and center
  const activeDisplay = current
    ? envLabel(current)
    : chalk.dim('none');

  console.log('');
  console.log(`  ${bold('Active env')}   ${activeDisplay}${!current ? chalk.dim('  — run: envgit use <env>') : ''}`);
  console.log('');

  // All envs in a row, active one highlighted
  const envRow = config.envs.map(e =>
    e === current
      ? envLabel(e)
      : chalk.dim(e)
  ).join('  ');
  console.log(`  ${bold('Environments')} ${envRow}`);
  console.log(`  ${bold('Key')}          ${keySource}`);
  console.log(`  ${bold('.env')}         ${dotenvExists ? chalk.green('present') : chalk.dim('missing')}${!dotenvExists && current ? chalk.dim('  — run: envgit unpack') : ''}`);
  console.log(`  ${bold('Project')}      ${dim(projectRoot)}`);
  console.log('');
}
