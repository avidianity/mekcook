import bcrypt from 'bcrypt';
import { Exception } from '@/exceptions/base';
import crypto from 'crypto';

export function make(value: string) {
	const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
	if (isNaN(rounds) || rounds < 1) {
		throw new Exception(
			'Invalid BCRYPT_ROUNDS environment variable',
			500,
			'INVALID_BCRYPT_ROUNDS',
			{
				rounds,
			}
		);
	}

	return bcrypt.hash(value, rounds);
}

export function check(value: string, hash: string) {
	return bcrypt.compare(value, hash);
}

export function sha256(token: string) {
	return crypto.createHash('sha256').update(token).digest('hex');
}
