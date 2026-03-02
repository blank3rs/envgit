import { readFileSync, writeFileSync, chmodSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { loadConfig } from './config.js';

const ENV_VAR = 'ENVGIT_KEY';
const SECURE_MODE = 0o600;

function globalKeysDir() {
  return join(homedir(), '.config', 'envgit', 'keys');
}

export function globalKeyPath(keyId) {
  return join(globalKeysDir(), `${keyId}.key`);
}

export function findProjectRoot(startDir = process.cwd()) {
  let dir = startDir;
  while (true) {
    if (existsSync(join(dir, '.envgit'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function requireProjectRoot() {
  const root = findProjectRoot();
  if (!root) {
    console.error("Error: No envgit project found. Run 'envgit init' first.");
    process.exit(1);
  }
  return root;
}

export function loadKey(projectRoot) {
  if (process.env[ENV_VAR]) return process.env[ENV_VAR];

  const config = loadConfig(projectRoot);

  if (config.key_id) {
    const keyPath = globalKeyPath(config.key_id);
    if (existsSync(keyPath)) {
      enforcePermissions(keyPath);
      return readFileSync(keyPath, 'utf8').trim();
    }
    // Project found, but this machine doesn't have the key yet
    console.error(
      `No key found for this project. Ask your team for the key, then run:\n  envgit keygen --set <key>`
    );
    process.exit(1);
  }

  // Legacy fallback: .envgit.key in project root
  const legacyPath = join(projectRoot, '.envgit.key');
  if (existsSync(legacyPath)) {
    enforcePermissions(legacyPath);
    return readFileSync(legacyPath, 'utf8').trim();
  }

  console.error(
    `No key found for this project. Ask your team for the key, then run:\n  envgit keygen --set <key>`
  );
  process.exit(1);
}

export function saveKey(projectRoot, key, keyId) {
  const dir = globalKeysDir();
  mkdirSync(dir, { recursive: true, mode: 0o700 });

  const id = keyId ?? loadConfig(projectRoot).key_id;
  const keyPath = globalKeyPath(id);
  writeFileSync(keyPath, key + '\n', { mode: SECURE_MODE });
  chmodSync(keyPath, SECURE_MODE);
  return keyPath;
}

function enforcePermissions(keyPath) {
  const stat = statSync(keyPath);
  const mode = stat.mode & 0o777;
  if (mode & 0o077) {
    console.error(
      `Error: key file has insecure permissions (${mode.toString(8)}). Run: chmod 600 ${keyPath}`
    );
    process.exit(1);
  }
}
