import { defaultTheme, type Theme } from './theme.js';
import { gray } from './utils/ansi.js';

export interface Transport {
  success: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
}

export interface LoggerOptions {
  theme?: Partial<Theme>;
  timestamps?: boolean;
  colors?: boolean;
  transport?: Partial<Transport>;
}

const defaultTransport: Transport = {
  success: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
};

export class Logger {
  private theme: Theme;
  private timestamps: boolean;
  private colors: boolean;
  private transport: Transport;

  constructor(options: LoggerOptions = {}) {
    this.theme = {
      ...defaultTheme,
      ...options.theme,
      prefix: {
        ...defaultTheme.prefix,
        ...options.theme?.prefix,
      },
    };
    this.timestamps = options.timestamps ?? false;
    this.colors = options.colors ?? true;
    this.transport = { ...defaultTransport, ...options.transport };
  }

  private getTimestamp(): string {
    if (!this.timestamps) return '';
    const now = new Date();
    const time = now.toISOString().split('T')[1]?.split('.')[0];
    return gray(`[${time}] `);
  }

  private formatMessage(message: unknown[]): string {
    return message
      .map((m) => {
        if (typeof m === 'string') return m;
        try {
          return JSON.stringify(m, null, 2);
        } catch {
          return '[Unserializable Object]';
        }
      })
      .join(' ');
  }

  private stripAnsi(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  private output(level: keyof Transport, formattedOutput: string): void {
    const finalOutput = this.colors ? formattedOutput : this.stripAnsi(formattedOutput);
    this.transport[level](finalOutput);
  }

  public success(...message: unknown[]): void {
    const msg = this.formatMessage(message);
    this.output(
      'success',
      `${this.getTimestamp()}${this.theme.prefix.success} ${this.theme.success(msg)}`,
    );
  }

  public error(...message: unknown[]): void {
    const msg = this.formatMessage(message);
    this.output(
      'error',
      `${this.getTimestamp()}${this.theme.prefix.error} ${this.theme.error(msg)}`,
    );
  }

  public warn(...message: unknown[]): void {
    const msg = this.formatMessage(message);
    this.output('warn', `${this.getTimestamp()}${this.theme.prefix.warn} ${this.theme.warn(msg)}`);
  }

  public info(...message: unknown[]): void {
    const msg = this.formatMessage(message);
    this.output('info', `${this.getTimestamp()}${this.theme.prefix.info} ${this.theme.info(msg)}`);
  }
}

export const createLogger = (options?: LoggerOptions): Logger => {
  return new Logger(options);
};
