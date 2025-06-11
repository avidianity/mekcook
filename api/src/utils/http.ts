import { UnauthorizedException } from '@/exceptions/unauthorized';
import { FastifyRequest } from 'fastify';

export function makeSchema<T extends Record<string, any>>(schema: T) {
	return {
		200: {
			type: 'object',
			properties: {
				...schema,
				status: { type: 'string' },
				statusCode: { type: 'integer' },
				timestamp: { type: 'string', format: 'date-time' },
			},
		},
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
