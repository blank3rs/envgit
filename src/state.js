import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CURRENT_FILE = '.envgit/.current';

export function getCurrentEnv(projectRoot) {
  const path = join(projectRoot, CURRENT_FILE);
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf8').trim() || null;
}

export function setCurrentEnv(projectRoot, envName) {
  writeFileSync(join(projectRoot, CURRENT_FILE), envName + '\n', 'utf8');
}
