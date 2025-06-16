import { describe, it, expect, beforeAll } from 'vitest';
import supertest from 'supertest';
import app from '@/app';
import type TestAgent from 'supertest/lib/agent';

describe('Health Routes', () => {
	let request: TestAgent;

	beforeAll(async () => {
		request = supertest(app.server);
	});

	it('GET /health/check should return 200 and an object', async () => {
		const res = await request.get('/health/check');
		expect(res.status).toBe(200);
		expect(res.body).toBeTypeOf('object');
	});
});
