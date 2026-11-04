import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
export const rounds = sqliteTable('rounds', {
 id:text('id').primaryKey(), title:text('title').notNull(), theme:text('theme').notNull(), description:text('description').notNull().default(''),
});
export const editions = sqliteTable('editions', {
 id:text('id').primaryKey(), roundId:text('round_id').notNull().references(()=>rounds.id),
 title:text('title').notNull(), startsAt:text('starts_at').notNull(), endsAt:text('ends_at').notNull(),
 location:text('location').notNull(), address:text('address').notNull(), priceCents:integer('price_cents').notNull(),
 capacity:integer('capacity').notNull(), open:integer('open',{mode:'boolean'}).notNull().default(false),
 closesAt:text('closes_at').notNull(), paymentUrl:text('payment_url'),
 paymentExpiresAt:text('payment_expires_at'),version:integer('version').notNull().default(0),
});
export const bookings = sqliteTable('bookings',{
 id:text('id').primaryKey(), requestId:text('request_id').notNull().unique(), editionId:text('edition_id').notNull().references(()=>editions.id),
 name:text('name').notNull(), email:text('email').notNull(), phone:text('phone').notNull(),
 people:integer('people').notNull(), totalCents:integer('total_cents').notNull(),
 status:text('status').notNull().default('awaiting_payment'), createdAt:text('created_at').notNull(),
 paidAt:text('paid_at'),paidBy:text('paid_by'),
},t=>[uniqueIndex('booking_email_edition').on(t.email,t.editionId),index('booking_edition_status').on(t.editionId,t.status)]);

export const contacts = sqliteTable('contacts', {
 email:text('email').primaryKey(), name:text('name').notNull().default(''), phone:text('phone').notNull().default(''),
 invite:integer('invite',{mode:'boolean'}).notNull().default(true), source:text('source').notNull().default('Import'), updatedAt:text('updated_at').notNull(),
});
