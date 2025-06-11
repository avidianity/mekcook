import { makeSchema } from '@/utils/http';
import { RouteOptions } from 'fastify';

export const check: RouteOptions = {
	method: 'GET',
	url: '/check',
	schema: {
		response: makeSchema({}),
	},
	handler: async (_, reply) => {
		return reply.status(200).send({});
	},
};
