import { Event, Speaker, Schedule, Subscriber, BotSettings } from '../entities';

// Repository para eventos
export interface EventRepository {
  create(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event>;
  findById(id: number): Promise<Event | null>;
  findAll(): Promise<Event[]>;
  findActive(): Promise<Event[]>;
  update(id: number, event: Partial<Event>): Promise<Event | null>;
  delete(id: number): Promise<boolean>;
}

// Repository para ponentes
export interface SpeakerRepository {
  create(speaker: Omit<Speaker, 'id' | 'createdAt' | 'updatedAt'>): Promise<Speaker>;
  findById(id: number): Promise<Speaker | null>;
  findAll(): Promise<Speaker[]>;
  update(id: number, speaker: Partial<Speaker>): Promise<Speaker | null>;
  delete(id: number): Promise<boolean>;
}

// Repository para horarios
export interface ScheduleRepository {
  create(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule>;
  findById(id: number): Promise<Schedule | null>;
  findByEventId(eventId: number): Promise<Schedule[]>;
  findUpcoming(): Promise<Schedule[]>;
  findPendingReminders(): Promise<Schedule[]>;
  update(id: number, schedule: Partial<Schedule>): Promise<Schedule | null>;
  delete(id: number): Promise<boolean>;
  markReminderSent(id: number): Promise<void>;
}

// Repository para suscriptores
export interface SubscriberRepository {
  create(subscriber: Omit<Subscriber, 'id' | 'subscribedAt'>): Promise<Subscriber>;
  findByPhoneAndEvent(phoneNumber: string, eventId: number): Promise<Subscriber | null>;
  findByEventId(eventId: number): Promise<Subscriber[]>;
  findActiveByEventId(eventId: number): Promise<Subscriber[]>;
  update(id: number, subscriber: Partial<Subscriber>): Promise<Subscriber | null>;
  delete(id: number): Promise<boolean>;
  unsubscribe(phoneNumber: string, eventId: number): Promise<boolean>;
}

// Repository para configuración del bot
export interface BotSettingsRepository {
  findActive(): Promise<BotSettings | null>;
  create(settings: Omit<BotSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<BotSettings>;
  update(id: number, settings: Partial<BotSettings>): Promise<BotSettings | null>;
  updatePhoneNumber(phoneNumber: string): Promise<BotSettings | null>;
}

// Repository para mensajes de WhatsApp
export interface WhatsAppRepository {
  sendMessage(to: string, message: string): Promise<boolean>;
  sendMessageToMultiple(phoneNumbers: string[], message: string): Promise<boolean>;
  isConnected(): Promise<boolean>;
  getQRCode(): Promise<string | null>;
}