import jwt, { JwtPayload } from 'jsonwebtoken';
import { users } from '@/db/schema';
import config from '@/config';
import { db } from '@/db';
import { UnauthorizedException } from '@/exceptions/unauthorized';
import { Exception } from '@/exceptions/base';

export function sign<T extends typeof users.$inferSelect>(payload: T) {
	const { secret, algorithm, issuer, expiresIn } = config.jwt;
	if (typeof secret !== 'string' || secret.trim() === '') {
		throw new Exception(
			'JWT_SECRET environment variable is not set',
			500,
			'MISSING_JWT_SECRET'
		);
	}

	const signOptions: jwt.SignOptions = {
		algorithm,
		issuer,
		subject: payload.id,
		audience: payload.id,
		expiresIn,
	};

	if (!['test', 'local'].includes(config.env)) {
		signOptions.expiresIn = '7d';
	}

	return jwt.sign({ user: payload }, secret, signOptions);
}

export async function verify(token: string) {
	const { secret, algorithm, issuer } = config.jwt;
	if (typeof secret !== 'string' || secret.trim() === '') {
		throw new Exception(
			'JWT_SECRET environment variable is not set',
			500,
			'MISSING_JWT_SECRET'
		);
	}

	let payload: JwtPayload;

	try {
		const decoded = jwt.verify(token, secret, {
			algorithms: [algorithm],
			issuer,
		});

		if (typeof decoded === 'string') {
			throw new Exception(
				'Invalid JWT payload type',
				401,
				'INVALID_JWT_PAYLOAD',
				{
					token,
					secret,
					algorithm,
					issuer,
					decoded,
				}
			);
		}

		payload = decoded;
	} catch (err) {
		const error = err as Exception;
		throw new UnauthorizedException(
			'Invalid or expired token',
			401,
			'TOKEN_INVALID',
			error.toJSON(),
			error
		);
	}

	const userId = payload.sub;
	if (!userId) {
		throw new UnauthorizedException(
			'Missing subject claim',
			401,
			'MISSING_SUBJECT'
		);
	}

	const user = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.id, userId),
	});

	if (!user) {
		throw new UnauthorizedException('User not found', 401, 'USER_NOT_FOUND', {
			userId,
		});
	}

	return user;
}
