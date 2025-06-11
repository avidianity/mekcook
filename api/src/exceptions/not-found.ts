import { Exception } from '@/exceptions/base';
import { Exceptions } from '@/types';

export class NotFoundException extends Exception {
	constructor(
		message = 'The requested resource was not found.',
		statusCode = 404,
		code = 'NOT_FOUND',
		context?: Exceptions.Context
	) {
		super(message, statusCode, code, context);

		this.stack = undefined;
	}
}
