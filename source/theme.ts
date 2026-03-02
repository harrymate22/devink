import { hex, dim, cyan, green, yellow, red } from './utils/ansi.js';

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

export const modernTheme: Theme = {
  success: (msg: string) => hex('#10b981', msg),
  error: (msg: string) => hex('#f43f5e', msg),
  warn: (msg: string) => hex('#f59e0b', msg),
  info: (msg: string) => hex('#38bdf8', msg),
  prefix: {
    success: hex('#10b981', '✔') + ' ' + hex('#34d399', dim('success')),
    error: hex('#f43f5e', '✖') + ' ' + hex('#fb7185', dim('error')),
    warn: hex('#f59e0b', '⚠') + ' ' + hex('#fbbf24', dim('warn')),
    info: hex('#38bdf8', 'ℹ') + ' ' + hex('#7dd3fc', dim('info')),
  },
};

export const minimalTheme: Theme = {
  success: (msg: string) => msg,
  error: (msg: string) => msg,
  warn: (msg: string) => msg,
  info: (msg: string) => msg,
  prefix: {
    success: hex('#10b981', '✔'),
    error: hex('#f43f5e', '✖'),
    warn: hex('#f59e0b', '⚠'),
    info: hex('#38bdf8', 'ℹ'),
  },
};

export const classicTheme: Theme = {
  success: (msg: string) => green(msg),
  error: (msg: string) => red(msg),
  warn: (msg: string) => yellow(msg),
  info: (msg: string) => cyan(msg),
  prefix: {
    success: green('SUCCESS'),
    error: red('ERROR'),
    warn: yellow('WARN'),
    info: cyan('INFO'),
  },
};

export const defaultTheme: Theme = modernTheme;
