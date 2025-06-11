import dayjs from 'dayjs';
import { RouteOptions } from 'fastify';

export const check: RouteOptions = {
	method: 'GET',
	url: '/check',
	schema: {
		response: {
			200: {
				type: 'object',
				properties: {
					status: { type: 'string' },
					timestamp: { type: 'string', format: 'date-time' },
				},
			},
		},
	},
	handler: async (_, reply) => {
		return reply.status(200).send({
			status: 'ok',
			statusCode: 200,
			timestamp: dayjs().toISOString(),
		});
	},
};
