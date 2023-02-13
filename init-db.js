import { Database } from 'sqlite-async';
import { readFile } from 'fs/promises';
import { DB_SQL_PATH } from './consts.js';

const initSQL = await readFile(DB_SQL_PATH,"utf-8");

const db = await Database.open(':memory:');
await db.exec(initSQL);

export default db;