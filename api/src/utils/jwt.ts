import jwt, { JwtPayload } from 'jsonwebtoken';
import { users } from '@/db/schema';
import config from '@/config';
import { db } from '@/db';
import { UnauthorizedException } from '@/exceptions/unauthorized';
import { Exception } from '@/exceptions/base';
import fs from 'fs/promises';
import path from 'path';
import dayjs from 'dayjs';
import { Mutex } from 'async-mutex';
import { sha256 } from '@/utils/hash';

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

const BLACKLIST_PATH = config.jwt.blacklist.path;
const MAX_BLACKLIST_SIZE = config.jwt.blacklist.maxSize;
const blacklistMutex = new Mutex();

type BlacklistMap = Record<string, { expiry: string }>;

async function readBlacklist(): Promise<BlacklistMap> {
	try {
		const data = await fs.readFile(BLACKLIST_PATH, 'utf-8');
		const obj = JSON.parse(data);
		// Remove expired entries
		const now = new Date();
		let changed = false;
		for (const [hash, entry] of Object.entries(obj) as any) {
			if (dayjs(entry.expiry).isBefore(now)) {
				delete obj[hash];
				changed = true;
			}
		}
		// Limit file growth: keep only the most recent MAX_BLACKLIST_SIZE entries
		const hashes = Object.keys(obj);
		if (hashes.length > MAX_BLACKLIST_SIZE) {
			const sorted = hashes
				.map((hash) => ({ hash, expiry: obj[hash].expiry }))
				.sort((a, b) => dayjs(a.expiry).unix() - dayjs(b.expiry).unix());
			for (let i = 0; i < sorted.length - MAX_BLACKLIST_SIZE; ++i) {
				delete obj[sorted[i].hash];
				changed = true;
			}
		}
		if (changed) {
			await fs.writeFile(BLACKLIST_PATH, JSON.stringify(obj));
		}
		return obj;
	} catch (error) {
		console.error('Error reading blacklist file:', error);
		return {};
	}
}

export async function invalidate(token: string) {
	await blacklistMutex.runExclusive(async () => {
		const decoded = jwt.decode(token) as JwtPayload | null;
		if (!decoded || typeof decoded.exp !== 'number') {
			throw new Exception(
				'Invalid token for blacklisting',
				500,
				'INVALID_TOKEN'
			);
		}
		const expiry = dayjs.unix(decoded.exp).toISOString();
		const hash = sha256(token);
		const map = await readBlacklist();
		map[hash] = { expiry };

		await fs.mkdir(path.dirname(BLACKLIST_PATH), { recursive: true });
		await fs.writeFile(BLACKLIST_PATH, JSON.stringify(map));
	});
}

export async function isBlacklisted(token: string): Promise<boolean> {
	return blacklistMutex.runExclusive(async () => {
		const map = await readBlacklist();
		const hash = sha256(token);
		return !!map[hash];
	});
}
