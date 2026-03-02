import chalk from 'chalk';
import { requireProjectRoot, loadKey } from '../keystore.js';
import { loadConfig } from '../config.js';
import { readEncEnv } from '../enc.js';
import { getCurrentEnv } from '../state.js';
import { fatal, label, dim } from '../ui.js';

export async function diff(env1Arg, env2Arg, options) {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const config = loadConfig(projectRoot);
  const current = getCurrentEnv(projectRoot);

  let env1, env2;
  if (env1Arg && env2Arg) {
    env1 = env1Arg;
    env2 = env2Arg;
  } else if (env1Arg) {
    env1 = current || config.default_env;
    env2 = env1Arg;
  } else {
    if (config.envs.length < 2) {
      fatal('Need at least 2 environments to diff. Pass two env names.');
    }
    [env1, env2] = config.envs;
  }

  if (!config.envs.includes(env1)) fatal(`Environment '${env1}' does not exist.`);
  if (!config.envs.includes(env2)) fatal(`Environment '${env2}' does not exist.`);

  const vars1 = readEncEnv(projectRoot, env1, key);
  const vars2 = readEncEnv(projectRoot, env2, key);

  const allKeys = new Set([...Object.keys(vars1), ...Object.keys(vars2)]);

  const onlyIn1 = [];
  const onlyIn2 = [];
  const changed = [];
  let identical = 0;

  for (const k of allKeys) {
    const inEnv1 = k in vars1;
    const inEnv2 = k in vars2;
    if (inEnv1 && !inEnv2) {
      onlyIn1.push(k);
    } else if (!inEnv1 && inEnv2) {
      onlyIn2.push(k);
    } else if (vars1[k] !== vars2[k]) {
      changed.push(k);
    } else {
      identical++;
    }
  }

  console.log(`\nDiff ${label(env1)} ↔ ${label(env2)}\n`);

  if (onlyIn1.length === 0 && onlyIn2.length === 0 && changed.length === 0) {
    console.log(dim(`  Environments are identical (${identical} var${identical !== 1 ? 's' : ''})`));
    console.log('');
    return;
  }

  for (const k of onlyIn1) {
    const suffix = options.showValues ? ` = ${vars1[k]}` : '';
    console.log(chalk.red(`  - ${k}${suffix}`) + dim(` (only in ${env1})`));
  }

  for (const k of onlyIn2) {
    const suffix = options.showValues ? ` = ${vars2[k]}` : '';
    console.log(chalk.green(`  + ${k}${suffix}`) + dim(` (only in ${env2})`));
  }

  for (const k of changed) {
    if (options.showValues) {
      console.log(chalk.yellow(`  ~ ${k}`) + dim(` (changed)`));
      console.log(chalk.dim(`      ${env1}: ${vars1[k]}`));
      console.log(chalk.dim(`      ${env2}: ${vars2[k]}`));
    } else {
      console.log(chalk.yellow(`  ~ ${k}`) + dim(` (changed)`));
    }
  }

  if (identical > 0) {
    console.log(dim(`\n  ${identical} key${identical !== 1 ? 's' : ''} identical`));
  }
  console.log('');
}
