import { eq, and, lt, sql } from 'drizzle-orm';
import { db } from '../../../../Infrastructure/database/db';
import { events, speakers, schedules, subscribers, botSettings } from '../../../../Infrastructure/database/schema';
import {
  EventRepository,
  SpeakerRepository,
  ScheduleRepository,
  SubscriberRepository,
  BotSettingsRepository,
} from '../../../domain/repositories';
import { Event, Speaker, Schedule, Subscriber, BotSettings } from '../../../domain/entities';

// Implementación del repositorio de eventos
export class MySQLEventRepository implements EventRepository {
  async create(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const [result] = await db.insert(events).values(event);
    const createdEvent = await db.select().from(events).where(eq(events.id, result.insertId));
    return createdEvent[0] as Event;
  }

  async findById(id: number): Promise<Event | null> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0] as Event || null;
  }

  async findAll(): Promise<Event[]> {
    const result = await db.select().from(events);
    return result as Event[];
  }

  async findActive(): Promise<Event[]> {
    const result = await db.select().from(events).where(eq(events.isActive, true));
    return result as Event[];
  }

  async update(id: number, event: Partial<Event>): Promise<Event | null> {
    await db.update(events).set(event).where(eq(events.id, id));
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    await db.delete(events).where(eq(events.id, id)); // Ejecuta la operación
    return true; // Asume éxito si no hay error
  }
}

// Implementación del repositorio de ponentes
export class MySQLSpeakerRepository implements SpeakerRepository {
  async create(speaker: Omit<Speaker, 'id' | 'createdAt' | 'updatedAt'>): Promise<Speaker> {
    const [result] = await db.insert(speakers).values(speaker);
    const createdSpeaker = await db.select().from(speakers).where(eq(speakers.id, result.insertId));
    return createdSpeaker[0] as Speaker;
  }

  async findById(id: number): Promise<Speaker | null> {
    const result = await db.select().from(speakers).where(eq(speakers.id, id));
    return result[0] as Speaker || null;
  }

  async findAll(): Promise<Speaker[]> {
    const result = await db.select().from(speakers);
    return result as Speaker[];
  }

  async update(id: number, speaker: Partial<Speaker>): Promise<Speaker | null> {
    await db.update(speakers).set(speaker).where(eq(speakers.id, id));
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    await db.delete(speakers).where(eq(speakers.id, id)); // Ejecuta la operación
    return true; // Asume éxito si no hay error
  }
}

// Implementación del repositorio de horarios
export class MySQLScheduleRepository implements ScheduleRepository {
  async create(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
    const [result] = await db.insert(schedules).values(schedule);
    const createdSchedule = await db
      .select({
        id: schedules.id,
        eventId: schedules.eventId,
        speakerId: schedules.speakerId,
        startTime: schedules.startTime,
        endTime: schedules.endTime,
        reminderSent: schedules.reminderSent,
        createdAt: schedules.createdAt,
        updatedAt: schedules.updatedAt,
        event: {
          id: events.id,
          name: events.name,
          description: events.description,
          date: events.date,
          location: events.location,
          mapsLink: events.mapsLink,
        },
        speaker: {
          id: speakers.id,
          name: speakers.name,
          bio: speakers.bio,
          topic: speakers.topic,
        },
      })
      .from(schedules)
      .leftJoin(events, eq(schedules.eventId, events.id))
      .leftJoin(speakers, eq(schedules.speakerId, speakers.id))
      .where(eq(schedules.id, result.insertId));
    return createdSchedule[0] as Schedule;
  }

  async findById(id: number): Promise<Schedule | null> {
    const result = await db
      .select({
        id: schedules.id,
        eventId: schedules.eventId,
        speakerId: schedules.speakerId,
        startTime: schedules.startTime,
        endTime: schedules.endTime,
        reminderSent: schedules.reminderSent,
        createdAt: schedules.createdAt,
        updatedAt: schedules.updatedAt,
        event: {
          id: events.id,
          name: events.name,
          description: events.description,
          date: events.date,
          location: events.location,
          mapsLink: events.mapsLink,
        },
        speaker: {
          id: speakers.id,
          name: speakers.name,
          bio: speakers.bio,
          topic: speakers.topic,
        },
      })
      .from(schedules)
      .leftJoin(events, eq(schedules.eventId, events.id))
      .leftJoin(speakers, eq(schedules.speakerId, speakers.id))
      .where(eq(schedules.id, id));
    return result[0] as Schedule || null;
  }

  async findByEventId(eventId: number): Promise<Schedule[]> {
    const result = await db
      .select({
        id: schedules.id,
        eventId: schedules.eventId,
        speakerId: schedules.speakerId,
        startTime: schedules.startTime,
        endTime: schedules.endTime,
        reminderSent: schedules.reminderSent,
        createdAt: schedules.createdAt,
        updatedAt: schedules.updatedAt,
        event: {
          id: events.id,
          name: events.name,
          description: events.description,
          date: events.date,
          location: events.location,
          mapsLink: events.mapsLink,
        },
        speaker: {
          id: speakers.id,
          name: speakers.name,
          bio: speakers.bio,
          topic: speakers.topic,
        },
      })
      .from(schedules)
      .leftJoin(events, eq(schedules.eventId, events.id))
      .leftJoin(speakers, eq(schedules.speakerId, speakers.id))
      .where(eq(schedules.eventId, eventId))
      .orderBy(schedules.startTime);
    return result as Schedule[];
  }

  async findUpcoming(): Promise<Schedule[]> {
    const now = new Date();
    const result = await db
      .select({
        id: schedules.id,
        eventId: schedules.eventId,
        speakerId: schedules.speakerId,
        startTime: schedules.startTime,
        endTime: schedules.endTime,
        reminderSent: schedules.reminderSent,
        createdAt: schedules.createdAt,
        updatedAt: schedules.updatedAt,
        event: {
          id: events.id,
          name: events.name,
          description: events.description,
          date: events.date,
          location: events.location,
          mapsLink: events.mapsLink,
        },
        speaker: {
          id: speakers.id,
          name: speakers.name,
          bio: speakers.bio,
          topic: speakers.topic,
        },
      })
      .from(schedules)
      .leftJoin(events, eq(schedules.eventId, events.id))
      .leftJoin(speakers, eq(schedules.speakerId, speakers.id))
      .where(sql`${schedules.startTime} > ${now}`)
      .orderBy(schedules.startTime);
    return result as Schedule[];
  }

  async findPendingReminders(): Promise<Schedule[]> {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    const result = await db
      .select({
        id: schedules.id,
        eventId: schedules.eventId,
        speakerId: schedules.speakerId,
        startTime: schedules.startTime,
        endTime: schedules.endTime,
        reminderSent: schedules.reminderSent,
        createdAt: schedules.createdAt,
        updatedAt: schedules.updatedAt,
        event: {
          id: events.id,
          name: events.name,
          description: events.description,
          date: events.date,
          location: events.location,
          mapsLink: events.mapsLink,
        },
        speaker: {
          id: speakers.id,
          name: speakers.name,
          bio: speakers.bio,
          topic: speakers.topic,
        },
      })
      .from(schedules)
      .leftJoin(events, eq(schedules.eventId, events.id))
      .leftJoin(speakers, eq(schedules.speakerId, speakers.id))
      .where(
        and(
          sql`${schedules.startTime} <= ${fiveMinutesFromNow}`,
          sql`${schedules.startTime} > ${now}`,
          eq(schedules.reminderSent, false)
        )
      );
    return result as Schedule[];
  }

  async update(id: number, schedule: Partial<Schedule>): Promise<Schedule | null> {
    await db.update(schedules).set(schedule).where(eq(schedules.id, id));
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    await db.delete(schedules).where(eq(schedules.id, id)); // Ejecuta la operación
    return true; // Asume éxito si no hay error
  }

  async markReminderSent(id: number): Promise<void> {
    await db.update(schedules).set({ reminderSent: true }).where(eq(schedules.id, id));
  }
}

// Implementación del repositorio de suscriptores
export class MySQLSubscriberRepository implements SubscriberRepository {
  async create(subscriber: Omit<Subscriber, 'id' | 'subscribedAt'>): Promise<Subscriber> {
    const [result] = await db.insert(subscribers).values(subscriber);
    const createdSubscriber = await db
      .select({
        id: subscribers.id,
        phoneNumber: subscribers.phoneNumber,
        eventId: subscribers.eventId,
        isActive: subscribers.isActive,
        subscribedAt: subscribers.subscribedAt,
        event: {
          id: events.id,
          name: events.name,
          description: events.description,
          date: events.date,
          location: events.location,
          mapsLink: events.mapsLink,
        },
      })
      .from(subscribers)
      .leftJoin(events, eq(subscribers.eventId, events.id))
      .where(eq(subscribers.id, result.insertId));
    return createdSubscriber[0] as Subscriber;
  }

  async findByPhoneAndEvent(phoneNumber: string, eventId: number): Promise<Subscriber | null> {
    const result = await db
      .select()
      .from(subscribers)
      .where(and(eq(subscribers.phoneNumber, phoneNumber), eq(subscribers.eventId, eventId)));
    return result[0] as Subscriber || null;
  }

  async findByEventId(eventId: number): Promise<Subscriber[]> {
    const result = await db
      .select({
        id: subscribers.id,
        phoneNumber: subscribers.phoneNumber,
        eventId: subscribers.eventId,
        isActive: subscribers.isActive,
        subscribedAt: subscribers.subscribedAt,
        event: {
          id: events.id,
          name: events.name,
          description: events.description,
          date: events.date,
          location: events.location,
          mapsLink: events.mapsLink,
        },
      })
      .from(subscribers)
      .leftJoin(events, eq(subscribers.eventId, events.id))
      .where(eq(subscribers.eventId, eventId));
    return result as Subscriber[];
  }

  async findActiveByEventId(eventId: number): Promise<Subscriber[]> {
    const result = await db
      .select({
        id: subscribers.id,
        phoneNumber: subscribers.phoneNumber,
        eventId: subscribers.eventId,
        isActive: subscribers.isActive,
        subscribedAt: subscribers.subscribedAt,
        event: {
          id: events.id,
          name: events.name,
          description: events.description,
          date: events.date,
          location: events.location,
          mapsLink: events.mapsLink,
        },
      })
      .from(subscribers)
      .leftJoin(events, eq(subscribers.eventId, events.id))
      .where(and(eq(subscribers.eventId, eventId), eq(subscribers.isActive, true)));
    return result as Subscriber[];
  }

  async update(id: number, subscriber: Partial<Subscriber>): Promise<Subscriber | null> {
    await db.update(subscribers).set(subscriber).where(eq(subscribers.id, id));
    const result = await db.select().from(subscribers).where(eq(subscribers.id, id));
    return result[0] as Subscriber || null;
  }

  async delete(id: number): Promise<boolean> {
    await db.delete(subscribers).where(eq(subscribers.id, id)); // Ejecuta la operación
    return true; // Asume éxito si no hay error
  }

  async unsubscribe(phoneNumber: string, eventId: number): Promise<boolean> {
    await db.update(subscribers).set({ isActive: false }).where(and(eq(subscribers.phoneNumber, phoneNumber), eq(subscribers.eventId, eventId)));
    return true; // Asume éxito si no hay error
  }
}

// Implementación del repositorio de configuración del bot
export class MySQLBotSettingsRepository implements BotSettingsRepository {
  async findActive(): Promise<BotSettings | null> {
    const result = await db.select().from(botSettings).where(eq(botSettings.isActive, true));
    return result[0] as BotSettings || null;
  }

  async create(settings: Omit<BotSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<BotSettings> {
    const [result] = await db.insert(botSettings).values(settings);
    const createdSettings = await db.select().from(botSettings).where(eq(botSettings.id, result.insertId));
    return createdSettings[0] as BotSettings;
  }

  async update(id: number, settings: Partial<BotSettings>): Promise<BotSettings | null> {
    await db.update(botSettings).set(settings).where(eq(botSettings.id, id));
    const result = await db.select().from(botSettings).where(eq(botSettings.id, id));
    return result[0] as BotSettings || null;
  }

  async updatePhoneNumber(phoneNumber: string): Promise<BotSettings | null> {
    // Desactivar todas las configuraciones existentes
    await db.update(botSettings).set({ isActive: false });
    
    // Crear nueva configuración activa
    const newSettings = await this.create({
      phoneNumber,
      password: 'Eventos.1286',
      isActive: true,
    });
    
    return newSettings;
  }
}