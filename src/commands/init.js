import { existsSync, mkdirSync, appendFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { generateKey } from '../crypto.js';
import { saveKey, globalKeyPath } from '../keystore.js';
import { saveConfig, getEnvctlDir } from '../config.js';
import { writeEncEnv } from '../enc.js';
import { ok, fatal, bold, dim, label } from '../ui.js';

export async function init(options) {
  const projectRoot = process.cwd();
  const envgitDir = getEnvctlDir(projectRoot);

  if (existsSync(envgitDir)) {
    fatal('envgit is already initialized in this directory.');
  }

  const defaultEnv = options.env;
  const keyId = randomUUID();

  mkdirSync(envgitDir, { recursive: true });

  // Save config first (saveKey needs key_id from config)
  saveConfig(projectRoot, {
    version: 1,
    default_env: defaultEnv,
    envs: [defaultEnv],
    key_id: keyId,
  });

  const key = generateKey();
  const keyPath = saveKey(projectRoot, key, keyId);

  writeEncEnv(projectRoot, defaultEnv, key, {});

  updateGitignore(projectRoot);

  console.log('');
  console.log(bold('envgit initialized'));
  console.log('');
  ok(`Default environment: ${label(defaultEnv)}`);
  ok(`Key stored at ${dim(keyPath)}`);
  console.log('');
  console.log(dim('Commit .envgit/ to share encrypted environments with your team.'));
  console.log(dim('Your key never touches the repo — it lives only on your machine.'));
  console.log('');
  console.log(`Share your key with teammates:  ${bold('envgit share')}`);
  console.log(`Teammates receive it with:      ${bold('envgit join <token> --code <passphrase>')}`);
  console.log('');
}

function updateGitignore(projectRoot) {
  const gitignorePath = join(projectRoot, '.gitignore');
  const entries = ['.env'];

  let existing = '';
  if (existsSync(gitignorePath)) {
    existing = readFileSync(gitignorePath, 'utf8');
  }

  const toAdd = entries.filter((e) => !existing.split('\n').includes(e));
  if (toAdd.length > 0) {
    const prefix = existing && !existing.endsWith('\n') ? '\n' : '';
    appendFileSync(gitignorePath, prefix + toAdd.join('\n') + '\n');
  }
}
