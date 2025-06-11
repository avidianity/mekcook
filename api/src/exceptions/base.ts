import { Exceptions } from '@/types';
import { env } from '@/utils/env';
import { formatStack } from '@/utils/error';
import { inspect } from 'util';

export class Exception extends Error {
	constructor(
		message?: string,
		public statusCode = 500,
		public code = 'INTERNAL_SERVER_ERROR',
		public context?: Exceptions.Context,
		public cause?: Error
	) {
		super(message);
		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.code = code;

		Error.captureStackTrace(this, this.constructor);
	}

	get formattedStack() {
		return formatStack(this.stack);
	}

	toJSON() {
		const base = {
			status: 'error',
			statusCode: this.statusCode,
			code: this.code,
			message: this.message,
		};

		if (env('APP_DEBUG', 'false') === 'true' && this.formattedStack) {
			return {
				...base,
				stack: this.formattedStack,
			};
		}

		return base;
	}

	[inspect.custom]() {
		const object = this.toJSON();

		return {
			...object,
			context: this.context,
			name: this.name,
			stack: this.formattedStack,
		};
	}
}
