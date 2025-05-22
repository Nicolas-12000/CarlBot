import type { Config } from 'drizzle-kit';

export default {
  schema: './src/infrastructure/database/schema.ts',
  out: './drizzle',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'carlbot',
} satisfies Config;