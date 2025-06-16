import { db } from '@/db';
import { users } from '@/db/schema';
import { BadRequestException } from '@/exceptions/bad-request';
import { Exception } from '@/exceptions/base';
import { verifyUser } from '@/middleware/auth';
import * as hash from '@/utils/hash';
import * as jwt from '@/utils/jwt';
import { extractToken, makeSchema, schemas } from '@/utils/http';
import type { Instance } from '@/app';
import { z } from 'zod/v4';

export default (app: Instance) => {
	app.post('/register', {
		schema: {
			body: z
				.strictObject({
					name: z.string().min(1).max(255),
					email: z.email(),
					password: z.string().min(4).max(255),
				})
				.strip(),
			response: makeSchema({
				user: schemas.user,
				token: schemas.token,
			}),
		},
		async handler({ body }, reply) {
			const result = await db.transaction(async (tx) => {
				const userExists = await tx.query.users.findFirst({
					where: (users, { eq }) => eq(users.email, body.email),
				});

				if (userExists) {
					throw new BadRequestException('User already exists with this email.');
				}

				const password = await hash.make(body.password);

				const [{ id }] = await tx
					.insert(users)
					.values({
						name: body.name,
						email: body.email,
						password,
					})
					.$returningId();

				const user = await tx.query.users.findFirst({
					where: (users, { eq }) => eq(users.id, id),
				});

				if (!user) {
					throw new Exception(
						'User not found after registration.',
						500,
						'USER_NOT_FOUND',
						{
							id,
							email: body.email,
						}
					);
				}

				const token = jwt.sign(user);

				return { user, token };
			});

			return reply.status(201).send(result);
		},
	});

	app.get('/check', {
		preHandler: verifyUser,
		schema: {
			response: makeSchema({
				user: schemas.user,
			}),
		},
		async handler(request, reply) {
			const user = request.user!;
			return reply.status(200).send({
				user,
			});
		},
	});

	app.post('/login', {
		schema: {
			body: z
				.strictObject({
					email: z.email(),
					password: z.string().min(4).max(255),
				})
				.strip(),
			response: makeSchema({
				user: schemas.user,
				token: schemas.token,
			}),
		},
		async handler({ body }, reply) {
			const user = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.email, body.email),
			});

			if (!user) {
				throw new BadRequestException(
					'Invalid email.',
					400,
					'INVALID_EMAIL',
					body
				);
			}

			const isValidPassword = await hash.check(body.password, user.password);

			if (!isValidPassword) {
				throw new BadRequestException(
					'Password is incorrect.',
					400,
					'INVALID_PASSWORD',
					body
				);
			}

			const token = jwt.sign(user);

			return reply.status(200).send({
				user,
				token,
			});
		},
	});

	app.delete('/logout', {
		preHandler: verifyUser,
		schema: {
			response: {
				204: schemas.empty,
			},
		},
		async handler(request, reply) {
			const token = extractToken(request);

			await jwt.invalidate(token);

			reply.status(204).send('');
		},
	});
};
