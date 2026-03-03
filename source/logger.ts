import { defaultTheme, type Theme } from './theme.js';
import { gray, hex, red, dim, bold, cyan, yellow, stripAnsi, isColorSupported } from './utils/ansi.js';

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
  namespace?: string;
  meta?: Record<string, unknown>;
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
  sampling?: Record<string, number>;
  redact?: string[];
  namespace?: string;
}

export class ConsoleTransport implements Transport {
  write(ctx: TransportContext): void {
    (ctx.levelValue >= LogLevel.error ? console.error : console.log)(ctx.formatted);
  }
}

const EMPTY_TS = { iso: '', formatted: '' };
const CIRC = new Set();

function stringify(value: unknown, space?: number): string {
  CIRC.clear();
  const result = JSON.stringify(value, (_k, v) => {
    if (typeof v === 'object' && v !== null) {
      if (CIRC.has(v)) return '[Circular]';
      CIRC.add(v);
    }
    return v;
  }, space);
  CIRC.clear();
  return result;
}

function redactDeep(val: unknown, keys: Set<string>): unknown {
  if (typeof val !== 'object' || val === null || val instanceof Error) return val;
  if (Array.isArray(val)) return val.map((v) => redactDeep(v, keys));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    out[k] = keys.has(k.toLowerCase())
      ? '[REDACTED]'
      : typeof v === 'object' && v !== null && !(v instanceof Error)
        ? redactDeep(v, keys)
        : v;
  }
  return out;
}

export class Logger {
  private t: Theme;
  private ts: boolean;
  private c: boolean;
  private lv: LogLevel;
  private m: 'text' | 'json';
  private tr: Transport[];
  private tc = { t: '', s: '' };
  private sp: Record<string, number>;
  private rk: Set<string>;
  private ns: string;
  private gd = 0;
  private tm: Map<string, number> = new Map();
  private sc: Map<string, number> = new Map();
  private dm: Record<string, unknown>;

  constructor(opts: LoggerOptions = {}, meta: Record<string, unknown> = {}) {
    this.t = { ...defaultTheme, ...opts.theme, prefix: { ...defaultTheme.prefix, ...opts.theme?.prefix } };
    this.ts = opts.timestamps ?? false;
    this.c = opts.colors ?? Boolean(isColorSupported);
    this.lv = LogLevel[opts.level ?? 'trace'];
    this.m = opts.mode ?? 'text';
    this.tr = opts.transports ?? [new ConsoleTransport()];
    this.sp = opts.sampling ?? {};
    this.rk = new Set((opts.redact ?? []).map((k) => k.toLowerCase()));
    this.ns = opts.namespace ?? '';
    this.dm = meta;
  }

  child(bindings: { namespace?: string; [k: string]: unknown }): Logger {
    const { namespace: ns, ...rest } = bindings;
    return new Logger({
      theme: this.t,
      timestamps: this.ts,
      colors: this.c,
      level: (Object.keys(LogLevel) as LogLevelName[]).find((k) => LogLevel[k] === this.lv) as LogLevelName,
      mode: this.m,
      transports: this.tr,
      sampling: this.sp,
      redact: Array.from(this.rk),
      namespace: ns ? (this.ns ? `${this.ns}:${ns}` : ns) : this.ns,
    }, { ...this.dm, ...rest });
  }

  group(label: string): void {
    if (LogLevel.info < this.lv) return;
    const ts = this.getTs();
    const np = this.nsPrefix();
    const indent = '  '.repeat(this.gd);
    if (this.m === 'json') {
      const f = stringify({ level: 'info', type: 'groupStart', label, time: ts.iso });
      this.dispatch('info', LogLevel.info, [label], f, f, ts.iso);
    } else {
      const line = `${ts.formatted}${np}${indent}${this.c ? bold(cyan(`▸ ${label}`)) : `▸ ${label}`}`;
      this.dispatch('info', LogLevel.info, [label], line, stripAnsi(line), ts.iso);
    }
    this.gd++;
  }

  groupEnd(): void {
    if (this.gd > 0) this.gd--;
  }

  time(label: string): void {
    this.tm.set(label, performance.now());
  }

  timeEnd(label: string): void {
    const s = this.tm.get(label);
    if (s === undefined) return;
    this.tm.delete(label);
    const ms = performance.now() - s;
    this.info(`${label}: ${ms < 1 ? ms.toFixed(3) : Math.round(ms)}ms`);
  }

  private getTs(): { iso: string; formatted: string } {
    if (!this.ts) return EMPTY_TS;
    const now = new Date();
    const iso = now.toISOString();
    const time = iso.slice(11, 19);
    if (this.tc.t === time) return { iso, formatted: this.tc.s };
    const s = gray(`[${time}] `);
    this.tc = { t: time, s };
    return { iso, formatted: s };
  }

  private nsPrefix(): string {
    if (!this.ns) return '';
    return this.c ? hex('#a78bfa', `[${this.ns}] `) : `[${this.ns}] `;
  }

  private hlJson(s: string): string {
    if (!this.c || s.length > 5000) return s;
    return s.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (m) => {
        if (m[0] === '"') return m.endsWith(':') ? hex('#9ca3af', m.slice(0, -1)) + ':' : hex('#34d399', m);
        if (m === 'true' || m === 'false') return hex('#c084fc', m);
        if (m === 'null') return hex('#f87171', m);
        return hex('#fbbf24', m);
      },
    );
  }

  private fmtErr(err: Error): string {
    const stack = err.stack || err.message;
    if (!this.c) return stack;
    return stack.split('\n').map((line, i) => {
      if (i === 0) return bold(red(line));
      const f = line.match(/^(\s+at\s+)(.+?)(\s+\()?(.+?):(\d+):(\d+)\)?$/);
      if (f) {
        return f[4]!.includes('node_modules') || f[4]!.startsWith('node:')
          ? dim(line)
          : `${dim(f[1]!)}${yellow(f[2]!)}${dim(f[3] || ' ')}${cyan(f[4]!)}:${hex('#fbbf24', f[5]!)}:${dim(f[6]!)}${f[3] ? dim(')') : ''}`;
      }
      return line.match(/^\s+at\s+/) ? dim(line) : red(line);
    }).join('\n');
  }

  private fmtMsg(msg: unknown[]): string {
    return msg.map((m) => {
      if (typeof m === 'string') return m;
      if (m instanceof Error) return '\n' + this.fmtErr(m);
      try {
        return '\n' + this.hlJson(stringify(this.rk.size ? redactDeep(m, this.rk) : m, 2));
      } catch {
        return '[Unserializable]';
      }
    }).join(' ');
  }

  private emit(ln: LogLevelName, pfx: string, clr: (s: string) => string, msg: unknown[]): void {
    const lv = LogLevel[ln];
    if (lv < this.lv) return;

    const ts = this.getTs();
    const np = this.nsPrefix();
    const indent = '  '.repeat(this.gd);
    let formatted: string, raw: string;

    if (this.m === 'json') {
      const rm = msg.map((m) => typeof m === 'object' && m !== null && !(m instanceof Error) && this.rk.size ? redactDeep(m, this.rk) : m);
      const p: Record<string, unknown> = { level: ln, time: ts.iso, message: rm.length === 1 ? rm[0] : rm };
      if (this.ns) p.namespace = this.ns;
      if (Object.keys(this.dm).length) Object.assign(p, this.dm);
      formatted = raw = stringify(p);
    } else {
      formatted = `${ts.formatted}${np}${indent}${pfx} ${clr(this.fmtMsg(msg))}`;
      raw = stripAnsi(formatted);
      if (!this.c) formatted = raw;
    }

    this.dispatch(ln, lv, msg, formatted, raw, ts.iso);
  }

  private dispatch(level: LogLevelName, levelValue: number, message: unknown[], formatted: string, raw: string, timestamp: string): void {
    const ctx: TransportContext = { level, levelValue, message, formatted, raw, timestamp, namespace: this.ns || undefined, meta: Object.keys(this.dm).length ? this.dm : undefined };
    for (let i = 0; i < this.tr.length; i++) this.tr[i]?.write(ctx);
  }

  success(...msg: unknown[]): void { this.emit('success', this.t.prefix.success, this.t.success, msg); }
  error(...msg: unknown[]): void { this.emit('error', this.t.prefix.error, this.t.error, msg); }
  warn(...msg: unknown[]): void { this.emit('warn', this.t.prefix.warn, this.t.warn, msg); }
  info(...msg: unknown[]): void { this.emit('info', this.t.prefix.info, this.t.info, msg); }
  trace(...msg: unknown[]): void { this.emit('trace', gray('🔍'), gray, msg); }
  debug(...msg: unknown[]): void { this.emit('debug', hex('#94a3b8', '🐛'), (s) => hex('#94a3b8', s), msg); }
  fatal(...msg: unknown[]): void { this.emit('fatal', hex('#be123c', '💀'), (s) => hex('#be123c', s), msg); }

  box(title: string, message: string): void {
    if (LogLevel.info < this.lv) return;
    const lines = message.split('\n');
    const w = Math.max(title.length, ...lines.map((l) => stripAnsi(l).length)) + 4;
    const top = `┌─ ${title} ${'─'.repeat(w - title.length - 3)}┐`;
    const bot = `└${'─'.repeat(w)}┘`;
    const body = lines.map((l) => `│ ${l}${' '.repeat(Math.max(0, w - stripAnsi(l).length - 2))} │`);
    let formatted = [top, ...body, bot].join('\n');
    const raw = stripAnsi(formatted);
    const ts = this.getTs();

    if (this.m === 'json') {
      const f = stringify({ level: 'info', time: ts.iso, title, message });
      this.dispatch('info', LogLevel.info, [message], f, f, ts.iso);
      return;
    }

    if (this.c) formatted = hex('#38bdf8', formatted);
    this.dispatch('info', LogLevel.info, [message], formatted, raw, ts.iso);
  }
}

export const createLogger = (opts?: LoggerOptions): Logger => new Logger(opts);
