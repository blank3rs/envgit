import { search, input, password, confirm } from '@inquirer/prompts';

// Fuzzy match — returns true if all chars of query appear in order in str
function fuzzy(str, query) {
  if (!query) return true;
  let si = 0;
  const s = str.toLowerCase();
  const q = query.toLowerCase();
  for (let i = 0; i < q.length; i++) {
    si = s.indexOf(q[i], si);
    if (si === -1) return false;
    si++;
  }
  return true;
}

/**
 * Interactive fuzzy key picker.
 * @param {Record<string,string>} vars  — existing key/value pairs
 * @param {string} message
 * @param {{ allowNew?: boolean }} opts
 * @returns {Promise<string>} chosen key name
 */
export async function pickKey(vars, message = 'Select a key', { allowNew = false } = {}) {
  const keys = Object.keys(vars).sort();

  return search({
    message,
    source(term) {
      const matches = keys.filter(k => fuzzy(k, term));
      const choices = matches.map(k => ({ name: k, value: k }));

      // If the typed term isn't an exact match and allowNew is set, offer to create it
      if (allowNew && term && !keys.includes(term)) {
        choices.unshift({ name: `+ create "${term}"`, value: term });
      }

      return choices;
    },
  });
}

/**
 * Interactive fuzzy environment picker.
 * @param {string[]} envs
 * @param {string} message
 * @returns {Promise<string>} chosen env name
 */
export async function pickEnv(envs, message = 'Select an environment') {
  return search({
    message,
    source(term) {
      return envs
        .filter(e => fuzzy(e, term))
        .map(e => ({ name: e, value: e }));
    },
  });
}

/**
 * Prompt for a secret value (masked by default).
 */
export async function promptValue(keyName, existing) {
  const msg = existing !== undefined
    ? `New value for ${keyName} (current: ${'*'.repeat(Math.min(existing.length, 8))})`
    : `Value for ${keyName}`;

  return password({ message: msg, mask: false });
}

/**
 * Prompt for a plain (visible) string.
 */
export async function promptInput(message, defaultValue) {
  return input({ message, default: defaultValue });
}

/**
 * Prompt for confirmation.
 */
export async function promptConfirm(message, defaultValue = false) {
  return confirm({ message, default: defaultValue });
}
