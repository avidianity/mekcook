import { mysqlTable, varchar, uniqueIndex } from 'drizzle-orm/mysql-core';
import { timestamps } from '@/db/columns.helpers';
import { ulid } from 'ulid';

export const users = mysqlTable(
	'users',
	{
		id: varchar('id', { length: 26 })
			.notNull()
			.primaryKey()
			.$defaultFn(() => ulid().toLowerCase()),
		name: varchar('name', { length: 255 }).notNull(),
		email: varchar('email', { length: 255 }).notNull(),
		password: varchar('password', { length: 255 }).notNull(),
		...timestamps,
	},
	(table) => {
		return [uniqueIndex('users_table_email_unique').on(table.email)];
	}
);
