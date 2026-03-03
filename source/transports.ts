import { appendFile, stat, rename, unlink } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Transport, TransportContext } from './logger.js';

export interface FileTransportOptions {
  path: string;
  maxSize?: string | number;
  maxFiles?: number;
  rotate?: boolean;
}

const UNITS: Record<string, number> = { b: 1, kb: 1024, mb: 1048576, gb: 1073741824 };

function parseSize(s: string | number): number {
  if (typeof s === 'number') return s;
  const m = s.trim().toLowerCase().match(/^([\d.]+)\s*(b|kb|mb|gb)?$/);
  return m ? Math.floor(parseFloat(m[1]!) * (UNITS[m[2] || 'b']!)) : 10485760;
}

export class FileTransport implements Transport {
  private fp: string;
  private ms: number;
  private mf: number;
  private rot: boolean;
  private sz = 0;
  private q: Promise<void> = Promise.resolve();
  private init = false;

  constructor(opts: FileTransportOptions) {
    this.fp = opts.path;
    this.ms = parseSize(opts.maxSize ?? '10mb');
    this.mf = opts.maxFiles ?? 5;
    this.rot = opts.rotate ?? true;
    const dir = dirname(this.fp);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  write(ctx: TransportContext): void {
    const line = ctx.raw + '\n';
    this.q = this.q.then(() => this.flush(line));
  }

  private async flush(line: string): Promise<void> {
    if (!this.init) {
      try { this.sz = (await stat(this.fp)).size; } catch { this.sz = 0; }
      this.init = true;
    }
    const bytes = Buffer.byteLength(line, 'utf8');
    if (this.rot && this.sz + bytes > this.ms) {
      for (let i = this.mf - 1; i >= 1; i--) {
        try { await rename(i === 1 ? this.fp : `${this.fp}.${i - 1}`, `${this.fp}.${i}`); } catch {}
      }
      try { await unlink(this.fp); } catch {}
      this.sz = 0;
    }
    await appendFile(this.fp, line, 'utf8');
    this.sz += bytes;
  }
}
