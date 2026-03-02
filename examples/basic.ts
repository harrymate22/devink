import { createLogger } from '../source/index.js';

const logger = createLogger({ timestamps: true });

logger.info('Starting up devink...');
logger.success('Connected to the database');
logger.warn('CPU limit approaching 80%');
logger.error('Failed to parse incoming payload', { error: 'SyntaxError: Unexpected token' });
