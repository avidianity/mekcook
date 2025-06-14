import { mysqlTable, varchar, uniqueIndex, text } from 'drizzle-orm/mysql-core';
import { timestamps } from '@/db/columns.helpers';
import { ulid } from 'ulid';
import { relations } from 'drizzle-orm';

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

export const recipes = mysqlTable('recipes', {
	id: varchar('id', { length: 26 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => ulid().toLowerCase()),
	name: varchar('name', { length: 255 }).notNull(),
	ingredients: text('ingredients'),
	instructions: text('instructions'),
	userId: varchar('userId', { length: 26 })
		.notNull()
		.references(() => users.id),
	...timestamps,
});

export const usersRelations = relations(users, ({ many }) => ({
	recipes: many(recipes),
}));

export const recipesRelations = relations(recipes, ({ one }) => ({
	user: one(users, {
		fields: [recipes.userId],
		references: [users.id],
	}),
}));
