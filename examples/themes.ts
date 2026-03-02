import { createLogger, defaultTheme, ansi } from '../source/index.js';

const customLogger = createLogger({
  theme: {
    prefix: {
      ...defaultTheme.prefix,
      info: ansi.magenta('💡'),
    },
    info: (msg) => ansi.magenta(msg),
  },
});

customLogger.info('This is a custom themed info message!');
customLogger.success('Success still uses the default theme!');
