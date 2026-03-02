const env = process.env;
export const isColorSupported =
  !env.NO_COLOR &&
  (env.FORCE_COLOR ||
    (process.stdout && process.stdout.isTTY) ||
    env.TERM === 'xterm-256color' ||
    env.CI === 'true');

export const format = (code: number, text: string): string =>
  isColorSupported ? `\x1b[${code}m${text}\x1b[0m` : text;

export const reset = (text: string): string => format(0, text);
export const black = (text: string): string => format(30, text);
export const red = (text: string): string => format(31, text);
export const green = (text: string): string => format(32, text);
export const yellow = (text: string): string => format(33, text);
export const blue = (text: string): string => format(34, text);
export const magenta = (text: string): string => format(35, text);
export const cyan = (text: string): string => format(36, text);
export const white = (text: string): string => format(37, text);
export const gray = (text: string): string => format(90, text);

export const bgBlack = (text: string): string => format(40, text);
export const bgRed = (text: string): string => format(41, text);
export const bgGreen = (text: string): string => format(42, text);
export const bgYellow = (text: string): string => format(43, text);
export const bgBlue = (text: string): string => format(44, text);
export const bgMagenta = (text: string): string => format(45, text);
export const bgCyan = (text: string): string => format(46, text);
export const bgWhite = (text: string): string => format(47, text);

export const bold = (text: string): string => format(1, text);
export const dim = (text: string): string => format(2, text);
export const italic = (text: string): string => format(3, text);
export const underline = (text: string): string => format(4, text);
export const inverse = (text: string): string => format(7, text);

export const rgb = (r: number, g: number, b: number, text: string): string =>
  isColorSupported ? `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m` : text;
export const bgRgb = (r: number, g: number, b: number, text: string): string =>
  isColorSupported ? `\x1b[48;2;${r};${g};${b}m${text}\x1b[0m` : text;

export const hex = (hexCode: string, text: string): string => {
  if (!isColorSupported) return text;
  const h = hexCode.replace(/^#/, '');
  if (h.length !== 6) return text;
  return rgb(parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), text);
};

export const bgHex = (hexCode: string, text: string): string => {
  if (!isColorSupported) return text;
  const h = hexCode.replace(/^#/, '');
  if (h.length !== 6) return text;
  return bgRgb(parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), text);
};

export const color256 = (code: number, text: string): string =>
  isColorSupported ? `\x1b[38;5;${code}m${text}\x1b[0m` : text;
export const bgColor256 = (code: number, text: string): string =>
  isColorSupported ? `\x1b[48;5;${code}m${text}\x1b[0m` : text;

export const stripAnsi = (text: string): string => text.replace(/\x1b\[[0-9;]*m/g, '');
