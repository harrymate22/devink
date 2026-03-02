import { hex, bgHex, bold } from './utils/ansi.js';

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
  success: (msg: string) => msg,
  error: (msg: string) => msg,
  warn: (msg: string) => msg,
  info: (msg: string) => msg,
  prefix: {
    success: hex('#10b981', '✔') + ' ' + bgHex('#064e3b', hex('#34d399', bold(' SUCCESS '))),
    error: hex('#ef4444', '✖') + ' ' + bgHex('#7f1d1d', hex('#f87171', bold(' ERROR '))),
    warn: hex('#f59e0b', '⚠') + ' ' + bgHex('#78350f', hex('#fbbf24', bold(' WARNING '))),
    info: hex('#0ea5e9', 'ℹ') + ' ' + bgHex('#0c4a6e', hex('#38bdf8', bold(' INFO '))),
  },
};
