import { mysqlTable, varchar, int, timestamp, text, boolean } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Tabla de configuración del bot
export const botSettings = mysqlTable('bot_settings', {
  id: int('id').primaryKey().autoincrement(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Tabla de eventos
export const events = mysqlTable('events', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  location: varchar('location', { length: 500 }).notNull(),
  mapsLink: varchar('maps_link', { length: 1000 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Tabla de ponentes
export const speakers = mysqlTable('speakers', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  bio: text('bio'),
  topic: varchar('topic', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Tabla de horarios
export const schedules = mysqlTable('schedules', {
  id: int('id').primaryKey().autoincrement(),
  eventId: int('event_id').notNull(),
  speakerId: int('speaker_id').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  reminderSent: boolean('reminder_sent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Tabla de suscriptores
export const subscribers = mysqlTable('subscribers', {
  id: int('id').primaryKey().autoincrement(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  eventId: int('event_id').notNull(),
  isActive: boolean('is_active').default(true),
  subscribedAt: timestamp('subscribed_at').defaultNow(),
});

// Relaciones
export const eventsRelations = relations(events, ({ many }) => ({
  schedules: many(schedules),
  subscribers: many(subscribers),
}));

export const speakersRelations = relations(speakers, ({ many }) => ({
  schedules: many(schedules),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
  event: one(events, {
    fields: [schedules.eventId],
    references: [events.id],
  }),
  speaker: one(speakers, {
    fields: [schedules.speakerId],
    references: [speakers.id],
  }),
}));

export const subscribersRelations = relations(subscribers, ({ one }) => ({
  event: one(events, {
    fields: [subscribers.eventId],
    references: [events.id],
  }),
}));