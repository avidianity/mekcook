import { users } from '@/db/schema';

export namespace Exceptions {
	export type Context = Record<string, unknown>;
}

declare module 'fastify' {
	interface FastifyRequest {
		user?: Omit<typeof users.$inferSelect, 'password'>;
	}
}
