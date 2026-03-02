export const isColorSupported =
  !process.env.NO_COLOR &&
  (process.env.FORCE_COLOR || process.stdout?.isTTY || process.env.TERM === 'xterm-256color');

export const format = (code: number, text: string): string => {
  if (!isColorSupported) return text;
  return `\x1b[${code}m${text}\x1b[0m`;
};

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

export const hex = (hexCode: string, text: string): string => {
  if (!isColorSupported) return text;
  const h = hexCode.replace(/^#/, '');
  if (h.length !== 6) return text;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
};

export const bgHex = (hexCode: string, text: string): string => {
  if (!isColorSupported) return text;
  const h = hexCode.replace(/^#/, '');
  if (h.length !== 6) return text;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `\x1b[48;2;${r};${g};${b}m${text}\x1b[0m`;
};
