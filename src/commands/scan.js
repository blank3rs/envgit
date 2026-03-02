import { readdirSync, readFileSync } from 'fs';
import { join, relative, extname } from 'path';
import chalk from 'chalk';
import { findProjectRoot } from '../keystore.js';
import { bold, dim, ok } from '../ui.js';

// ── Known secret patterns ─────────────────────────────────────────────────────

const PATTERNS = [
  { name: 'AWS Access Key ID',      regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Stripe Secret Key',      regex: /\bsk_live_[0-9a-zA-Z]{24,}\b/ },
  { name: 'Stripe Restricted Key',  regex: /\brk_live_[0-9a-zA-Z]{24,}\b/ },
  { name: 'GitHub Token',           regex: /\bghp_[0-9a-zA-Z]{36}\b/ },
  { name: 'GitHub OAuth Token',     regex: /\bgho_[0-9a-zA-Z]{36}\b/ },
  { name: 'GitHub App Token',       regex: /\bghs_[0-9a-zA-Z]{36}\b/ },
  { name: 'GitHub PAT',             regex: /\bgithub_pat_[0-9a-zA-Z_]{82}\b/ },
  { name: 'OpenAI API Key',         regex: /\bsk-[a-zA-Z0-9]{48}\b/ },
  { name: 'OpenAI Project Key',     regex: /\bsk-proj-[0-9a-zA-Z_-]{48,}\b/ },
  { name: 'Anthropic API Key',      regex: /\bsk-ant-[0-9a-zA-Z_-]{80,}\b/ },
  { name: 'Slack Bot Token',        regex: /\bxoxb-[0-9]{10,13}-[0-9]{10,13}-[0-9a-zA-Z]{24}\b/ },
  { name: 'Slack User Token',       regex: /\bxoxp-[0-9]{10,13}-[0-9]{10,13}-[0-9a-zA-Z]{24}\b/ },
  { name: 'SendGrid API Key',       regex: /\bSG\.[0-9a-zA-Z_-]{22}\.[0-9a-zA-Z_-]{43}\b/ },
  { name: 'Twilio API Key',         regex: /\bSK[0-9a-fA-F]{32}\b/ },
  { name: 'Private Key Block',      regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'Hardcoded secret',       regex: /(?:secret|password|passwd|api_?key|auth_?token)\s*[:=]\s*["']([^"'$`{]{8,})["']/i },
];

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.envgit', 'dist', 'build', 'out',
  '.next', '.nuxt', 'coverage', '.nyc_output', 'vendor', '.turbo',
]);

const SKIP_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp4', '.mp3', '.wav', '.pdf',
  '.zip', '.tar', '.gz', '.tgz',
  '.map', '.lock', '.snap',
]);

const SKIP_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  '.env.example', '.env.sample', '.env.template',
]);

// ── Shannon entropy ───────────────────────────────────────────────────────────

function entropy(str) {
  const freq = {};
  for (const c of str) freq[c] = (freq[c] ?? 0) + 1;
  return Object.values(freq).reduce((h, n) => {
    const p = n / str.length;
    return h - p * Math.log2(p);
  }, 0);
}

const HIGH_ENTROPY_PATTERN = /(?:key|token|secret|password|credential|auth|api)\s*[:=]\s*["']([A-Za-z0-9+/=_\-]{20,})["']/gi;
const ENTROPY_THRESHOLD = 4.0;

// ── File walker ───────────────────────────────────────────────────────────────

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      if (SKIP_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;
      if (SKIP_FILES.has(entry.name)) continue;
      yield full;
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

export async function scan() {
  const projectRoot = findProjectRoot() ?? process.cwd();
  const findings = [];

  for (const filePath of walk(projectRoot)) {
    let content;
    try { content = readFileSync(filePath, 'utf8'); }
    catch { continue; }

    const relPath = relative(projectRoot, filePath);
    const lines   = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line    = lines[i];
      const lineNum = i + 1;

      // Known pattern matching
      for (const { name, regex } of PATTERNS) {
        if (regex.test(line)) {
          findings.push({ file: relPath, line: lineNum, type: name, snippet: line.trim(), how: 'pattern' });
          break;
        }
      }

      // Entropy analysis — catches secrets no pattern knows about
      const alreadyCaught = () => findings.some(f => f.file === relPath && f.line === lineNum);
      let match;
      HIGH_ENTROPY_PATTERN.lastIndex = 0;
      while ((match = HIGH_ENTROPY_PATTERN.exec(line)) !== null) {
        if (entropy(match[1]) >= ENTROPY_THRESHOLD && !alreadyCaught()) {
          findings.push({ file: relPath, line: lineNum, type: 'High-entropy secret', snippet: line.trim(), how: 'entropy' });
        }
      }
    }
  }

  // ── Output ────────────────────────────────────────────────────────────────
  console.log('');

  if (findings.length === 0) {
    ok('No hardcoded secrets detected.');
    console.log(dim(`  Scanned: ${projectRoot}`));
    console.log('');
    return;
  }

  console.log(chalk.red(bold(`  ${findings.length} potential secret${findings.length !== 1 ? 's' : ''} found\n`)));

  const byFile = {};
  for (const f of findings) (byFile[f.file] ??= []).push(f);

  for (const [file, hits] of Object.entries(byFile)) {
    console.log(chalk.cyan(`  ${file}`));
    for (const hit of hits) {
      const tag     = hit.how === 'entropy' ? chalk.yellow('[entropy]') : chalk.red(`[${hit.type}]`);
      const snippet = hit.snippet.length > 80 ? hit.snippet.slice(0, 77) + '...' : hit.snippet;
      console.log(`    ${dim(`line ${String(hit.line).padEnd(4)}`)} ${tag}`);
      console.log(`    ${dim(snippet)}`);
    }
    console.log('');
  }

  console.log(chalk.yellow(bold('  What to do:')));
  console.log(dim('  1. Move these values into envgit:  envgit set KEY=value'));
  console.log(dim('  2. Replace hardcoded values with:  process.env.KEY'));
  console.log(dim('  3. Rotate any secrets already in git history'));
  console.log('');

  process.exit(1);
}
