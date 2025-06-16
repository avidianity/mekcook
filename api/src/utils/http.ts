import { UnauthorizedException } from '@/exceptions/unauthorized';
import { FastifyRequest } from 'fastify';
import { z, ZodRawShape } from 'zod/v4';
import { normalizeTime } from '@/utils/date';

const timestamp = z.union([z.iso.datetime(), z.date()]);

const recipeSchema = z
	.strictObject({
		id: z.ulid(),
		name: z.string().min(1).max(255),
		ingredients: z.string().nullable(),
		instructions: z.string().nullable(),
		imageId: z.ulid(),
		createdAt: timestamp,
		updatedAt: timestamp,
	})
	.strip();

export const schemas = {
	recipe: recipeSchema,
	schedule: z
		.strictObject({
			id: z.ulid(),
			type: z.string().min(1).max(255),
			day: z.string().min(1).max(255),
			time: z.iso.time().transform(normalizeTime),
			createdAt: timestamp,
			updatedAt: timestamp,
			recipe: recipeSchema,
		})
		.strip(),
	user: z
		.strictObject({
			id: z.ulid(),
			name: z.string().min(1).max(255),
			email: z.email(),
			createdAt: timestamp,
			updatedAt: timestamp,
		})
		.strip(),
	token: z.string(),
	empty: z.string(),
};

export function makeSchema<T extends ZodRawShape>(schema: T, statusCode = 200) {
	return {
		[statusCode]: z
			.strictObject({
				...schema,
				status: z.string().optional(),
				statusCode: z.number().int().min(100).max(599).optional(),
				timestamp: z.iso.datetime().optional(),
			})
			.strip(),
	};
}

export function makeStatus(code: number) {
	if (code === 201) {
		return 'created';
	} else if (code <= 300) {
		return 'ok';
	} else if (code >= 400) {
		return 'error';
	}

	return 'unknown';
}

export function extractToken(request: FastifyRequest) {
	const authHeader = request.headers.authorization;

	if (!authHeader) {
		throw new UnauthorizedException();
	}

	// Split by semicolon and find the Bearer token
	const token = authHeader
		.split(';')
		.map((chunk) => chunk.trim())
		.find((chunk) => chunk.toLowerCase().startsWith('bearer '))
		?.split(' ')[1];

	if (!token) {
		throw new UnauthorizedException();
	}

	return token;
}
