import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';
import app from '@/app';
import { db } from '@/db';
import { users, recipes } from '@/db/schema';
import * as hash from '@/utils/hash';
import * as jwt from '@/utils/jwt';
import type TestAgent from 'supertest/lib/agent';
import { ulid } from 'ulid';

describe('Recipes Routes', () => {
	let request: TestAgent;
	let token: string;
	let user: { name: string; email: string; password: string };
	let userId: string;

	beforeAll(async () => {
		request = supertest(app.server);
	});

	beforeEach(async () => {
		user = {
			name: faker.person.fullName(),
			email: faker.internet.email(),
			password: faker.internet.password(),
		};

		const passwordHash = await hash.make(user.password);

		const [{ id }] = await db
			.insert(users)
			.values({
				name: user.name,
				email: user.email,
				password: passwordHash,
			})
			.$returningId();

		userId = id;
		const dbUser = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, id),
		});
		token = jwt.sign(dbUser!);
	});

	it('should create a new recipe', async () => {
		const recipe = {
			name: faker.lorem.words(2),
			ingredients: faker.lorem.sentence(),
			instructions: faker.lorem.sentences(2),
			imageId: ulid().toLowerCase(),
		};

		const res = await request
			.post('/recipes')
			.set('Authorization', `Bearer ${token}`)
			.send(recipe);

		expect(res.status).toBe(201);
		expect(res.body.data).toBeDefined();
		expect(res.body.data.name).toBe(recipe.name);
	});

	it('should list recipes for the user', async () => {
		const res = await request
			.get('/recipes')
			.set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
	});

	it('should get a recipe by id', async () => {
		const id = await db
			.insert(recipes)
			.values({
				name: faker.lorem.words(2),
				ingredients: faker.lorem.sentence(),
				instructions: faker.lorem.sentences(2),
				imageId: ulid().toLowerCase(),
				userId,
			})
			.$returningId()
			.then((rows) => rows[0].id);
		const res = await request
			.get(`/recipes/${id}`)
			.set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(200);
	});

	it('should update a recipe', async () => {
		const id = await db
			.insert(recipes)
			.values({
				name: faker.lorem.words(2),
				ingredients: faker.lorem.sentence(),
				instructions: faker.lorem.sentences(2),
				imageId: ulid().toLowerCase(),
				userId,
			})
			.$returningId()
			.then((rows) => rows[0].id);

		const updated = {
			name: faker.lorem.words(3),
			ingredients: faker.lorem.sentence(),
			instructions: faker.lorem.sentences(3),
		};

		const res = await request
			.patch(`/recipes/${id}`)
			.set('Authorization', `Bearer ${token}`)
			.send(updated);

		expect(res.status).toBe(200);
		expect(res.body.data.name).toBe(updated.name);
	});

	it('should delete a recipe', async () => {
		const id = await db
			.insert(recipes)
			.values({
				name: faker.lorem.words(2),
				ingredients: faker.lorem.sentence(),
				instructions: faker.lorem.sentences(2),
				imageId: ulid().toLowerCase(),
				userId,
			})
			.$returningId()
			.then((rows) => rows[0].id);

		const res = await request
			.delete(`/recipes/${id}`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(204);
	});
});
