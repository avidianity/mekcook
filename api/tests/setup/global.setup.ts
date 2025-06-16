import { beforeEach } from 'vitest';
import app from '@/app';

beforeEach(async () => {
	await app.ready();
});
