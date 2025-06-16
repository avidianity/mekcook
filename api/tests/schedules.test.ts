import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';
import app from '@/app';
import { db } from '@/db';
import { users, recipes, schedules } from '@/db/schema';
import * as hash from '@/utils/hash';
import * as jwt from '@/utils/jwt';
import type TestAgent from 'supertest/lib/agent';

describe('Schedules Routes', () => {
	let request: TestAgent;
	let token: string;
	let userId: string;
	let recipeId: string;

	beforeAll(async () => {
		request = supertest(app.server);
	});

	beforeEach(async () => {
		const user = {
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

		const [{ id: rId }] = await db
			.insert(recipes)
			.values({
				name: faker.lorem.words(2),
				ingredients: faker.lorem.sentence(),
				instructions: faker.lorem.sentences(2),
				userId,
			})
			.$returningId();
		recipeId = rId;
	});

	it('should create a new schedule', async () => {
		const schedule = {
			day: 'Monday',
			type: 'Lunch',
			time: '12:00:00',
			recipeId,
		};
		const res = await request
			.post('/schedules')
			.set('Authorization', `Bearer ${token}`)
			.send(schedule);

		expect(res.status).toBe(201);
		expect(res.body.data).toBeDefined();
		expect(res.body.data.day).toBe(schedule.day);
		expect(res.body.data.recipe.id).toBe(recipeId);
	});

	it('should list schedules for the user', async () => {
		const [{ id: schedId }] = await db
			.insert(schedules)
			.values({
				day: 'Tuesday',
				type: 'Dinner',
				time: '18:00:00',
				recipeId,
			})
			.$returningId();

		const res = await request
			.get('/schedules')
			.set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.some((s: any) => s.id === schedId)).toBe(true);
	});

	it('should get a schedule by id', async () => {
		const [{ id: schedId }] = await db
			.insert(schedules)
			.values({
				day: 'Wednesday',
				type: 'Breakfast',
				time: '08:00:00',
				recipeId,
			})
			.$returningId();

		const res = await request
			.get(`/schedules/${schedId}`)
			.set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(200);
		expect(res.body.data.id).toBe(schedId);
	});

	it('should update a schedule', async () => {
		const [{ id: schedId }] = await db
			.insert(schedules)
			.values({
				day: 'Thursday',
				type: 'Snack',
				time: '15:00:00',
				recipeId,
			})
			.$returningId();

		const updated = {
			day: 'Friday',
			type: 'Brunch',
			time: '10:30:00',
		};

		const res = await request
			.patch(`/schedules/${schedId}`)
			.set('Authorization', `Bearer ${token}`)
			.send(updated);

		expect(res.status).toBe(200);
		expect(res.body.data.day).toBe(updated.day);
		expect(res.body.data.type).toBe(updated.type);
		expect(res.body.data.time.startsWith('10:30')).toBe(true);
	});

	it('should delete a schedule', async () => {
		const [{ id: schedId }] = await db
			.insert(schedules)
			.values({
				day: 'Saturday',
				type: 'Dinner',
				time: '19:00:00',
				recipeId,
			})
			.$returningId();

		const res = await request
			.delete(`/schedules/${schedId}`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(204);
	});
});
