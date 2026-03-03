# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-03

### Added

- **Child Loggers**: Scoped loggers via `logger.child({ namespace: 'db' })` with inherited config and namespace prefixing.
- **HTTP Request Middleware**: Framework-agnostic middleware via `httpMiddleware(logger)` for Express, Fastify, Hono. Auto-logs method, path, status, and duration.
- **Log Grouping**: Visual grouping via `logger.group(label)` / `logger.groupEnd()` with indented output.
- **Performance Timers**: Built-in `logger.time(label)` / `logger.timeEnd(label)` for measuring durations.
- **Log Sampling**: Rate-limit high-frequency logs with `sampling: { 'db.query': 0.1 }` to log only a fraction of events.
- **Async File Transport**: Built-in `FileTransport` with rotation support, configurable max size (`'10mb'`), and max file retention.
- **Field Redaction**: Security-first `redact: ['password', 'token']` option masks sensitive fields with `[REDACTED]`.
- **Pretty Error Formatting**: Colored stack traces with highlighted file paths, line numbers, and dimmed internal frames.
- **Namespace in TransportContext**: `namespace` and `meta` fields added to `TransportContext` for structured transport consumers.

### Changed

- `LoggerOptions` interface extended with `sampling`, `redact`, and `namespace` fields.
- `TransportContext` interface extended with optional `namespace` and `meta` fields.
- Package description updated to reflect new capabilities.

## [1.0.6] - 2026-03-02

### Fixed

- Minor packaging and README fixes.

## [1.0.0] - 2026-03-01

### Added

- Initial release with `createLogger`, log levels, themes, ANSI utilities, boxed output, JSON mode, and custom transports.
