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
      transport: { success: successSpy },
    });
    logger.success('test message');
    expect(successSpy).toHaveBeenCalled();
  });

  it('should format message with timestamp if enabled', () => {
    const infoSpy = vi.fn();
    const logger = createLogger({ timestamps: true, transport: { info: infoSpy } });
    logger.info('time test');
    expect(infoSpy).toHaveBeenCalled();
    const output = infoSpy.mock.calls[0]?.[0] as string;
    expect(output).toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
  });

  it('should properly serialize standard objects', () => {
    const errorSpy = vi.fn();
    const logger = createLogger({ transport: { error: errorSpy } });
    logger.error('Failed', { status: 500 });
    expect(errorSpy).toHaveBeenCalled();
    const output = errorSpy.mock.calls[0]?.[0] as string;
    expect(output).toContain('500');
  });

  it('should gracefully handle circular JSON objects', () => {
    const warnSpy = vi.fn();
    const logger = createLogger({ transport: { warn: warnSpy } });
    const circular: any = {};
    circular.self = circular;
    logger.warn('Warning', circular);
    expect(warnSpy).toHaveBeenCalled();
    const output = warnSpy.mock.calls[0]?.[0] as string;
    expect(output).toContain('[Unserializable Object]');
  });

  it('should strip ansi escapes when colors: false', () => {
    const infoSpy = vi.fn();
    const logger = createLogger({
      colors: false,
      transport: { info: infoSpy },
    });
    logger.info('Strip me');
    expect(infoSpy).toHaveBeenCalled();
    const output = infoSpy.mock.calls[0]?.[0] as string;
    // ensure no ansi escape codes present
    expect(output).not.toMatch(/\x1b\[[0-9;]*m/);
    expect(output).toContain('Strip me');
  });
});

describe('ANSI Utils', () => {
  it('should construct escape sequence roughly containing the text', () => {
    const output = ansi.red('test');
    expect(output).toContain('test');
  });
});
