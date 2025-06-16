import { db } from '@/db';
import { verifyUser } from '@/middleware/auth';
import { makeSchema, schemas } from '@/utils/http';
import { z } from 'zod/v4';
import { Instance } from '@/app';
import { ModelNotFoundException } from '@/exceptions/model-not-found';
import { recipes, schedules, users } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { normalizeTime } from '@/utils/date';

export default (app: Instance) => {
	app.get('/', {
		preHandler: verifyUser,
		schema: {
			querystring: z
				.strictObject({
					recipeId: z.string().optional(),
				})
				.strip(),
			response: makeSchema({
				data: z.array(schemas.schedule),
			}),
		},
		async handler(request, reply) {
			const { recipeId } = request.query;
			const user = request.user!;

			const conditions = [eq(recipes.userId, user.id)];

			if (recipeId) {
				conditions.push(eq(schedules.recipeId, recipeId));
			}

			const data = await db
				.select({
					schedule: schedules,
					recipe: recipes,
				})
				.from(schedules)
				.innerJoin(recipes, eq(schedules.recipeId, recipes.id))
				.where(and(...conditions));

			return reply.status(200).send({
				data: data.map((item) => ({
					...item.schedule,
					recipe: item.recipe,
				})),
			});
		},
	});

	app.get('/:id', {
		preHandler: verifyUser,
		schema: {
			params: z
				.strictObject({
					id: z.ulid(),
				})
				.strip(),
			response: makeSchema({
				data: schemas.schedule,
			}),
		},
		async handler(request, reply) {
			const user = request.user!;
			const { id } = request.params;

			const data = await db
				.select({
					schedule: schedules,
					recipe: recipes,
				})
				.from(schedules)
				.innerJoin(recipes, eq(schedules.recipeId, recipes.id))
				.where(and(eq(schedules.id, id), eq(recipes.userId, user.id)))
				.then((res) => res[0]);

			if (!data) {
				throw new ModelNotFoundException('Schedule', {
					userId: user.id,
					scheduleId: id,
				});
			}

			return reply.status(200).send({
				data: {
					...data.schedule,
					recipe: data.recipe,
				},
			});
		},
	});

	app.post('/', {
		preHandler: verifyUser,
		schema: {
			body: z
				.strictObject({
					day: z.string(),
					type: z.string(),
					time: z.iso.time().transform(normalizeTime),
					recipeId: z.ulid(),
				})
				.strip(),
			response: makeSchema(
				{
					data: schemas.schedule,
				},
				201
			),
		},
		async handler(request, reply) {
			const user = request.user!;
			const { day, recipeId, type, time } = request.body;

			const recipe = await db.query.recipes.findFirst({
				where: (recipes, { eq, and }) =>
					and(eq(recipes.id, recipeId), eq(recipes.userId, user.id)),
			});

			if (!recipe) {
				throw new ModelNotFoundException('Recipe', {
					userId: user.id,
					recipeId,
				});
			}

			const [{ id }] = await db
				.insert(schedules)
				.values({
					day,
					type,
					time,
					recipeId,
				})
				.$returningId();

			const schedule = await db.query.schedules.findFirst({
				where: (schedules, { eq }) => eq(schedules.id, id),
				with: {
					recipe: true,
				},
			});

			return reply.status(201).send({
				data: schedule!,
			});
		},
	});

	app.route({
		url: '/:id',
		method: ['PUT', 'PATCH'],
		preHandler: verifyUser,
		schema: {
			params: z
				.strictObject({
					id: z.ulid(),
				})
				.strip(),
			body: z
				.strictObject({
					day: z.string().optional(),
					type: z.string().optional(),
					time: z.iso.time().transform(normalizeTime).optional(),
				})
				.strip(),
			response: makeSchema({
				data: schemas.schedule,
			}),
		},
		async handler(request, reply) {
			const user = request.user!;
			const { id } = request.params;

			// Join schedule -> recipe to check user ownership
			const schedule = await db
				.select({
					schedule: schedules,
					recipe: recipes,
				})
				.from(schedules)
				.innerJoin(recipes, eq(schedules.recipeId, recipes.id))
				.where(and(eq(schedules.id, id), eq(recipes.userId, user.id)))
				.then((res) => res[0]);

			if (!schedule) {
				throw new ModelNotFoundException('Schedule', {
					userId: user.id,
					scheduleId: id,
				});
			}

			await db
				.update(schedules)
				.set({
					day: request.body.day,
					type: request.body.type,
					time: request.body.time,
				})
				.where(eq(schedules.id, id));

			const updated = await db.query.schedules.findFirst({
				where: (schedules, { eq }) => eq(schedules.id, id),
				with: {
					recipe: true,
				},
			});

			return reply.status(200).send({
				data: updated!,
			});
		},
	});

	app.delete('/:id', {
		preHandler: verifyUser,
		schema: {
			params: z
				.strictObject({
					id: z.ulid(),
				})
				.strip(),
			response: {
				204: schemas.empty,
			},
		},
		async handler(request, reply) {
			const user = request.user!;
			const { id } = request.params;

			const schedule = await db
				.select({
					schedule: schedules,
					recipe: recipes,
				})
				.from(schedules)
				.innerJoin(recipes, eq(schedules.recipeId, recipes.id))
				.where(and(eq(schedules.id, id), eq(recipes.userId, user.id)))
				.then((res) => res[0]);

			if (!schedule) {
				throw new ModelNotFoundException('Schedule', {
					userId: user.id,
					scheduleId: id,
				});
			}

			await db.delete(schedules).where(eq(schedules.id, id));

			return reply.status(204).send('');
		},
	});
};
