#!/usr/bin/env node
import { createRequire } from 'module';
import { program } from 'commander';
import { init }      from '../src/commands/init.js';
import { set }       from '../src/commands/set.js';
import { get }       from '../src/commands/get.js';
import { unpack }    from '../src/commands/unpack.js';
import { list }      from '../src/commands/list.js';
import { importEnv } from '../src/commands/import.js';
import { addEnv }    from '../src/commands/add-env.js';
import { status }    from '../src/commands/status.js';
import { deleteKey } from '../src/commands/delete.js';
import { copy }      from '../src/commands/copy.js';
import { renameKey } from '../src/commands/rename-key.js';
import { diff }      from '../src/commands/diff.js';
import { run }       from '../src/commands/run.js';
import { envs }      from '../src/commands/envs.js';
import { exportEnv } from '../src/commands/export.js';
import { verify }    from '../src/commands/verify.js';
import { rotateKey } from '../src/commands/rotate-key.js';
import { share }     from '../src/commands/share.js';
import { join }      from '../src/commands/join.js';
import { doctor }    from '../src/commands/doctor.js';
import { audit }     from '../src/commands/audit.js';
import { template }  from '../src/commands/template.js';
import { scan }      from '../src/commands/scan.js';
import { use }       from '../src/commands/use.js';
import { fix }       from '../src/commands/fix.js';

const { version } = createRequire(import.meta.url)('../package.json');

program
  .name('envgit')
  .description('Encrypted per-project environment variable manager')
  .version(version)
  .enablePositionalOptions();

// ── Setup ────────────────────────────────────────────────────────────────────

program
  .command('init')
  .description('Initialize envgit in the current project')
  .option('--env <name>', 'default environment name', 'dev')
  .action(init);

program
  .command('fix')
  .description('Fix everything after an upgrade — .gitignore, permissions, config migration')
  .action(fix);

// ── Environments ──────────────────────────────────────────────────────────────

program
  .command('use [env]')
  .description('Switch active environment — omit to pick interactively')
  .action(use);

program
  .command('envs')
  .description('List all environments with variable counts')
  .action(envs);

program
  .command('add-env <name>')
  .alias('new')
  .description('Create a new environment')
  .action(addEnv);

program
  .command('unpack [env]')
  .alias('pull')
  .description('Write .env for the active env — or specify one explicitly')
  .action(unpack);

program
  .command('diff [env1] [env2]')
  .description('Show differences between two environments')
  .option('--show-values', 'reveal values in diff output')
  .action(diff);

// ── Variables ─────────────────────────────────────────────────────────────────

program
  .command('set [assignments...]')
  .description('Set KEY=VALUE — omit args to pick interactively')
  .option('--env <name>', 'target environment')
  .option('-f, --file <path>', 'import from a .env file')
  .action(set);

program
  .command('get [key]')
  .description('Print a value — omit key to pick interactively')
  .option('--env <name>', 'target environment')
  .action(get);

program
  .command('delete [key]')
  .description('Remove a key — omit to pick interactively')
  .option('--env <name>', 'target environment')
  .action(deleteKey);

program
  .command('rename [old-key] [new-key]')
  .description('Rename a key — omit args to pick interactively')
  .option('--env <name>', 'target environment')
  .action(renameKey);

program
  .command('copy [key]')
  .description('Copy a key between environments — omit args to pick interactively')
  .option('--from <env>', 'source environment')
  .option('--to <env>',   'destination environment')
  .action(copy);

program
  .command('list')
  .description('List all keys in the active environment')
  .option('--env <name>', 'target environment')
  .option('--show-values', 'print values alongside keys')
  .action(list);

program
  .command('import')
  .description('Encrypt an existing .env file into an environment')
  .option('--env <name>', 'target environment')
  .option('--file <path>', 'source file', '.env')
  .action(importEnv);

// ── Key management ───────────────────────────────────────────────────────────

program
  .command('share')
  .description('Upload encrypted key as a one-time link to send to a teammate')
  .action(share);

program
  .command('join <blob>')
  .description('Save a key from envgit share output')
  .requiredOption('--code <passphrase>', 'passphrase from the share output')
  .action(join);

program
  .command('rotate-key')
  .description('Generate a new key and re-encrypt all environments')
  .action(rotateKey);

// ── Export & run ─────────────────────────────────────────────────────────────

program
  .command('export')
  .description('Print decrypted vars to stdout')
  .option('--env <name>', 'target environment')
  .option('--format <fmt>', 'dotenv | json | shell', 'dotenv')
  .action(exportEnv);

program
  .command('run [args...]')
  .description('Run a command with decrypted env vars injected — nothing written to disk')
  .option('--env <name>', 'environment to use')
  .allowUnknownOption()
  .passThroughOptions()
  .action(run);

// ── Health & safety ──────────────────────────────────────────────────────────

program
  .command('status')
  .description('Show active environment, key status, and project info')
  .action(status);

program
  .command('doctor')
  .description('Check project health — key, envs, git safety')
  .action(doctor);

program
  .command('audit')
  .description('Show which keys are missing across environments')
  .action(audit);

program
  .command('verify')
  .description('Confirm all environments decrypt correctly with the current key')
  .action(verify);

program
  .command('scan')
  .description('Scan codebase for hardcoded secrets')
  .action(scan);

program
  .command('template')
  .description('Generate a .env.example with all keys, no values')
  .option('-o, --output <path>', 'output path', '.env.example')
  .option('-f, --force', 'overwrite existing file')
  .action(template);

program.parse();
