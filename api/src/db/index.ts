import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@/db/schema';

const pool = mysql.createPool({
	host: process.env.DB_HOST!,
	port: parseInt(process.env.DB_PORT!),
	database: process.env.DB_DATABASE!,
	user: process.env.DB_USERNAME!,
	password: process.env.DB_PASSWORD!,
});

export const db = drizzle(pool, {
	schema,
	mode: 'default',
});
