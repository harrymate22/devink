import { describe, it, expect, vi } from 'vitest';
import { createLogger, Logger } from '../source/logger.js';
import * as ansi from '../source/utils/ansi.js';

describe('Logger', () => {
  it('should initialize correctly', () => {
    const logger = createLogger();
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should call custom transport on success', () => {
    const successSpy = vi.fn();
    const logger = createLogger({
      transports: [{ write: successSpy }],
    });
    logger.success('test message');
    expect(successSpy).toHaveBeenCalled();
  });

  it('should format message with timestamp if enabled', () => {
    const writeSpy = vi.fn();
    const logger = createLogger({ timestamps: true, transports: [{ write: writeSpy }] });
    logger.info('time test');
    expect(writeSpy).toHaveBeenCalled();
    const ctx = writeSpy.mock.calls[0]?.[0] as any;
    expect(ctx.formatted).toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
  });

  it('should properly serialize standard objects', () => {
    const writeSpy = vi.fn();
    const logger = createLogger({ transports: [{ write: writeSpy }] });
    logger.error('Failed', { status: 500 });
    expect(writeSpy).toHaveBeenCalled();
    const ctx = writeSpy.mock.calls[0]?.[0] as any;
    expect(ctx.formatted).toContain('500');
  });

  it('should gracefully handle circular JSON objects', () => {
    const writeSpy = vi.fn();
    const logger = createLogger({ transports: [{ write: writeSpy }] });
    const circular: any = {};
    circular.self = circular;
    logger.warn('Warning', circular);
    expect(writeSpy).toHaveBeenCalled();
    const ctx = writeSpy.mock.calls[0]?.[0] as any;
  expect(ctx.formatted).toContain('[Circular]');
  });

  it('should strip ansi escapes when colors: false', () => {
    const writeSpy = vi.fn();
    const logger = createLogger({
      colors: false,
      transports: [{ write: writeSpy }],
    });
    logger.info('Strip me');
    expect(writeSpy).toHaveBeenCalled();
    const ctx = writeSpy.mock.calls[0]?.[0] as any;
    // ensure no ansi escape codes present
    expect(ctx.formatted).not.toMatch(/\x1b\[[0-9;]*m/);
    expect(ctx.formatted).toContain('Strip me');
  });
});

describe('ANSI Utils', () => {
  it('should construct escape sequence roughly containing the text', () => {
    const output = ansi.red('test');
    expect(output).toContain('test');
  });
});
