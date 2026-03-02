import { defaultTheme, type Theme } from './theme.js';
import { gray, hex, stripAnsi, isColorSupported } from './utils/ansi.js';

export enum LogLevel {
  trace = 10,
  debug = 20,
  info = 30,
  success = 35,
  warn = 40,
  error = 50,
  fatal = 60,
  none = 100,
}

export type LogLevelName = keyof typeof LogLevel;

export interface TransportContext {
  level: LogLevelName;
  levelValue: number;
  message: unknown[];
  formatted: string;
  raw: string;
  timestamp: string;
}

export interface Transport {
  write(ctx: TransportContext): void;
}

export interface LoggerOptions {
  theme?: Partial<Theme>;
  timestamps?: boolean;
  colors?: boolean;
  level?: LogLevelName;
  mode?: 'text' | 'json';
  transports?: Transport[];
}

export class ConsoleTransport implements Transport {
  write(ctx: TransportContext): void {
    const stream = ctx.levelValue >= LogLevel.error ? console.error : console.log;
    stream(ctx.formatted);
  }
}

export class Logger {
  private theme: Theme;
  private timestamps: boolean;
  private colors: boolean;
  private level: LogLevel;
  private mode: 'text' | 'json';
  private transports: Transport[];
  private timeCache = { time: '', str: '' };

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
    this.colors = options.colors ?? Boolean(isColorSupported);
    this.level = LogLevel[options.level ?? 'trace'];
    this.mode = options.mode ?? 'text';
    this.transports = options.transports ?? [new ConsoleTransport()];
  }

  private shouldLog(levelValue: number): boolean {
    return levelValue >= this.level;
  }

  private getTimestamp(): { iso: string; formatted: string } {
    if (!this.timestamps) return { iso: '', formatted: '' };
    const now = new Date();
    const iso = now.toISOString();
    const time = iso.split('T')[1]?.split('.')[0] || '';
    if (this.timeCache.time === time) return { iso, formatted: this.timeCache.str };
    const str = gray(`[${time}] `);
    this.timeCache = { time, str };
    return { iso, formatted: str };
  }

  private safeStringify(value: unknown, space?: number): string {
    const cache = new Set();
    return JSON.stringify(
      value,
      (_key, val) => {
        if (typeof val === 'object' && val !== null) {
          if (cache.has(val)) return '[Circular]';
          cache.add(val);
        }
        return val;
      },
      space,
    );
  }

  private highlightJson(jsonString: string): string {
    if (!this.colors || jsonString.length > 5000) return jsonString;
    return jsonString.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) return hex('#9ca3af', match.slice(0, -1)) + ':';
          return hex('#34d399', match);
        }
        if (/true|false/.test(match)) return hex('#c084fc', match);
        if (/null/.test(match)) return hex('#f87171', match);
        return hex('#fbbf24', match);
      },
    );
  }

  private formatMessage(message: unknown[]): string {
    return message
      .map((m) => {
        if (typeof m === 'string') return m;
        if (m instanceof Error) return m.stack || m.message;
        try {
          return '\n' + this.highlightJson(this.safeStringify(m, 2));
        } catch {
          return '[Unserializable]';
        }
      })
      .join(' ');
  }

  private emit(levelName: LogLevelName, themePrefix: string, themeColor: (s: string) => string, message: unknown[]): void {
    const levelValue = LogLevel[levelName];
    if (!this.shouldLog(levelValue)) return;

    const ts = this.getTimestamp();
    let formatted: string;
    let raw: string;

    if (this.mode === 'json') {
      const payload = {
        level: levelName,
        time: ts.iso,
        message: message.length === 1 ? message[0] : message,
      };
      formatted = raw = this.safeStringify(payload);
    } else {
      const msgStr = this.formatMessage(message);
      formatted = `${ts.formatted}${themePrefix} ${themeColor(msgStr)}`;
      raw = stripAnsi(formatted);
      if (!this.colors) formatted = raw;
    }

    this.dispatch(levelName, levelValue, message, formatted, raw, ts.iso);
  }

  private dispatch(
    level: LogLevelName,
    levelValue: number,
    message: unknown[],
    formatted: string,
    raw: string,
    timestamp: string,
  ): void {
    const ctx: TransportContext = { level, levelValue, message, formatted, raw, timestamp };
    for (let i = 0; i < this.transports.length; i++) {
      this.transports[i]?.write(ctx);
    }
  }

  public success(...message: unknown[]): void {
    this.emit('success', this.theme.prefix.success, this.theme.success, message);
  }

  public error(...message: unknown[]): void {
    this.emit('error', this.theme.prefix.error, this.theme.error, message);
  }

  public warn(...message: unknown[]): void {
    this.emit('warn', this.theme.prefix.warn, this.theme.warn, message);
  }

  public info(...message: unknown[]): void {
    this.emit('info', this.theme.prefix.info, this.theme.info, message);
  }

  public trace(...message: unknown[]): void {
    this.emit('trace', gray('🔍'), gray, message);
  }

  public debug(...message: unknown[]): void {
    this.emit('debug', hex('#94a3b8', '🐛'), (s: string) => hex('#94a3b8', s), message);
  }

  public fatal(...message: unknown[]): void {
    this.emit('fatal', hex('#be123c', '💀'), (s: string) => hex('#be123c', s), message);
  }

  public box(title: string, message: string): void {
    const levelValue = LogLevel.info;
    if (!this.shouldLog(levelValue)) return;

    const lines = message.split('\n');
    const width = Math.max(title.length, ...lines.map((l) => stripAnsi(l).length)) + 4;
    const top = `┌─ ${title} ${'─'.repeat(width - title.length - 3)}┐`;
    const bottom = `└${'─'.repeat(width)}┘`;
    const content = lines.map((l) => {
      const pad = width - stripAnsi(l).length - 2;
      return `│ ${l}${' '.repeat(Math.max(0, pad))} │`;
    });
    
    let formatted = [top, ...content, bottom].join('\n');
    let raw = stripAnsi(formatted);

    if (this.mode === 'json') {
      const ts = this.getTimestamp();
      formatted = raw = this.safeStringify({
        level: 'info',
        time: ts.iso,
        title,
        message,
      });
      this.dispatch('info', levelValue, [message], formatted, raw, ts.iso);
      return;
    }

    if (this.colors) formatted = hex('#38bdf8', formatted);
    const ts = this.getTimestamp();
    this.dispatch('info', levelValue, [message], formatted, raw, ts.iso);
  }
}

export const createLogger = (options?: LoggerOptions): Logger => new Logger(options);
