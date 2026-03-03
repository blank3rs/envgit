import { execFileSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, chmodSync, statSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import chalk from 'chalk';
import { findProjectRoot, globalKeyPath } from '../keystore.js';
import { loadConfig, saveConfig } from '../config.js';
import { bold, dim, ok, warn } from '../ui.js';

function fixed(msg) { console.log(chalk.green(`  ✦ fixed   ${msg}`)); }
function check(msg) { console.log(chalk.dim( `  ✓ ok      ${msg}`)); }
function skipped(msg) { console.log(chalk.dim(`  – skip    ${msg}`)); }

export async function fix() {
  const projectRoot = findProjectRoot();
  if (!projectRoot) {
    console.log('');
    console.log(chalk.red('  No envgit project found. Run envgit init first.'));
    console.log('');
    process.exit(1);
  }

  let fixes = 0;
  console.log('');
  console.log(bold('Running envgit fix...'));
  console.log('');

  // ── 1. Ensure .envgit dir and state file exist ────────────────────────────
  const envgitDir  = join(projectRoot, '.envgit');
  const currentFile = join(envgitDir, '.current');
  mkdirSync(envgitDir, { recursive: true });
  if (!existsSync(currentFile)) {
    writeFileSync(currentFile, '', 'utf8');
    fixed('.envgit/.current state file created');
    fixes++;
  } else {
    check('.envgit/.current exists');
  }

  // ── 2. Config migration — add missing fields introduced in newer versions ──
  let config;
  try {
    config = loadConfig(projectRoot);
    let configChanged = false;

    // v0.2+: default_env field
    if (!config.default_env) {
      config.default_env = config.envs?.[0] ?? 'dev';
      configChanged = true;
    }

    // v0.3+: project name field
    if (!config.project) {
      config.project = basename(projectRoot);
      configChanged = true;
    }

    if (configChanged) {
      saveConfig(projectRoot, config);
      fixed('config.yml migrated to latest schema');
      fixes++;
    } else {
      check('config.yml schema is current');
    }
  } catch {
    warn('Could not load config — skipping migration (run envgit init first)');
  }

  // ── 3. Key file permissions ───────────────────────────────────────────────
  if (config?.key_id) {
    const keyPath = globalKeyPath(config.key_id);
    if (existsSync(keyPath)) {
      const mode = statSync(keyPath).mode & 0o777;
      if (mode & 0o077) {
        chmodSync(keyPath, 0o600);
        fixed(`key file permissions set to 600`);
        fixes++;
      } else {
        check('key file permissions are 600');
      }
    } else {
      skipped('key file not on this machine (normal for fresh clones)');
    }
  }

  // ── 4. .gitignore — ensure .env and .envgit.key are ignored ──────────────
  const gitignorePath = join(projectRoot, '.gitignore');
  let gitignore = existsSync(gitignorePath) ? readFileSync(gitignorePath, 'utf8') : '';
  const lines   = gitignore.split('\n').map(l => l.trim());
  const missing = [];

  if (!lines.some(l => l === '.env' || l === '.env.*')) missing.push('.env');
  if (!lines.some(l => l === '.envgit.key'))            missing.push('.envgit.key');

  if (missing.length > 0) {
    gitignore = gitignore.trimEnd() + '\n\n# envgit\n' + missing.join('\n') + '\n';
    writeFileSync(gitignorePath, gitignore, 'utf8');
    fixed(`.gitignore — added: ${missing.join(', ')}`);
    fixes++;
  } else {
    check('.gitignore has .env and .envgit.key');
  }

  // ── 5. Remove .env from git tracking if accidentally staged ──────────────
  try {
    const tracked = execFileSync('git', ['ls-files', '.env'], {
      cwd: projectRoot, stdio: ['pipe', 'pipe', 'pipe'],
    }).toString().trim();

    if (tracked) {
      execFileSync('git', ['rm', '--cached', '.env'], {
        cwd: projectRoot, stdio: ['pipe', 'pipe', 'pipe'],
      });
      fixed('.env removed from git tracking (file kept on disk)');
      fixes++;
    } else {
      check('.env is not tracked by git');
    }
  } catch {
    skipped('not a git repo — skipping git tracking check');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('');
  if (fixes === 0) {
    console.log(chalk.green(bold('  Everything looks good. Nothing to fix.')));
  } else {
    console.log(chalk.green(bold(`  Applied ${fixes} fix${fixes !== 1 ? 'es' : ''}. Run envgit doctor to verify.`)));
  }
  console.log('');
}
