import Fastify from 'fastify';
import { NotFoundException } from '@/exceptions/not-found';
import { Exception } from '@/exceptions/base';
import dayjs from 'dayjs';
import config from '@/config';
import { formatStack } from '@/utils/error';
import { makeStatus } from '@/utils/http';
import z, { ZodError } from 'zod/v4';
import {
	hasZodFastifySchemaValidationErrors,
	isResponseSerializationError,
	serializerCompiler,
	validatorCompiler,
	ZodTypeProvider,
} from 'fastify-type-provider-zod';
import auth from '@/routes/auth';
import health from '@/routes/health';
import recipes from '@/routes/recipes';

const app = Fastify({
	logger: config.debug
		? {
				level: 'debug',
				transport: {
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'SYS:standard',
						ignore: 'pid,hostname',
					},
				},
		  }
		: false,
	disableRequestLogging: true,
})
	.setValidatorCompiler(validatorCompiler)
	.setSerializerCompiler(serializerCompiler)
	.withTypeProvider<ZodTypeProvider>();

export type Instance = typeof app;

app.addHook('onSend', async (_, reply, payload) => {
	const header = reply.getHeader('content-type');
	const isJson = Array.isArray(header)
		? header.includes('application/json')
		: typeof header === 'string' && header.includes('application/json');

	if (isJson && typeof payload === 'string' && reply.statusCode !== 204) {
		try {
			const data = JSON.parse(payload);

			const modified = {
				...data,
				status: makeStatus(reply.statusCode),
				statusCode: reply.statusCode,
				timestamp: dayjs().toISOString(),
			};

			return JSON.stringify(modified);
		} catch (err) {
			return payload;
		}
	}

	return payload;
});

function register<T extends (app: Instance) => void>(items: Record<string, T>) {
	for (const [prefix, register] of Object.entries(items)) {
		app.register((app) => register(app), {
			prefix,
		});
	}
}

register({
	auth,
	health,
	recipes,
});

app.setNotFoundHandler((request) => {
	throw new NotFoundException(
		`The requested URL ${request.url} was not found on this server.`
	);
});

app.setErrorHandler((error: any, request, reply) => {
	const isException = error instanceof Exception;

	const ignore = config.errors.ignore.some(
		(exception) => error instanceof exception
	);

	if (!ignore) {
		request.log.error(error);
	}

	if (error instanceof ZodError) {
		return reply.status(422).send({
			code: 'VALIDATION_ERROR',
			message: 'Invalid input',
			details: z.treeifyError(error),
		});
	} else if (hasZodFastifySchemaValidationErrors(error)) {
		return reply.code(422).send({
			code: 'VALIDATION_ERROR',
			message: 'Invalid input',
			details: error.validation,
		});
	} else if (isResponseSerializationError(error)) {
		return reply.code(500).send({
			code: 'INTERNAL_SERVER_ERROR',
			message: "Response doesn't match the schema",
			statusCode: 500,
			...(config.debug
				? {
						details: {
							issues: error.cause.issues,
							method: error.method,
							url: error.url,
						},
				  }
				: {}),
		});
	}

	const response = isException
		? error.toJSON()
		: {
				code: 'INTERNAL_SERVER_ERROR',
				message: error.message,
				...(config.debug && error.stack
					? { stack: formatStack(error.stack) }
					: {}),
				...(config.debug && error.cause
					? {
							cause: error.cause,
					  }
					: {}),
		  };

	const statusCode =
		'statusCode' in response && typeof response.statusCode === 'number'
			? response.statusCode
			: 500;

	reply.status(statusCode).send(response);
});

app.listen({ port: config.port, host: '0.0.0.0' }).catch((err) => {
	app.log.error(err);
	process.exit(1);
});
