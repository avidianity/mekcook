import { Exception } from '@/exceptions/base';

export class UnauthorizedException extends Exception {
	constructor(
		message = 'Unauthorized',
		statusCode = 401,
		code = 'UNAUTHORIZED',
		context?: Record<string, any>,
		cause?: Error
	) {
		super(message, statusCode, code, context, cause);
	}
}
