import { Router } from 'express';
import { 
  AuthController,
  EventController,
  SpeakerController,
  ScheduleController,
  SubscriberController,
  BotController,
  DashboardController
} from './controllers';
import { authMiddleware } from './middleware';

// Función para crear todas las rutas
export function createRoutes(
  authController: AuthController,
  eventController: EventController,
  speakerController: SpeakerController,
  scheduleController: ScheduleController,
  subscriberController: SubscriberController,
  botController: BotController,
  dashboardController: DashboardController
): Router {
  const router = Router();

  // Rutas públicas
  router.post('/auth/login', authController.login.bind(authController));

  // Middleware de autenticación para rutas protegidas
  router.use(authMiddleware);

  // Rutas del dashboard
  router.get('/dashboard', dashboardController.getDashboardData.bind(dashboardController));

  // Rutas de eventos
  router.post('/events', eventController.createEvent.bind(eventController));
  router.get('/events', eventController.getEvents.bind(eventController));
  router.get('/events/:id', eventController.getEventById.bind(eventController));
  router.put('/events/:id', eventController.updateEvent.bind(eventController));
  router.delete('/events/:id', eventController.deleteEvent.bind(eventController));

  // Rutas de ponentes
  router.post('/speakers', speakerController.createSpeaker.bind(speakerController));
  router.get('/speakers', speakerController.getSpeakers.bind(speakerController));
  router.put('/speakers/:id', speakerController.updateSpeaker.bind(speakerController));
  router.delete('/speakers/:id', speakerController.deleteSpeaker.bind(speakerController));

  // Rutas de horarios
  router.post('/schedules', scheduleController.createSchedule.bind(scheduleController));
  router.get('/schedules/event/:eventId', scheduleController.getEventSchedules.bind(scheduleController));
  router.get('/schedules/upcoming', scheduleController.getUpcomingSchedules.bind(scheduleController));
  router.delete('/schedules/:id', scheduleController.deleteSchedule.bind(scheduleController));

  // Rutas de suscriptores
  router.get('/subscribers/event/:eventId', subscriberController.getEventSubscribers.bind(subscriberController));
  router.post('/subscribers/subscribe', subscriberController.subscribe.bind(subscriberController));
  router.post('/subscribers/unsubscribe', subscriberController.unsubscribe.bind(subscriberController));

  // Rutas del bot
  router.get('/bot/status', botController.getBotStatus.bind(botController));
  router.put('/bot/phone', botController.updateBotPhone.bind(botController));
  router.post('/bot/test-message', botController.sendTestMessage.bind(botController));

  return router;
}