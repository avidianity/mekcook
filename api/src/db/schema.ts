import {
	mysqlTable,
	varchar,
	uniqueIndex,
	text,
	time,
} from 'drizzle-orm/mysql-core';
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
		.references(() => users.id, { onDelete: 'cascade' }),
	...timestamps,
});

export const schedules = mysqlTable('schedules', {
	id: varchar('id', { length: 26 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => ulid().toLowerCase()),
	type: varchar('type', { length: 255 }).notNull(),
	day: varchar('day', { length: 255 }).notNull(),
	time: time('time').notNull(),
	recipeId: varchar('recipeId', { length: 26 })
		.notNull()
		.references(() => recipes.id, { onDelete: 'cascade' }),
	...timestamps,
});

export const usersRelations = relations(users, ({ many }) => ({
	recipes: many(recipes),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
	user: one(users, {
		fields: [recipes.userId],
		references: [users.id],
	}),
	schedules: many(schedules),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
	recipe: one(recipes, {
		fields: [schedules.recipeId],
		references: [recipes.id],
	}),
}));
