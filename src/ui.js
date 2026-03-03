import chalk from 'chalk';

export const ok    = (msg) => console.log(chalk.green(`✓ ${msg}`));
export const fail  = (msg) => console.log(chalk.red(`✗ ${msg}`));
export const warn  = (msg) => console.log(chalk.yellow(`⚠ ${msg}`));
export const fatal = (msg) => { console.error(chalk.red(`✗ ${msg}`)); process.exit(1); };
export const dim   = (text) => chalk.dim(text);
export const bold  = (text) => chalk.bold(text);

// Plain label (non-env uses)
export const label = (text) => chalk.cyan(`[${text}]`);

// Well-known env signals — only these get special colors
const PROD_RE    = /^(prod|production)$/i;
const STAGING_RE = /^(staging|stage|uat|preprod|pre-prod|preview)$/i;
const DEV_RE     = /^(dev|development|local|localhost)$/i;

// Any other env name gets a stable unique color derived from the name —
// "john", "feature-x", "client-abc", "solo" each always render the same color
const PALETTE = [
  'cyan', 'blue', 'magenta', 'white',
  'cyanBright', 'blueBright', 'magentaBright', 'whiteBright',
];
function hashColor(name) {
  const n = [...name].reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7);
  return PALETTE[Math.abs(n) % PALETTE.length];
}

export function envLabel(name) {
  if (PROD_RE.test(name))    return chalk.bold.red(`[${name}]`);
  if (STAGING_RE.test(name)) return chalk.bold.yellow(`[${name}]`);
  if (DEV_RE.test(name))     return chalk.bold.green(`[${name}]`);
  return chalk.bold[hashColor(name)](`[${name}]`);
}
