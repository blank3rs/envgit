import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const ENVCTL_DIR = '.envgit';
const CONFIG_NAME = 'config.yml';

export function getEnvctlDir(projectRoot) {
  return join(projectRoot, ENVCTL_DIR);
}

export function loadConfig(projectRoot) {
  const configPath = join(projectRoot, ENVCTL_DIR, CONFIG_NAME);
  if (!existsSync(configPath)) {
    throw new Error("No envgit config found. Run 'envgit init' first.");
  }
  return yaml.load(readFileSync(configPath, 'utf8'));
}

export function saveConfig(projectRoot, config) {
  const dir = getEnvctlDir(projectRoot);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, CONFIG_NAME), yaml.dump(config), 'utf8');
}

export function getEncPath(projectRoot, envName) {
  return join(projectRoot, ENVCTL_DIR, `${envName}.enc`);
}

export function resolveEnv(projectRoot, envOption, currentEnv) {
  if (envOption) return envOption;
  if (currentEnv) return currentEnv;
  const config = loadConfig(projectRoot);
  return config.default_env || 'dev';
}
