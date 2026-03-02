import { requireProjectRoot, loadKey } from '../keystore.js';
import { loadConfig, saveConfig } from '../config.js';
import { writeEncEnv } from '../enc.js';
import { ok, fatal } from '../ui.js';

export async function addEnv(name) {
  const projectRoot = requireProjectRoot();
  const key = loadKey(projectRoot);
  const config = loadConfig(projectRoot);

  if (config.envs.includes(name)) {
    fatal(`Environment '${name}' already exists.`);
  }

  config.envs.push(name);
  saveConfig(projectRoot, config);
  writeEncEnv(projectRoot, name, key, {});

  ok(`Added environment '${name}'`);
}
