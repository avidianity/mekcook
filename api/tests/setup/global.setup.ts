import { beforeAll, beforeEach } from 'vitest';
import { setupDb } from './base.setup';
import app from '@/app';

beforeAll(async () => {
	await setupDb();
});

beforeEach(async () => {
	await app.ready();
});
