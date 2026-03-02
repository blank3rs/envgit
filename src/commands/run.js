import { spawn } from 'child_process';
import { requireProjectRoot, loadKey } from '../keystore.js';
import { resolveEnv } from '../config.js';
import { readEncEnv } from '../enc.js';
import { getCurrentEnv } from '../state.js';
import { fatal, dim } from '../ui.js';

export async function run(args, options) {
  if (!args || args.length === 0) {
    fatal('No command specified. Usage: envgit run [--env <name>] -- <command> [args...]');
  }

  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const envName = resolveEnv(projectRoot, options.env, getCurrentEnv(projectRoot));

  const vars = readEncEnv(projectRoot, envName, key);

  const env = { ...process.env, ...vars };

  const [cmd, ...cmdArgs] = args;

  const child = spawn(cmd, cmdArgs, {
    env,
    stdio: 'inherit',
    shell: false,
  });

  child.on('error', (err) => {
    fatal(`Failed to start command '${cmd}': ${err.message}`);
  });

  child.on('close', (code) => {
    process.exit(code ?? 0);
  });
}
