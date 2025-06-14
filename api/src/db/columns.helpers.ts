import { timestamp } from 'drizzle-orm/mysql-core';

export const timestamps = {
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt').notNull().defaultNow().onUpdateNow(),
};
