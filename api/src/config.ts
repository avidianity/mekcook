import 'dotenv/config';
import { Algorithm } from 'jsonwebtoken';
import { StringValue } from 'ms';
import { NotFoundException } from '@/exceptions/not-found';
import { env } from '@/utils/env';

export default {
	env: env('APP_ENV', 'local') as 'local' | 'production' | 'test',
	debug: env('APP_DEBUG', 'false') === 'true',
	port: parseInt(env('APP_PORT', '8000') as string),
	jwt: {
		secret: env('JWT_SECRET'),
		expiresIn: env('JWT_EXPIRES_IN', '30d') as StringValue,
		algorithm: env('JWT_ALGORITHM', 'HS256') as Algorithm,
		issuer: env('JWT_ISSUER', env('APP_NAME')) || 'MekCook',
	},
	errors: {
		ignore: [NotFoundException],
	},
} as const;
