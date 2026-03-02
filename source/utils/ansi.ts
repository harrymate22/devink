export const isColorSupported =
  !process.env.NO_COLOR &&
  (process.env.FORCE_COLOR || process.stdout?.isTTY || process.env.TERM === 'xterm-256color');

export const format = (code: number, text: string): string => {
  if (!isColorSupported) return text;
  return `\x1b[${code}m${text}\x1b[0m`;
};

export const reset = (text: string): string => format(0, text);
export const red = (text: string): string => format(31, text);
export const green = (text: string): string => format(32, text);
export const yellow = (text: string): string => format(33, text);
export const blue = (text: string): string => format(34, text);
export const magenta = (text: string): string => format(35, text);
export const cyan = (text: string): string => format(36, text);
export const white = (text: string): string => format(37, text);
export const gray = (text: string): string => format(90, text);

export const bold = (text: string): string => format(1, text);
export const dim = (text: string): string => format(2, text);
export const italic = (text: string): string => format(3, text);
export const underline = (text: string): string => format(4, text);
