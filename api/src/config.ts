import 'dotenv/config';
import { Algorithm } from 'jsonwebtoken';
import { StringValue } from 'ms';
import { NotFoundException } from '@/exceptions/not-found';
import { env } from '@/utils/env';
import path from 'path';

export default {
	name: env('APP_NAME', 'MekCook'),
	env: env('APP_ENV', 'local') as 'local' | 'production' | 'test',
	debug: env('APP_DEBUG', 'false') === 'true',
	port: env('APP_PORT')
		? parseInt(env('APP_PORT', '8000') as string)
		: undefined,
	jwt: {
		secret: env('JWT_SECRET'),
		expiresIn: env('JWT_EXPIRES_IN', '30d') as StringValue,
		algorithm: env('JWT_ALGORITHM', 'HS256') as Algorithm,
		issuer: env('JWT_ISSUER', env('APP_NAME')) || 'MekCook',
		blacklist: {
			path: path.resolve(__dirname, '../storage/jwt/blacklist.json'),
			maxSize: parseInt(env('JWT_MAX_BLACKLIST_SIZE', '10000')!),
		},
	},
	storage: {
		path: path.resolve(__dirname, '../storage/uploads'),
	},
	errors: {
		ignore: [NotFoundException],
	},
} as const;
