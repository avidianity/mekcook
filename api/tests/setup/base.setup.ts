import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCb);

async function dropAllTables() {
	const result = await db.execute(
		sql.raw(
			`SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = '${process.env.DB_DATABASE}'`
		)
	);

	const tables = Array.isArray(result) ? result : [];

	for (const row of tables) {
		const tableName = (row as any).TABLE_NAME;
		if (tableName) {
			await db.execute(sql.raw(`DROP TABLE IF EXISTS \`${tableName}\``));
		}
	}
}

async function migrate() {
	await exec('npx drizzle-kit push --config drizzle.config.ts');
}

export async function setupDb() {
	await dropAllTables();
	await migrate();
}
