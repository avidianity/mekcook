import { db } from '@/db';
import { verifyUser } from '@/middleware/auth';
import { makeSchema, schemas } from '@/utils/http';
import { z } from 'zod/v4';
import { Instance } from '@/app';
import { ModelNotFoundException } from '@/exceptions/model-not-found';
import { recipes } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export default (app: Instance) => {
	app.get('/', {
		preHandler: verifyUser,
		schema: {
			response: makeSchema({
				data: z.array(schemas.recipe),
			}),
		},
		async handler(request, reply) {
			const user = request.user!;

			const recipes = await db.query.recipes.findMany({
				where: (recipes, { eq }) => eq(recipes.userId, user.id),
			});

			return reply.status(200).send({
				data: recipes,
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
				data: schemas.recipe,
			}),
		},
		async handler(request, reply) {
			const user = request.user!;
			const { id } = request.params;

			const recipe = await db.query.recipes.findFirst({
				where: (recipes, { eq, and }) =>
					and(eq(recipes.userId, user.id), eq(recipes.id, id)),
			});

			if (!recipe) {
				throw new ModelNotFoundException('Recipe', {
					userId: user.id,
					recipeId: id,
				});
			}

			return reply.status(200).send();
		},
	});

	app.post('/', {
		preHandler: verifyUser,
		schema: {
			body: z
				.strictObject({
					name: z.string().min(1).max(255),
					ingredients: z.string(),
					instructions: z.string(),
				})
				.strip(),
			response: makeSchema(
				{
					data: schemas.recipe,
				},
				201
			),
		},
		async handler(request, reply) {
			const recipe = await db.transaction(async (tx) => {
				const user = request.user!;

				const [{ id }] = await tx
					.insert(recipes)
					.values({
						name: request.body.name,
						ingredients: request.body.ingredients,
						instructions: request.body.instructions,
						userId: user.id,
					})
					.$returningId();

				const recipe = await tx.query.recipes.findFirst({
					where: (recipes, { eq, and }) =>
						and(eq(recipes.userId, user.id), eq(recipes.id, id)),
				});

				if (!recipe) {
					throw new ModelNotFoundException('Recipe', {
						userId: user.id,
						recipeId: id,
					});
				}

				return recipe;
			});

			return reply.status(201).send({
				data: recipe,
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
					name: z.string().min(1).max(255).optional(),
					ingredients: z.string().optional(),
					instructions: z.string().optional(),
				})
				.strip(),
			response: makeSchema({
				data: schemas.recipe,
			}),
		},
		async handler(request, reply) {
			const user = request.user!;
			const { id } = request.params;

			const exists = await db.query.recipes.findFirst({
				where: (recipes, { eq, and }) =>
					and(eq(recipes.userId, user.id), eq(recipes.id, id)),
			});

			if (!exists) {
				throw new ModelNotFoundException('Recipe', {
					userId: user.id,
					recipeId: id,
				});
			}

			const recipe = await db.transaction(async (tx) => {
				await tx
					.update(recipes)
					.set({
						name: request.body.name,
						ingredients: request.body.ingredients,
						instructions: request.body.instructions,
					})
					.where(and(eq(recipes.id, id), eq(recipes.userId, user.id)));

				const recipe = await tx.query.recipes.findFirst({
					where: (recipes, { eq, and }) =>
						and(eq(recipes.userId, user.id), eq(recipes.id, id)),
				});

				if (!recipe) {
					throw new ModelNotFoundException('Recipe', {
						userId: user.id,
						recipeId: id,
						recipe,
					});
				}

				return recipe;
			});

			return reply.status(200).send({
				data: recipe,
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

			const exists = await db.query.recipes.findFirst({
				where: (recipes, { eq, and }) =>
					and(eq(recipes.userId, user.id), eq(recipes.id, id)),
			});

			if (!exists) {
				throw new ModelNotFoundException('Recipe', {
					userId: user.id,
					recipeId: id,
				});
			}

			await db
				.delete(recipes)
				.where(and(eq(recipes.userId, user.id), eq(recipes.id, id)));

			return reply.status(204).send('');
		},
	});
};
