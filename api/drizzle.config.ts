import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const { DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD } = process.env;

export default defineConfig({
	out: './drizzle',
	schema: './src/db/schema.ts',
	dialect: 'mysql',
	dbCredentials: {
		url: `mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
	},
});
