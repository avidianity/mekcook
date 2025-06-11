import Fastify, { RouteOptions } from 'fastify';
import { NotFoundException } from '@/exceptions/not-found';
import { Exception } from '@/exceptions/base';
import dayjs from 'dayjs';
import config from '@/config';
import { ValidationError } from 'yup';
import * as auth from '@/routes/auth';
import * as health from '@/routes/health';
import { formatStack } from '@/utils/error';
import { makeStatus } from '@/utils/http';

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

app.addHook('onSend', async (_, reply, payload) => {
	const header = reply.getHeader('content-type');
	const isJson = Array.isArray(header)
		? header.includes('application/json')
		: typeof header === 'string' && header.includes('application/json');

	if (isJson && typeof payload === 'string') {
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
			error: 'VALIDATION_ERROR',
			message: error.message,
			details: error.errors,
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
