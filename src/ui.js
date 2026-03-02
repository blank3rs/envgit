import chalk from 'chalk';

export const ok = (msg) => console.log(chalk.green(`✓ ${msg}`));
export const fail = (msg) => console.log(chalk.red(`✗ ${msg}`));
export const warn = (msg) => console.log(chalk.yellow(`⚠ ${msg}`));
export const fatal = (msg) => { console.error(chalk.red(`✗ ${msg}`)); process.exit(1); };
export const label = (text) => chalk.cyan(`[${text}]`);
export const dim = (text) => chalk.dim(text);
export const bold = (text) => chalk.bold(text);
