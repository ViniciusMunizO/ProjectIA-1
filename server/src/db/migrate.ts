import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Database as DatabaseType } from 'better-sqlite3';

const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));

export const migrate = (db: DatabaseType): void => {
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
};
