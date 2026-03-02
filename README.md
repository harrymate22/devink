<p align="center">
  <img src="https://raw.githubusercontent.com/harrymate22/devink/main/media/logo.png" alt="devink logo" width="300" />
</p>

# devink

> A fast, lightweight, and professional **TypeScript logger** with zero dependencies. Keep your terminal cool, soothing, and strictly structured.

[![npm version](https://img.shields.io/npm/v/devink.svg)](https://npmjs.org/package/devink)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

`devink` is a zero-dependency **Node.js logger** designed for developers who need high performance, beautiful **CLI output**, and structured **JSON logging**. With full **ANSI color support**, dynamic terminal capability detection, and customizable transports, it's the perfect production-ready logger for modern TS/JS environments.

---

<p align="center">
  <img src="https://raw.githubusercontent.com/harrymate22/devink/main/media/demo.png" alt="devink demo" width="600" />
</p>

## 🚀 Features

- **Zero Dependencies**: Lightweight and ultra-fast. No bloated `node_modules`.
- **Full ANSI & 256/RGB Color Support**: Beautiful, soothing UI themes for the terminal. No harsh contrast.
- **Structured JSON Logging**: Instantly switch to JSON mode for seamless integration with Datadog, ELK, AWS CloudWatch, and parsing tools.
- **Log Levels & Priority Filtering**: Granular control via `trace`, `debug`, `info`, `warn`, `error`, and `fatal`.
- **Custom Transports**: Route logs to files, external APIs, or custom formatting engines.
- **Terminal Capability Detection**: Automatically detects `process.stdout.isTTY`, `FORCE_COLOR`, `NO_COLOR`, and `CI` environments.
- **Boxed Output**: Help crucial information stand out with Unicode-boxed messages.
- **TypeScript native**: Built with TS, exporting standard typings out-of-the-box.

---

## 📦 Installation

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

## 💻 Usage

### Basic CLI Logger

Create a beautiful terminal logger with timestamps and the modern theme out of the box:

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
import { createLogger } from 'devink';

const logger = createLogger({
  mode: 'json',
  level: 'trace',
});

logger.info('Processing payment', { userId: 123, amount: 49.99 });
// Output: {"level":"info","time":"2023-10-25T14:30:00.000Z","message":["Processing payment",{"userId":123,"amount":49.99}]}
```

### Beautiful Boxed Output

Make important startup messages or critical alerts pop in the console:

```ts
const logger = createLogger();

logger.box(
  'System Ready',
  'All microservices have booted successfully.\nListening on http://localhost:8080',
);
```

---

## ⚙️ Configuration

The `createLogger` function accepts an optional `LoggerOptions` object:

| Property     | Type               | Default              | Description                                                                            |
| ------------ | ------------------ | -------------------- | -------------------------------------------------------------------------------------- |
| `level`      | `LogLevelName`     | `'trace'`            | Minimum log level to output (`trace` < `debug` < `info` < `warn` < `error` < `fatal`). |
| `mode`       | `'text' \| 'json'` | `'text'`             | Output mode. Text formats for the console, JSON formats for log aggregators.           |
| `colors`     | `boolean`          | `true`               | Whether to use ANSI colors. Automatically disabled if terminal doesn't support it.     |
| `timestamps` | `boolean`          | `false`              | Prepend a timestamp to text outputs (`[HH:MM:SS]`).                                    |
| `theme`      | `Partial<Theme>`   | `modernTheme`        | Customize the prefix, success, error, warn, and info styling.                          |
| `transports` | `Transport[]`      | `[ConsoleTransport]` | Target output locations hooks (e.g., standard out, file streams).                      |

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

You can easily route logs anywhere by providing objects that implement the `Transport` interface (which requires a `write(ctx: TransportContext)` method).

```ts
import { createLogger, Transport, TransportContext } from 'devink';
import fs from 'node:fs';

class FileTransport implements Transport {
  write(ctx: TransportContext) {
    fs.appendFileSync('app.log', ctx.raw + '\n');
  }
}

const logger = createLogger({
  transports: [new FileTransport()], // Now writes to app.log instead of console
});
```

---

## 🎨 ANSI Capabilities

If you want to build your own CLI tools, `devink` exports its high-performance, zero-dependency ANSI utilities:

```ts
import { ansi } from 'devink';

console.log(ansi.rgb(255, 100, 50, 'True RGB text!'));
console.log(ansi.hex('#34d399', 'Hex coded text!'));
console.log(ansi.color256(128, '256 color terminal support!'));
console.log(ansi.dim('Low contrast subtitle.'));
```

---

## 📄 License

MIT © [harrymate22](https://github.com/harrymate22)
