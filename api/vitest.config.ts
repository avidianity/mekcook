import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.env.DOTENV_CONFIG_PATH = '.env.test';

export default defineConfig({
	test: {
		setupFiles: [
			'dotenv/config',
			'tsconfig-paths/register',
			'./tests/setup/global.setup.ts',
		],
		environment: 'node',
	},
	resolve: {
		alias: [
			{
				find: '@/',
				replacement: join(__dirname, 'src') + '/',
			},
		],
	},
	define: {
		'process.env': process.env,
	},
});
