<p align="center">
  <img src="https://raw.githubusercontent.com/harrymate22/devink/main/media/logo.png" alt="devink logo" width="300" />
</p>

# devink

> A fast, lightweight, and professional **TypeScript logger** with zero dependencies. Keep your terminal cool, soothing, and strictly structured.

[![npm version](https://img.shields.io/npm/v/devink.svg)](https://npmjs.org/package/devink)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

`devink` is a zero-dependency **Node.js logger** designed for developers who need high performance, beautiful **CLI output**, and structured **JSON logging**. Child loggers, HTTP middleware, file transport with rotation, log sampling, field redaction, pretty error formatting — all built in with full **TypeScript** support and **zero external dependencies**.

---

<p align="center">
  <img src="https://raw.githubusercontent.com/harrymate22/devink/main/media/demo.png" alt="devink demo" width="600" />
</p>

## Features

- **Zero Dependencies** — Ultra-fast, nothing in `node_modules` except your own code.
- **Child Loggers** — Scoped, namespaced loggers with inherited configuration.
- **HTTP Middleware** — Framework-agnostic request logging for Express, Fastify, Hono, and more.
- **File Transport with Rotation** — Built-in async file transport with size-based rotation and retention.
- **Log Grouping** — Visual grouping for multi-step operations with indented output.
- **Performance Timers** — Measure execution time with `logger.time()` / `logger.timeEnd()`.
- **Log Sampling / Rate Limiting** — Only log a fraction of high-frequency events in production.
- **Sensitive Field Redaction** — Automatically mask passwords, tokens, and secrets from log output.
- **Pretty Error Formatting** — Colored stack traces with highlighted source locations.
- **Full ANSI & 256/RGB Color Support** — Beautiful themes for the terminal.
- **Structured JSON Logging** — One-line switch to JSON for Datadog, ELK, and more.
- **Log Levels & Priority Filtering** — Granular control via `trace`, `debug`, `info`, `warn`, `error`, and `fatal`.
- **Custom Transports** — Route logs to files, external APIs, or custom formatting engines.
- **Terminal Capability Detection** — Auto-detects `TTY`, `FORCE_COLOR`, `NO_COLOR`, and `CI` environments.
- **Boxed Output** — Unicode-boxed messages for critical startup and alert information.
- **TypeScript Native** — Built with TypeScript, full type definitions included.

---

## Installation

```bash
npm install devink
```

```bash
yarn add devink
```

```bash
pnpm add devink
```

---

## Quick Start

### Basic Logger

```ts
import { createLogger } from 'devink';

const logger = createLogger({
  timestamps: true,
  level: 'info',
});

logger.info('Server started on port 3000');
logger.success('Database connected successfully');
logger.warn('Rate limit approaching');
logger.error(new Error('Connection timeout'));
```

### Structured JSON Logging

Perfect for production environments where log aggregation is crucial:

```ts
const logger = createLogger({
  mode: 'json',
  level: 'trace',
});

logger.info('Processing payment', { userId: 123, amount: 49.99 });
// {"level":"info","time":"2026-03-03T00:00:00.000Z","message":["Processing payment",{"userId":123,"amount":49.99}]}
```

---

## Child Loggers / Namespaced Logging

Create scoped loggers that inherit the parent configuration and prepend a namespace to every log line:

```ts
import { createLogger } from 'devink';

const logger = createLogger({ timestamps: true });

const dbLogger = logger.child({ namespace: 'db' });
const authLogger = logger.child({ namespace: 'auth' });

dbLogger.info('Query executed in 12ms');
// [14:30:00] [db] ℹ info Query executed in 12ms

authLogger.warn('Token expires in 5 minutes');
// [14:30:00] [auth] ⚠ warn Token expires in 5 minutes
```

Child loggers can also carry default metadata:

```ts
const requestLogger = logger.child({ namespace: 'api', requestId: 'abc-123' });
requestLogger.info('Request received');
// In JSON mode: {"level":"info","namespace":"api","requestId":"abc-123","message":"Request received"}
```

---

## HTTP Request Middleware

Framework-agnostic middleware that auto-logs every HTTP request with method, path, status code, and response time:

```ts
import { createLogger, httpMiddleware } from 'devink';
import express from 'express';

const logger = createLogger({ timestamps: true });
const app = express();

app.use(httpMiddleware(logger));

// Every request automatically logged:
// [14:30:05] ℹ info GET /api/users 200 12ms
// [14:30:06] ⚠ warn POST /api/login 401 8ms
// [14:30:07] ✖ error GET /api/crash 500 3ms
```

Works with **Express**, **Fastify**, **Hono**, **Koa**, and any framework using the standard `(req, res, next)` pattern.

---

## Log Grouping

Visually group related log lines for multi-step operations:

```ts
const logger = createLogger({ timestamps: true });

logger.group('Database Migration');
logger.info('Running migration 001_create_users...');
logger.info('Running migration 002_add_indexes...');
logger.success('All migrations complete');
logger.groupEnd();

logger.info('Server ready');
```

Output:

```
[14:30:00] ▸ Database Migration
[14:30:00]   ℹ info Running migration 001_create_users...
[14:30:01]   ℹ info Running migration 002_add_indexes...
[14:30:01]   ✔ success All migrations complete
[14:30:01] ℹ info Server ready
```

---

## Performance Timers

Measure execution time for any operation directly from the logger:

```ts
const logger = createLogger();

logger.time('database-query');
await db.query('SELECT * FROM users');
logger.timeEnd('database-query');
// ℹ info database-query: 243ms

logger.time('api-call');
await fetch('https://api.example.com/data');
logger.timeEnd('api-call');
// ℹ info api-call: 891ms
```

---

## Log Sampling

In high-throughput production environments, log only a fraction of repetitive events:

```ts
const logger = createLogger({
  sampling: {
    'db.query': 0.1, // log 10% of database queries
    'cache.hit': 0.01, // log 1% of cache hits
  },
});

// Only ~10% of these calls will actually produce output
logger.info('Query executed', { table: 'users' });
```

---

## File Transport

Built-in file transport with async writes and automatic log rotation:

```ts
import { createLogger, FileTransport } from 'devink';

const logger = createLogger({
  transports: [
    new FileTransport({
      path: './logs/app.log',
      maxSize: '10mb',
      maxFiles: 5,
      rotate: true,
    }),
  ],
});

logger.info('This goes to a file with automatic rotation');
```

When `app.log` exceeds 10 MB, it rotates to `app.log.1`, `app.log.2`, etc., keeping at most 5 rotated files.

---

## Field Redaction

Automatically mask sensitive data before it reaches any transport:

```ts
const logger = createLogger({
  redact: ['password', 'token', 'authorization', 'ssn'],
});

logger.info('User login', { user: 'harry', password: 's3cret!', token: 'eyJhbG...' });
// ℹ info User login { user: 'harry', password: '[REDACTED]', token: '[REDACTED]' }
```

Redaction works recursively on nested objects and in both text and JSON modes.

---

## Error Formatting

When you pass an `Error` object, devink renders a beautiful, colored stack trace instead of a raw dump:

```ts
const logger = createLogger();

try {
  throw new Error('Database connection failed');
} catch (err) {
  logger.error('Fatal error during startup', err);
}
```

- Error name and message in **bold red**
- Your source files highlighted with **colored file paths and line numbers**
- `node_modules` and Node.js internal frames **dimmed** so your code stands out

---

## Boxed Output

Make important startup messages or critical alerts pop in the console:

```ts
const logger = createLogger();

logger.box(
  'System Ready',
  'All microservices have booted successfully.\nListening on http://localhost:8080',
);
```

---

## Configuration

The `createLogger` function accepts an optional `LoggerOptions` object:

| Property     | Type                     | Default              | Description                                                                  |
| ------------ | ------------------------ | -------------------- | ---------------------------------------------------------------------------- |
| `level`      | `LogLevelName`           | `'trace'`            | Minimum log level (`trace` < `debug` < `info` < `warn` < `error` < `fatal`). |
| `mode`       | `'text' \| 'json'`       | `'text'`             | Output mode. Text for the console, JSON for log aggregators.                 |
| `colors`     | `boolean`                | `true`               | ANSI colors. Automatically disabled if the terminal doesn't support it.      |
| `timestamps` | `boolean`                | `false`              | Prepend a timestamp (`[HH:MM:SS]`) to text outputs.                          |
| `theme`      | `Partial<Theme>`         | `modernTheme`        | Customize prefix icons and color functions for each log level.               |
| `transports` | `Transport[]`            | `[ConsoleTransport]` | Target output destinations (console, file, external APIs).                   |
| `namespace`  | `string`                 | `''`                 | Namespace prefix prepended to all log lines.                                 |
| `redact`     | `string[]`               | `[]`                 | Field names to mask with `[REDACTED]` in log output.                         |
| `sampling`   | `Record<string, number>` | `{}`                 | Sampling rates (0–1) for rate-limiting high-frequency log events.            |

### Theme Presets

`devink` ships with several UI/UX optimized presets, designed for accessibility and developer comfort:

- `modernTheme` (Default): Soft, cool hex colors (`#10b981`, `#f43f5e`, `#38bdf8`) with dim text to prevent eye strain.
- `classicTheme`: Standard ANSI colors (Red, Green, Yellow, Cyan).
- `minimalTheme`: Prefix icons only, without extra text like "success" or "error".

```ts
import { createLogger, classicTheme } from 'devink';

const logger = createLogger({
  theme: classicTheme,
});
```

### Custom Transports

Route logs anywhere by implementing the `Transport` interface:

```ts
import { createLogger, Transport, TransportContext } from 'devink';
import fs from 'node:fs';

class CustomTransport implements Transport {
  write(ctx: TransportContext) {
    fs.appendFileSync('custom.log', ctx.raw + '\n');
  }
}

const logger = createLogger({
  transports: [new CustomTransport()],
});
```

---

## ANSI Utilities

Build your own CLI tools with devink's high-performance, zero-dependency ANSI utilities:

```ts
import { ansi } from 'devink';

console.log(ansi.rgb(255, 100, 50, 'True RGB text!'));
console.log(ansi.hex('#34d399', 'Hex coded text!'));
console.log(ansi.color256(128, '256 color terminal support!'));
console.log(ansi.bold(ansi.cyan('Bold and cyan!')));
```

---

---

## Roadmap

These features are planned for upcoming releases:

- 🌐 **Browser Support** — Universal logger that works in both Node.js and browser DevTools.
- 🔗 **OpenTelemetry Integration** — Automatic `traceId` and `spanId` injection.
- 📡 **Log Aggregator Presets** — One-line setup for Datadog, Loki, and Elasticsearch.
- 🖥️ **Interactive CLI Mode** — Live log panel with filtering for development.

---

Built with ❤️ by **[Harry Mate](https://github.com/harrymate22)**.
🌟 If you find this library helpful, consider dropping a **Star** on GitHub and **[following me (@harrymate22)](https://github.com/harrymate22)** for more open-source tools!

## License

MIT © [harrymate22](https://github.com/harrymate22)
