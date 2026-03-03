import { execFileSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { findProjectRoot, globalKeyPath } from '../keystore.js';
import { loadConfig } from '../config.js';
import { readEncEnv } from '../enc.js';
import { ok as pass, fail, warn, bold, dim } from '../ui.js';

function section(title) { console.log(`\n${bold(title)}`); }

export async function doctor() {
  let issues = 0;

  // ── Project ───────────────────────────────────────────────────────────────
  section('Project');

  const projectRoot = findProjectRoot();
  if (!projectRoot) {
    fail('No envgit project found — run envgit init first.');
    console.log('');
    process.exit(1);
  }
  pass(`Project root: ${dim(projectRoot)}`);

  let config;
  try {
    config = loadConfig(projectRoot);
    pass(`Config loaded ${dim(`(${config.envs.length} env${config.envs.length !== 1 ? 's' : ''}: ${config.envs.join(', ')})`)}`)
  } catch (e) {
    fail(`Config unreadable — ${e.message}`);
    issues++;
  }

  // ── Key ───────────────────────────────────────────────────────────────────
  section('Key');

  let key = null;
  if (process.env.ENVGIT_KEY) {
    pass('Key loaded from ENVGIT_KEY environment variable');
    key = process.env.ENVGIT_KEY;
  } else if (config?.key_id) {
    const keyPath = globalKeyPath(config.key_id);
    if (existsSync(keyPath)) {
      pass(`Key file found ${dim(keyPath)}`);
      key = readFileSync(keyPath, 'utf8').trim();
    } else {
      fail('Key file missing — get it from a teammate: envgit join <token> --code <passphrase>');
      issues++;
    }
  } else {
    const legacyPath = join(projectRoot, '.envgit.key');
    if (existsSync(legacyPath)) {
      warn(`Legacy key file at project root ${dim('(consider migrating)')}`);
      key = readFileSync(legacyPath, 'utf8').trim();
    } else {
      fail('No key found — ask a teammate to run: envgit share');
      issues++;
    }
  }

  if (key) {
    const decoded = Buffer.from(key, 'base64');
    if (decoded.length === 32) {
      pass('Key length valid (256-bit)');
    } else {
      fail(`Key length invalid — got ${decoded.length} bytes, expected 32`);
      issues++;
    }
  }

  // ── Environments ──────────────────────────────────────────────────────────
  if (config && key) {
    section('Environments');
    for (const envName of config.envs) {
      try {
        const vars = readEncEnv(projectRoot, envName, key);
        const count = Object.keys(vars).length;
        pass(`${envName} decrypts OK ${dim(`(${count} var${count !== 1 ? 's' : ''})`)}`);
      } catch (e) {
        fail(`${envName} failed to decrypt — ${e.message}`);
        issues++;
      }
    }
  }

  // ── Git safety ────────────────────────────────────────────────────────────
  section('Git safety');

  const gitignorePath = join(projectRoot, '.gitignore');
  if (existsSync(gitignorePath)) {
    const gitignore = readFileSync(gitignorePath, 'utf8');
    const lines = gitignore.split('\n').map(l => l.trim());

    const envIgnored = lines.some(l => l === '.env' || l === '.env.*' || l === '*.env');
    if (envIgnored) {
      pass('.env is in .gitignore');
    } else {
      warn('.env is not in .gitignore — add it to prevent accidental commits');
      issues++;
    }

    if (existsSync(join(projectRoot, '.envgit.key'))) {
      const keyIgnored = lines.some(l => l === '.envgit.key');
      if (!keyIgnored) {
        fail('.envgit.key is not in .gitignore — this would expose your key!');
        issues++;
      }
    }
  } else {
    warn('No .gitignore found');
    issues++;
  }

  // Check for .env files tracked by git (no shell, no injection)
  try {
    const tracked = execFileSync('git', ['ls-files', '.env', '.env.local', '.env.production'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).toString().trim();

    if (tracked) {
      const files = tracked.split('\n').map(f => `    ${f}`).join('\n');
      fail(`Plaintext .env file tracked by git:\n${files}`);
      fail('Remove with: git rm --cached .env');
      issues++;
    } else {
      pass('No plaintext .env files tracked by git');
    }
  } catch {
    warn('Not a git repo — skipping git tracking check');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('');
  if (issues === 0) {
    console.log(chalk.green(bold('All checks passed.')));
  } else {
    console.log(chalk.red(bold(`${issues} issue${issues !== 1 ? 's' : ''} found.`)));
    process.exit(1);
  }
  console.log('');
}
