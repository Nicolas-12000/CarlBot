import {
    EventRepository,
    SpeakerRepository,
    ScheduleRepository,
    SubscriberRepository,
    WhatsAppRepository,
  } from '../../Core/domain/repositories';
  import { Event, Speaker, Schedule, Subscriber, BotResponse } from '../../Core/domain/entities';
  
  // Use Case: Gestión de Eventos
  export class EventManagementUseCase {
    constructor(private eventRepository: EventRepository) {}
  
    async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
      return await this.eventRepository.create(eventData);
    }
  
    async getActiveEvents(): Promise<Event[]> {
      return await this.eventRepository.findActive();
    }
  
    async getEventById(id: number): Promise<Event | null> {
      return await this.eventRepository.findById(id);
    }
  
    async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | null> {
      return await this.eventRepository.update(id, eventData);
    }
  
    async deleteEvent(id: number): Promise<boolean> {
      return await this.eventRepository.delete(id);
    }
  }
  
  // Use Case: Gestión de Horarios
  export class ScheduleManagementUseCase {
    constructor(
      private scheduleRepository: ScheduleRepository,
      private eventRepository: EventRepository,
      private speakerRepository: SpeakerRepository
    ) {}
  
    async createSchedule(scheduleData: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
      return await this.scheduleRepository.create(scheduleData);
    }
  
    async getEventSchedule(eventId: number): Promise<Schedule[]> {
      return await this.scheduleRepository.findByEventId(eventId);
    }
  
    async getUpcomingSchedules(): Promise<Schedule[]> {
      return await this.scheduleRepository.findUpcoming();
    }
  
    async getPendingReminders(): Promise<Schedule[]> {
      return await this.scheduleRepository.findPendingReminders();
    }
  
    async markReminderSent(scheduleId: number): Promise<void> {
      await this.scheduleRepository.markReminderSent(scheduleId);
    }
  }
  
  // Use Case: Gestión de Suscripciones
  export class SubscriptionManagementUseCase {
    constructor(
      private subscriberRepository: SubscriberRepository,
      private eventRepository: EventRepository,
      private whatsAppRepository: WhatsAppRepository
    ) {}
  
    async subscribe(phoneNumber: string, eventId: number): Promise<{ success: boolean; message: string }> {
      // Verificar si el evento existe
      const event = await this.eventRepository.findById(eventId);
      if (!event) {
        return { success: false, message: 'El evento no existe.' };
      }
  
      // Verificar si ya está suscrito
      const existingSubscription = await this.subscriberRepository.findByPhoneAndEvent(phoneNumber, eventId);
      if (existingSubscription && existingSubscription.isActive) {
        return { success: false, message: 'Ya estás suscrito a este evento.' };
      }
  
      // Crear o reactivar suscripción
      if (existingSubscription) {
        await this.subscriberRepository.update(existingSubscription.id!, { isActive: true });
      } else {
        await this.subscriberRepository.create({ phoneNumber, eventId, isActive: true });
      }
  
      return { 
        success: true, 
        message: `¡Te has suscrito exitosamente al evento "${event.name}"! Recibirás recordatorios antes de cada ponencia.` 
      };
    }
  
    async unsubscribe(phoneNumber: string, eventId: number): Promise<{ success: boolean; message: string }> {
      const success = await this.subscriberRepository.unsubscribe(phoneNumber, eventId);
      
      return success 
        ? { success: true, message: 'Te has desuscrito del evento exitosamente.' }
        : { success: false, message: 'No estás suscrito a este evento o el evento no existe.' };
    }
  
    async getEventSubscribers(eventId: number): Promise<Subscriber[]> {
      return await this.subscriberRepository.findActiveByEventId(eventId);
    }
  }
  
  // Use Case: Bot de WhatsApp
  export class WhatsAppBotUseCase {
    constructor(
      private eventRepository: EventRepository,
      private scheduleRepository: ScheduleRepository,
      private subscriptionUseCase: SubscriptionManagementUseCase,
      private whatsAppRepository: WhatsAppRepository
    ) {}
  
    async processMessage(from: string, message: string): Promise<BotResponse> {
      const normalizedMessage = message.toLowerCase().trim();
  
      switch (normalizedMessage) {
        case 'hola':
        case 'hi':
        case 'menu':
          return this.getMainMenu();
  
        case '1':
          return await this.getEventInfo();
  
        case '2':
          return await this.getEventSchedule();
  
        case '3':
          return await this.getEventLocation();
  
        case '4':
          return await this.subscribeUser(from);
  
        case '5':
          return await this.unsubscribeUser(from);
  
        default:
          return {
            message: 'No entiendo tu mensaje. Escribe "menu" para ver las opciones disponibles.',
          };
      }
    }
  
    private getMainMenu(): BotResponse {
      return {
        message: `¡Hola! 👋 Soy CarlBot, tu asistente para eventos académicos.
  
  *Menú de opciones:*
  
  1️⃣ Ver información del evento
  2️⃣ Ver horario de ponencias
  3️⃣ Ver ubicación del evento
  4️⃣ Suscribirse al evento
  5️⃣ Desuscribirse del evento
  
  *Responde con el número de la opción que deseas.*`,
      };
    }
  
    private async getEventInfo(): Promise<BotResponse> {
      const events = await this.eventRepository.findActive();
      
      if (events.length === 0) {
        return {
          message: 'No hay eventos activos en este momento. ¡Mantente atento a nuestras actualizaciones! 📅',
        };
      }
  
      const event = events[0]; // Asumimos un evento activo principal
      const eventDate = new Date(event.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
  
      return {
        message: `📅 *Información del Evento*
  
  *Nombre:* ${event.name}
  *Fecha:* ${eventDate}
  *Lugar:* ${event.location}
  ${event.description ? `*Descripción:* ${event.description}` : ''}
  
  ¡Esperamos verte ahí! 🎉`,
      };
    }
  
    private async getEventSchedule(): Promise<BotResponse> {
      const events = await this.eventRepository.findActive();
      
      if (events.length === 0) {
        return {
          message: 'No hay eventos activos en este momento.',
        };
      }
  
      const schedules = await this.scheduleRepository.findByEventId(events[0].id!);
      
      if (schedules.length === 0) {
        return {
          message: 'Aún no hay ponencias programadas para este evento. ¡Mantente atento! 📋',
        };
      }
  
      let scheduleText = '📋 *Horario de Ponencias*\n\n';
      
      schedules.forEach((schedule, index) => {
        const startTime = new Date(schedule.startTime).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const endTime = new Date(schedule.endTime).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });
        
        scheduleText += `${index + 1}. *${startTime} - ${endTime}*\n`;
        scheduleText += `   👨‍🏫 ${schedule.speaker?.name || 'Por confirmar'}\n`;
        scheduleText += `   📝 ${schedule.speaker?.topic || 'Tema por confirmar'}\n\n`;
      });
  
      return { message: scheduleText };
    }
  
    private async getEventLocation(): Promise<BotResponse> {
      const events = await this.eventRepository.findActive();
      
      if (events.length === 0) {
        return {
          message: 'No hay eventos activos en este momento.',
        };
      }
  
      const event = events[0];
      let locationMessage = `📍 *Ubicación del Evento*\n\n*${event.name}*\n📌 ${event.location}`;
      
      if (event.mapsLink) {
        locationMessage += `\n\n🗺️ Ver en Google Maps: ${event.mapsLink}`;
      }
  
      return { message: locationMessage };
    }
  
    private async subscribeUser(phoneNumber: string): Promise<BotResponse> {
      const events = await this.eventRepository.findActive();
      
      if (events.length === 0) {
        return {
          message: 'No hay eventos activos para suscribirse en este momento.',
        };
      }
  
      const result = await this.subscriptionUseCase.subscribe(phoneNumber, events[0].id!);
      return { message: result.message };
    }
  
    private async unsubscribeUser(phoneNumber: string): Promise<BotResponse> {
      const events = await this.eventRepository.findActive();
      
      if (events.length === 0) {
        return {
          message: 'No hay eventos activos.',
        };
      }
  
      const result = await this.subscriptionUseCase.unsubscribe(phoneNumber, events[0].id!);
      return { message: result.message };
    }
  
    async sendReminders(): Promise<void> {
      const pendingReminders = await this.scheduleRepository.findPendingReminders();
      
      for (const schedule of pendingReminders) {
        const subscribers = await this.subscriptionUseCase.getEventSubscribers(schedule.eventId);
        const phoneNumbers = subscribers.map(sub => sub.phoneNumber);
        
        const startTime = new Date(schedule.startTime).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });
        
        const reminderMessage = `🔔 *Recordatorio de Ponencia*\n\n` +
          `La ponencia "${schedule.speaker?.topic}" con ${schedule.speaker?.name} ` +
          `comenzará en 5 minutos (${startTime}).\n\n¡No te la pierdas! 🎯`;
        
        await this.whatsAppRepository.sendMessageToMultiple(phoneNumbers, reminderMessage);
        await this.scheduleRepository.markReminderSent(schedule.id!);
      }
    }
  }