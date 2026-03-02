<h1 align="center">
	<br>
	<br>
	<img width="320" src="https://raw.githubusercontent.com/harrymate22/devink/main/media/Devink.png" alt="devink">
	<br>
	<br>
	<br>
</h1>

> Fast, lightweight, professional terminal logger. Zero dependencies.

[![npm version](https://badgen.net/npm/v/devink)](https://npmjs.com/package/devink)
[![license](https://badgen.net/github/license/user/devink)](https://github.com/user/devink/blob/main/LICENSE)
[![types](https://badgen.net/npm/types/devink)](https://www.npmjs.com/package/devink)
[![dependencies](https://badgen.net/bundlephobia/dependency-count/devink)](https://bundlephobia.com/result?p=devink)

**Devink** is a production-grade, zero-dependency Node.js logging library featuring custom transports, graceful JSON serialization, a deep-merging theme system, and automatic ANSI color detection.

Designed specifically built for high-performance CLI tools, servers, and modern development environments. 🚀

## Highlights

- **Zero Dependencies**: Pure, self-contained raw ANSI escape engine (`NO_COLOR`, `FORCE_COLOR`, `TERM`, `isTTY` support).
- **Graceful Error Handling**: Bulletproof object stringification gracefully handles Circular JSON crashes.
- **Custom Transports**: Redirect logs to files, external services, or any custom stream easily.
- **Deep Theme System**: Merge your own styles tightly without overriding whole config structures.
- **Lightweight & Fast**: Extremely fast execution.
- **Modern Module Setup**: Full TypeScript compatibility, exporting ESM (`import`) and CommonJS (`require`).

## Installation

```bash
npm install devink
```

## Quick Start

```typescript
import { createLogger } from 'devink';

const logger = createLogger({ timestamps: true });

logger.success('Database connection established');
logger.info('Listening on port 3000');
logger.warn('Memory usage above 80%');
logger.error('Request failed', { status: 500 });
```

## Advanced Usage

### Custom Transports

Devink allows you to intercept output and route it to your own methods. No more hardcoded `console.log`.

```typescript
import { createLogger } from 'devink';
import fs from 'fs';

const fileStream = fs.createWriteStream('./app.log', { flags: 'a' });

const logger = createLogger({
  transport: {
    // Override log execution logic
    success: (...args) => fileStream.write(`[PASS] ${args.join(' ')}\n`),
    error: (...args) => {
      console.error(...args); // Keep console logging
      fileStream.write(`[CRITICAL] ${args.join(' ')}\n`);
    },
  },
});

logger.success('User registered!'); // Goes straight to app.log
```

### Color Control

For environments where strict text formatting is required, Devink lets you disable ANSI explicitly.

```typescript
const logger = createLogger({
  colors: false, // Instantly strips all ANSI escape codes
});

logger.info('This will definitely be plain text.');
```

### Deep Theming

Deep-merge your theme overrides seamlessly.

```typescript
import { createLogger, ansi } from 'devink';

const customLogger = createLogger({
  theme: {
    // Colors text differently
    warn: (msg) => ansi.magenta(ansi.bold(msg)),
    prefix: {
      // Overrides ONLY the success icon, preserving defaults for others
      success: ansi.green('🚀 SUCCESS'),
    },
  },
});

customLogger.success('Payload deployed!');
customLogger.warn('Custom colored warning.');
```

### Safe Serialization

No more logging crashes from deep object introspection or circular references.

```typescript
const logger = createLogger();

const circularObj: any = {};
circularObj.self = circularObj;

// Doesn't throw! Gently recovers to '[Unserializable Object]'
logger.error('Error snapshot:', circularObj);
```

## API Reference

### `createLogger(options?: LoggerOptions)`

Creates a new `Logger` instance.

#### `LoggerOptions`

| Option       | Type                 | Default             | Description                                              |
| :----------- | :------------------- | :------------------ | :------------------------------------------------------- |
| `timestamps` | `boolean`            | `false`             | Prepends `[HH:MM:SS]` timestamp to every message.        |
| `colors`     | `boolean`            | `true`              | When `false`, all output will be stripped of ANSI codes. |
| `theme`      | `Partial<Theme>`     | `{}`                | Deep partial override of color structures and prefixes.  |
| `transport`  | `Partial<Transport>` | `console.*` methods | Custom output handler for standard log layers.           |

## Runtime Compatibility

- Node.js `^18.0.0` or newer
- Fully compatible with ESM & CommonJS

Built with ❤️ by **[Harry Mate](https://github.com/harrymate22)**.
🌟 If you find this library helpful, consider dropping a **Star** on GitHub and **[following me (@harrymate22)](https://github.com/harrymate22)** for more open-source tools!

## License

MIT © [harrymate22](https://github.com/harrymate22)
