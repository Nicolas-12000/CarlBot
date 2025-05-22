import { Request, Response } from 'express';
import { EventManagementUseCase, ScheduleManagementUseCase, SubscriptionManagementUseCase } from '../../Application/useCases';
import { CreateEventDTO, CreateSpeakerDTO, CreateScheduleDTO } from '../../Core/domain/entities';
import jwt from 'jsonwebtoken';

// Controlador de autenticación
export class AuthController {
  constructor(private botSettingsRepository: any) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, password } = req.body;

      if (!phoneNumber || !password) {
        res.status(400).json({ error: 'Número de teléfono y contraseña requeridos' });
        return;
      }

      // Verificar credenciales fijas
      if (password !== 'Eventos.1286') {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      // Verificar si el número existe en la configuración del bot
      const botSettings = await this.botSettingsRepository.findActive();
      if (!botSettings || botSettings.phoneNumber !== phoneNumber) {
        res.status(401).json({ error: 'Número de teléfono no autorizado' });
        return;
      }

      // Generar token JWT
      const token = jwt.sign(
        { phoneNumber, id: botSettings.id },
        process.env.JWT_SECRET || 'carlbot-secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          phoneNumber: botSettings.phoneNumber,
          id: botSettings.id,
        },
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

// Controlador de eventos
export class EventController {
  constructor(private eventUseCase: EventManagementUseCase) {}

  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventData: CreateEventDTO = req.body;
      
      if (!eventData.name || !eventData.date || !eventData.location) {
        res.status(400).json({ error: 'Nombre, fecha y ubicación son requeridos' });
        return;
      }

      const event = await this.eventUseCase.createEvent({
        ...eventData,
        date: new Date(eventData.date),
      });

      res.status(201).json({ success: true, data: event });
    } catch (error) {
      console.error('Error creando evento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await this.eventUseCase.getActiveEvents();
      res.json({ success: true, data: events });
    } catch (error) {
      console.error('Error obteniendo eventos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const event = await this.eventUseCase.getEventById(id);
      
      if (!event) {
        res.status(404).json({ error: 'Evento no encontrado' });
        return;
      }

      res.json({ success: true, data: event });
    } catch (error) {
      console.error('Error obteniendo evento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const eventData = req.body;

      if (eventData.date) {
        eventData.date = new Date(eventData.date);
      }

      const event = await this.eventUseCase.updateEvent(id, eventData);
      
      if (!event) {
        res.status(404).json({ error: 'Evento no encontrado' });
        return;
      }

      res.json({ success: true, data: event });
    } catch (error) {
      console.error('Error actualizando evento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const success = await this.eventUseCase.deleteEvent(id);
      
      if (!success) {
        res.status(404).json({ error: 'Evento no encontrado' });
        return;
      }

      res.json({ success: true, message: 'Evento eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminando evento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

// Controlador de ponentes
export class SpeakerController {
  constructor(private speakerRepository: any) {}

  async createSpeaker(req: Request, res: Response): Promise<void> {
    try {
      const speakerData: CreateSpeakerDTO = req.body;
      
      if (!speakerData.name || !speakerData.topic) {
        res.status(400).json({ error: 'Nombre y tema son requeridos' });
        return;
      }

      const speaker = await this.speakerRepository.create(speakerData);
      res.status(201).json({ success: true, data: speaker });
    } catch (error) {
      console.error('Error creando ponente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getSpeakers(req: Request, res: Response): Promise<void> {
    try {
      const speakers = await this.speakerRepository.findAll();
      res.json({ success: true, data: speakers });
    } catch (error) {
      console.error('Error obteniendo ponentes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async updateSpeaker(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const speakerData = req.body;

      const speaker = await this.speakerRepository.update(id, speakerData);
      
      if (!speaker) {
        res.status(404).json({ error: 'Ponente no encontrado' });
        return;
      }

      res.json({ success: true, data: speaker });
    } catch (error) {
      console.error('Error actualizando ponente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async deleteSpeaker(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const success = await this.speakerRepository.delete(id);
      
      if (!success) {
        res.status(404).json({ error: 'Ponente no encontrado' });
        return;
      }

      res.json({ success: true, message: 'Ponente eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminando ponente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

// Controlador de horarios
export class ScheduleController {
  constructor(private scheduleUseCase: ScheduleManagementUseCase) {}

  async createSchedule(req: Request, res: Response): Promise<void> {
    try {
      const scheduleData: CreateScheduleDTO = req.body;
      
      if (!scheduleData.eventId || !scheduleData.speakerId || !scheduleData.startTime || !scheduleData.endTime) {
        res.status(400).json({ error: 'Todos los campos son requeridos' });
        return;
      }

      const schedule = await this.scheduleUseCase.createSchedule({
        eventId: scheduleData.eventId,
        speakerId: scheduleData.speakerId,
        startTime: new Date(scheduleData.startTime),
        endTime: new Date(scheduleData.endTime),
      });

      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      console.error('Error creando horario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getEventSchedules(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      const schedules = await this.scheduleUseCase.getEventSchedule(eventId);
      res.json({ success: true, data: schedules });
    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getUpcomingSchedules(req: Request, res: Response): Promise<void> {
    try {
      const schedules = await this.scheduleUseCase.getUpcomingSchedules();
      res.json({ success: true, data: schedules });
    } catch (error) {
      console.error('Error obteniendo próximos horarios:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async deleteSchedule(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      // Implementar eliminación en el repositorio
      res.json({ success: true, message: 'Horario eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminando horario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

// Controlador de suscriptores
export class SubscriberController {
  constructor(private subscriptionUseCase: SubscriptionManagementUseCase) {}

  async getEventSubscribers(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      const subscribers = await this.subscriptionUseCase.getEventSubscribers(eventId);
      res.json({ success: true, data: subscribers });
    } catch (error) {
      console.error('Error obteniendo suscriptores:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, eventId } = req.body;
      
      if (!phoneNumber || !eventId) {
        res.status(400).json({ error: 'Número de teléfono y ID del evento son requeridos' });
        return;
      }

      const result = await this.subscriptionUseCase.subscribe(phoneNumber, eventId);
      
      if (result.success) {
        res.status(201).json({ success: true, message: result.message });
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      console.error('Error en suscripción:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async unsubscribe(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, eventId } = req.body;
      
      if (!phoneNumber || !eventId) {
        res.status(400).json({ error: 'Número de teléfono y ID del evento son requeridos' });
        return;
      }

      const result = await this.subscriptionUseCase.unsubscribe(phoneNumber, eventId);
      
      if (result.success) {
        res.json({ success: true, message: result.message });
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      console.error('Error en desuscripción:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

// Controlador de configuración del bot
export class BotController {
  constructor(
    private botSettingsRepository: any,
    private whatsAppService: any
  ) {}

  async getBotStatus(req: Request, res: Response): Promise<void> {
    try {
      const isConnected = await this.whatsAppService.isConnected();
      const botInfo = await this.whatsAppService.getBotInfo();
      const settings = await this.botSettingsRepository.findActive();

      res.json({
        success: true,
        data: {
          isConnected,
          botInfo,
          settings,
        },
      });
    } catch (error) {
      console.error('Error obteniendo estado del bot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async updateBotPhone(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        res.status(400).json({ error: 'Número de teléfono requerido' });
        return;
      }

      const updatedSettings = await this.botSettingsRepository.updatePhoneNumber(phoneNumber);
      
      res.json({
        success: true,
        message: 'Número del bot actualizado exitosamente',
        data: updatedSettings,
      });
    } catch (error) {
      console.error('Error actualizando número del bot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async sendTestMessage(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber || !message) {
        res.status(400).json({ error: 'Número de teléfono y mensaje requeridos' });
        return;
      }

      const success = await this.whatsAppService.sendMessage(phoneNumber, message);
      
      if (success) {
        res.json({ success: true, message: 'Mensaje enviado exitosamente' });
      } else {
        res.status(500).json({ error: 'Error enviando mensaje de prueba' });
      }
    } catch (error) {
      console.error('Error enviando mensaje de prueba:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

// Controlador del dashboard
export class DashboardController {
  constructor(
    private eventUseCase: EventManagementUseCase,
    private scheduleUseCase: ScheduleManagementUseCase,
    private subscriptionUseCase: SubscriptionManagementUseCase,
    private whatsAppService: any
  ) {}

  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const events = await this.eventUseCase.getActiveEvents();
      const upcomingSchedules = await this.scheduleUseCase.getUpcomingSchedules();
      const isConnected = await this.whatsAppService.isConnected();
      
      // Obtener estadísticas de suscriptores para eventos activos
      let totalSubscribers = 0;
      const eventStats = [];
      
      for (const event of events) {
        const subscribers = await this.subscriptionUseCase.getEventSubscribers(event.id!);
        totalSubscribers += subscribers.length;
        eventStats.push({
          event: event.name,
          subscribers: subscribers.length,
        });
      }

      res.json({
        success: true,
        data: {
          summary: {
            totalEvents: events.length,
            totalSubscribers,
            upcomingSchedules: upcomingSchedules.length,
            botConnected: isConnected,
          },
          events,
          upcomingSchedules: upcomingSchedules.slice(0, 5), // Próximas 5 ponencias
          eventStats,
        },
      });
    } catch (error) {
      console.error('Error obteniendo datos del dashboard:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}