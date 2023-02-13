import path from 'path';
import { fileURLToPath } from 'url';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_SQL_PATH = path.join(__dirname, 'mydb.sql');
