import config from '@/config';
import { db } from '@/db';
import { UnauthorizedException } from '@/exceptions/unauthorized';
import { extractToken } from '@/utils/http';
import { isBlacklisted } from '@/utils/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

export async function verifyUser(request: FastifyRequest, reply: FastifyReply) {
	const token = extractToken(request);

	const { secret, algorithm, issuer } = config.jwt;

	let payload: JwtPayload;

	try {
		const decoded = jwt.verify(token, secret!, {
			algorithms: [algorithm],
			issuer,
		});

		if (typeof decoded === 'string') {
			throw new UnauthorizedException(
				'Invalid token payload',
				401,
				'INVALID_TOKEN'
			);
		}

		if (await isBlacklisted(token)) {
			throw new UnauthorizedException(
				'Invalid or expired token',
				401,
				'TOKEN_INVALID'
			);
		}

		payload = decoded;
	} catch (err) {
		const error = err as Error;

		if (error instanceof UnauthorizedException) {
			throw error;
		}

		throw new UnauthorizedException(
			'Invalid token payload',
			401,
			'INVALID_TOKEN',
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
