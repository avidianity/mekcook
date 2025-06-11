import { Exception } from '@/exceptions/base';
import { Exceptions } from '@/types';

export class BadRequestException extends Exception {
	constructor(
		message = 'Bad Request',
		statusCode = 400,
		code = 'BAD_REQUEST',
		context?: Exceptions.Context
	) {
		super(message, statusCode, code, context);

		this.stack = undefined;
	}
}
