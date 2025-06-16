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
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	ZodTypeProvider,
} from 'fastify-type-provider-zod';
import auth from '@/routes/auth';
import health from '@/routes/health';
import recipes from '@/routes/recipes';
import schedules from '@/routes/schedules';
import fastifySwagger from '@fastify/swagger';
import pkg from '../package.json';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { startCase } from 'lodash-es';

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

const routes = {
	auth,
	health,
	recipes,
	schedules,
};

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: config.name!,
			description: '',
			version: pkg.version,
		},
		servers: [],
	},
	hideUntagged: true,
	transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
	routePrefix: '/docs',
});

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
		app.register(
			(app) => {
				app.addHook('onRoute', (route) => {
					route.schema ??= {};

					const tag = prefix.replace(/^\//, '');
					const tagLabel = startCase(tag);
					const singular = tagLabel.endsWith('s')
						? tagLabel.slice(0, -1)
						: tagLabel;

					route.schema.tags = [tagLabel];

					const method = Array.isArray(route.method)
						? route.method[0].toUpperCase()
						: route.method.toUpperCase();

					const path = route.url.replace(/^\//, '');

					let opName = '';

					const isCrudLike = path === '' || /^:id$|^.+\/:id$/.test(path);

					if (isCrudLike) {
						if (method === 'GET' && path === '') {
							opName = `List ${tagLabel}`;
						} else if (method === 'GET') {
							opName = `Get ${singular} by ID`;
						} else if (method === 'POST') {
							opName = `Create ${singular}`;
						} else if (['PUT', 'PATCH'].includes(method)) {
							opName = `Update ${singular}`;
						} else if (method === 'DELETE') {
							opName = `Delete ${singular}`;
						}
					} else {
						const pathLabel = startCase(path.split('/').pop() || '');
						opName = pathLabel;
					}

					route.schema.operationId = opName;
					route.schema.summary ??= opName;
				});

				register(app);
			},
			{ prefix }
		);
	}
}

register(routes);

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

	if (!ignore && !error.ignore) {
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

export async function run() {
	try {
		await app.listen({ port: config.port, host: '0.0.0.0' });
	} catch (error) {
		console.trace(error);
		process.exit(1);
	}
}

export type Instance = typeof app;
export default app;
