import { timestamp } from 'drizzle-orm/mysql-core';

export const timestamps = {
	created_at: timestamp('created_at').notNull().defaultNow(),
	updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
};
