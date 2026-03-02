import { red, green, yellow, blue, gray, bold } from './utils/ansi.js';

export interface Theme {
  success: (msg: string) => string;
  error: (msg: string) => string;
  warn: (msg: string) => string;
  info: (msg: string) => string;
  prefix: {
    success: string;
    error: string;
    warn: string;
    info: string;
  };
}

export const defaultTheme: Theme = {
  success: (msg: string) => green(msg),
  error: (msg: string) => red(bold(msg)),
  warn: (msg: string) => yellow(msg),
  info: (msg: string) => blue(msg),
  prefix: {
    success: green('✔'),
    error: red('✖'),
    warn: yellow('⚠'),
    info: blue('ℹ'),
  },
};
