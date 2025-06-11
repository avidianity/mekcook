import { db } from '@/db';
import { users } from '@/db/schema';
import { BadRequestException } from '@/exceptions/bad-request';
import { Exception } from '@/exceptions/base';
import { verifyUser } from '@/middleware/auth';
import * as hash from '@/utils/hash';
import * as jwt from '@/utils/jwt';
import validators from '@/validators';
import dayjs from 'dayjs';
import { RouteOptions } from 'fastify';
import { omit } from 'lodash-es';

export const register: RouteOptions = {
	method: 'POST',
	url: '/register',
	schema: {
		response: {
			200: {
				type: 'object',
				properties: {
					user: {
						type: 'object',
						properties: {
							id: { type: 'string', format: 'uuid' },
							name: { type: 'string', minLength: 1, maxLength: 255 },
							email: { type: 'string', format: 'email' },
							createdAt: { type: 'string', format: 'date-time' },
							updatedAt: { type: 'string', format: 'date-time' },
						},
					},
					status: { type: 'string' },
					statusCode: { type: 'integer' },
					timestamp: { type: 'string', format: 'date-time' },
					token: { type: 'string' },
				},
			},
		},
	},
	handler: async (request, reply) => {
		const body = await validators.auth.register.validate(request.body);

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

		return reply.status(201).send({
			user: omit(result.user, ['password']),
			status: 'created',
			statusCode: 201,
			timestamp: dayjs().toISOString(),
			token: result.token,
		});
	},
};

export const check: RouteOptions = {
	method: 'GET',
	url: '/check',
	preHandler: verifyUser,
	schema: {
		response: {
			200: {
				type: 'object',
				properties: {
					user: {
						type: 'object',
						properties: {
							id: { type: 'string', format: 'uuid' },
							name: { type: 'string' },
							email: { type: 'string', format: 'email' },
							createdAt: { type: 'string', format: 'date-time' },
							updatedAt: { type: 'string', format: 'date-time' },
						},
					},
				},
			},
		},
	},
	handler: async (request, reply) => {
		const user = request.user!;
		return reply.status(200).send({ user: omit(user, ['password']) });
	},
};

export const login: RouteOptions = {
	method: 'POST',
	url: '/login',
	schema: {
		response: {
			200: {
				type: 'object',
				properties: {
					user: {
						type: 'object',
						properties: {
							id: { type: 'string', format: 'uuid' },
							name: { type: 'string', minLength: 1, maxLength: 255 },
							email: { type: 'string', format: 'email' },
							createdAt: { type: 'string', format: 'date-time' },
							updatedAt: { type: 'string', format: 'date-time' },
						},
					},
					status: { type: 'string' },
					statusCode: { type: 'integer' },
					timestamp: { type: 'string', format: 'date-time' },
					token: { type: 'string' },
				},
			},
		},
	},
	handler: async (request, reply) => {
		const body = await validators.auth.login.validate(request.body);

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

		const isValidPassword = await hash.check(user.password, body.password);

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
			user: omit(user, ['password']),
			status: 'ok',
			statusCode: 200,
			timestamp: dayjs().toISOString(),
			token,
		});
	},
};
