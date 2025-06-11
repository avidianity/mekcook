import config from '@/config';
import { db } from '@/db';
import { Exception } from '@/exceptions/base';
import { UnauthorizedException } from '@/exceptions/unauthorized';
import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

export async function verifyUser(request: FastifyRequest, reply: FastifyReply) {
	const authHeader = request.headers.authorization;

	if (!authHeader) {
		return reply.status(401).send({ message: 'Missing Authorization header' });
	}

	// Split by semicolon and find the Bearer token
	const token = authHeader
		.split(';')
		.map((chunk) => chunk.trim())
		.find((chunk) => chunk.toLowerCase().startsWith('bearer '))
		?.split(' ')[1];

	if (!token) {
		return reply
			.status(401)
			.send({ message: 'Bearer token not found in Authorization header' });
	}

	const { secret, algorithm, issuer } = config.jwt;

	let payload: JwtPayload;

	try {
		const decoded = jwt.verify(token, secret!, {
			algorithms: [algorithm],
			issuer,
		});

		if (typeof decoded === 'string')
			throw new UnauthorizedException(
				'Invalid token payload',
				401,
				'INVALID_TOKEN'
			);
		payload = decoded;
	} catch (err) {
		const error = err as Error;
		throw new Exception(
			error.message,
			500,
			'TOKEN_VERIFICATION_FAILED',
			{
				token,
				secret,
				algorithm,
				issuer,
			},
			error
		);
	}

	const userId = payload.sub;
	if (!userId) {
		throw new UnauthorizedException(
			'Missing subject claim',
			401,
			'MISSING_SUBJECT',
			payload
		);
	}

	const user = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.id, userId),
	});

	if (!user) {
		throw new UnauthorizedException('User not found', 401, 'USER_NOT_FOUND', {
			userId,
			payload,
		});
	}

	request.user = user;
}
