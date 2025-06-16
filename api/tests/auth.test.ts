import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';
import app from '@/app';
import { db } from '@/db';
import { users } from '@/db/schema';
import * as hash from '@/utils/hash';
import * as jwt from '@/utils/jwt';
import type TestAgent from 'supertest/lib/agent';

describe('Auth Routes', () => {
	let request: TestAgent;
	let testUser: { name: string; email: string; password: string };
	let token: string;

	beforeAll(async () => {
		request = supertest(app.server);
	});

	beforeEach(async () => {
		testUser = {
			name: faker.person.fullName(),
			email: faker.internet.email(),
			password: faker.internet.password(),
		};
	});

	it('should register a new user', async () => {
		const res = await request.post('/auth/register').send(testUser);
		expect(res.status).toBe(201);
		expect(res.body.user).toBeDefined();
		expect(res.body.token).toBeTypeOf('string');
	});

	it('should not register with duplicate email', async () => {
		const passwordHash = await hash.make(testUser.password);

		const [{ id }] = await db
			.insert(users)
			.values({
				name: testUser.name,
				email: testUser.email,
				password: passwordHash,
			})
			.$returningId();

		const res = await request.post('/auth/register').send({
			name: testUser.name,
			email: testUser.email,
			password: testUser.password,
		});
		expect(res.status).toBe(400);
		expect(res.body.code).toBe('BAD_REQUEST');
	});

	it('should login with correct credentials', async () => {
		// Create user directly
		const passwordHash = await hash.make(testUser.password);
		await db.insert(users).values({
			name: testUser.name,
			email: testUser.email,
			password: passwordHash,
		});
		const res = await request.post('/auth/login').send({
			email: testUser.email,
			password: testUser.password,
		});
		expect(res.status).toBe(200);
		expect(res.body.user).toBeDefined();
		expect(res.body.token).toBeTypeOf('string');
	});

	it('should not login with wrong password', async () => {
		// Create user directly
		const passwordHash = await hash.make(testUser.password);
		await db.insert(users).values({
			name: testUser.name,
			email: testUser.email,
			password: passwordHash,
		});
		const res = await request.post('/auth/login').send({
			email: testUser.email,
			password: 'wrongpassword',
		});
		expect(res.status).toBe(400);
		expect(res.body.code).toBe('INVALID_PASSWORD');
	});

	it('should check user with valid token', async () => {
		// Create user directly and generate token
		const passwordHash = await hash.make(testUser.password);
		const [{ id }] = await db
			.insert(users)
			.values({
				name: testUser.name,
				email: testUser.email,
				password: passwordHash,
			})
			.$returningId();
		const dbUser = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, id),
		});
		token = jwt.sign(dbUser!);

		const res = await request
			.get('/auth/check')
			.set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(200);
		expect(res.body.user).toBeDefined();
	});

	it('should logout user', async () => {
		// Create user directly and generate token
		const passwordHash = await hash.make(testUser.password);
		const [{ id }] = await db
			.insert(users)
			.values({
				name: testUser.name,
				email: testUser.email,
				password: passwordHash,
			})
			.$returningId();
		const dbUser = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, id),
		});
		token = jwt.sign(dbUser!);

		const res = await request
			.delete('/auth/logout')
			.set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(204);
	});
});
