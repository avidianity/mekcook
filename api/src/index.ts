import Fastify, { RouteOptions } from 'fastify';
import { NotFoundException } from '@/exceptions/not-found';
import { Exception } from '@/exceptions/base';
import dayjs from 'dayjs';
import config from '@/config';
import { ValidationError } from 'yup';
import * as auth from '@/routes/auth';
import * as health from '@/routes/health';
import { formatStack } from '@/utils/error';

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
});

const register = (routes: Record<string, Record<string, RouteOptions>>) =>
	Object.entries(routes).forEach(([prefix, routes]) =>
		app.register(
			(app) => {
				for (const route of Object.values(routes)) {
					app.route(route);
				}
			},
			{
				prefix,
			}
		)
	);

register({
	auth,
	health,
});

app.setNotFoundHandler((request) => {
	throw new NotFoundException(
		`The requested URL ${request.url} was not found on this server.`
	);
});

app.setErrorHandler((error, request, reply) => {
	const isException = error instanceof Exception;

	const ignore = config.errors.ignore.some(
		(exception) => error instanceof exception
	);

	if (!ignore) {
		request.log.error(error);
	}

	if (ValidationError.isError(error)) {
		return reply.status(400).send({
			status: 'error',
			statusCode: 422,
			error: 'VALIDATION_ERROR',
			message: error.message,
			timestamp: dayjs().toISOString(),
			details: error.errors,
		});
	}

	const response = isException
		? error.toJSON()
		: {
				status: 'error',
				statusCode: 500,
				code: 'INTERNAL_SERVER_ERROR',
				message: error.message,
				timestamp: dayjs().toISOString(),
				...(config.debug && error.stack
					? { stack: formatStack(error.stack) }
					: {}),
		  };

	reply.status(response.statusCode || 500).send(response);
});

app.listen({ port: config.port, host: '0.0.0.0' }).catch((err) => {
	app.log.error(err);
	process.exit(1);
});
