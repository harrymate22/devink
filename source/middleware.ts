import type { Logger } from './logger.js';

export interface HttpMiddlewareOptions {
  warnAbove?: number;
  errorAbove?: number;
}

export function httpMiddleware(logger: Logger, opts: HttpMiddlewareOptions = {}) {
  const wt = opts.warnAbove ?? 400;
  const et = opts.errorAbove ?? 500;

  return (req: Record<string, unknown>, res: Record<string, unknown>, next: (err?: unknown) => void) => {
    const start = performance.now();
    const method = (req.method as string) ?? 'UNKNOWN';
    const url = (req.originalUrl as string) ?? (req.url as string) ?? '/';

    const done = () => {
      const ms = Math.round(performance.now() - start);
      const status = (res.statusCode as number) ?? 0;
      const msg = `${method} ${url} ${status} ${ms}ms`;
      if (status >= et) logger.error(msg);
      else if (status >= wt) logger.warn(msg);
      else logger.info(msg);
    };

    const on = res.on as Function | undefined;
    const once = res.once as Function | undefined;
    if (typeof on === 'function') on.call(res, 'finish', done);
    else if (typeof once === 'function') once.call(res, 'close', done);

    next();
  };
}
