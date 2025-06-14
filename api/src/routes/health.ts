import { makeSchema } from '@/utils/http';
import { Instance } from '@/index';

export default (app: Instance) => {
	app.get('/check', {
		schema: {
			response: makeSchema({}),
		},
		async handler(_, reply) {
			return reply.status(200).send({});
		},
	});
};
