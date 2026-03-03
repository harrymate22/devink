const e = process.env;
export const isColorSupported =
  !e.NO_COLOR &&
  (e.FORCE_COLOR ||
    (process.stdout && process.stdout.isTTY) ||
    e.TERM === 'xterm-256color' ||
    e.CI === 'true');

const wrap = (code: number, text: string): string =>
  isColorSupported ? `\x1b[${code}m${text}\x1b[0m` : text;

export const format = wrap;
export const reset = (t: string) => wrap(0, t);
export const black = (t: string) => wrap(30, t);
export const red = (t: string) => wrap(31, t);
export const green = (t: string) => wrap(32, t);
export const yellow = (t: string) => wrap(33, t);
export const blue = (t: string) => wrap(34, t);
export const magenta = (t: string) => wrap(35, t);
export const cyan = (t: string) => wrap(36, t);
export const white = (t: string) => wrap(37, t);
export const gray = (t: string) => wrap(90, t);
export const bgBlack = (t: string) => wrap(40, t);
export const bgRed = (t: string) => wrap(41, t);
export const bgGreen = (t: string) => wrap(42, t);
export const bgYellow = (t: string) => wrap(43, t);
export const bgBlue = (t: string) => wrap(44, t);
export const bgMagenta = (t: string) => wrap(45, t);
export const bgCyan = (t: string) => wrap(46, t);
export const bgWhite = (t: string) => wrap(47, t);
export const bold = (t: string) => wrap(1, t);
export const dim = (t: string) => wrap(2, t);
export const italic = (t: string) => wrap(3, t);
export const underline = (t: string) => wrap(4, t);
export const inverse = (t: string) => wrap(7, t);

export const rgb = (r: number, g: number, b: number, t: string): string =>
  isColorSupported ? `\x1b[38;2;${r};${g};${b}m${t}\x1b[0m` : t;
export const bgRgb = (r: number, g: number, b: number, t: string): string =>
  isColorSupported ? `\x1b[48;2;${r};${g};${b}m${t}\x1b[0m` : t;

export const hex = (h: string, t: string): string => {
  if (!isColorSupported) return t;
  const c = h.replace('#', '');
  return c.length === 6 ? rgb(parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16), t) : t;
};

export const bgHex = (h: string, t: string): string => {
  if (!isColorSupported) return t;
  const c = h.replace('#', '');
  return c.length === 6 ? bgRgb(parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16), t) : t;
};

export const color256 = (c: number, t: string): string =>
  isColorSupported ? `\x1b[38;5;${c}m${t}\x1b[0m` : t;
export const bgColor256 = (c: number, t: string): string =>
  isColorSupported ? `\x1b[48;5;${c}m${t}\x1b[0m` : t;

export const stripAnsi = (t: string): string => t.replace(/\x1b\[[0-9;]*m/g, '');
