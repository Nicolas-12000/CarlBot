import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createRoutes } from './routes';
import { errorHandler, requestLogger, validateJSON } from './middleware';
import {
  AuthController,
  EventController,
  SpeakerController,
  ScheduleController,
  SubscriberController,
  BotController,
  DashboardController,
} from './controllers';

// Importar casos de uso y repositorios
import { EventManagementUseCase, ScheduleManagementUseCase, SubscriptionManagementUseCase, WhatsAppBotUseCase } from '../../Application/useCases';
import {
  MySQLEventRepository,
  MySQLSpeakerRepository,
  MySQLScheduleRepository,
  MySQLSubscriberRepository,
  MySQLBotSettingsRepository,
} from '../../Core/domain/repositories/mysql/repositories';
import { BaileysWhatsAppService } from '../whatsapp/service';

export class APIServer {
  private app: express.Application;
  private port: number;
  
  // Repositorios
  private eventRepository!: MySQLEventRepository;
  private speakerRepository!: MySQLSpeakerRepository;
  private scheduleRepository!: MySQLScheduleRepository;
  private subscriberRepository!: MySQLSubscriberRepository;
  private botSettingsRepository!: MySQLBotSettingsRepository;
  
  // Servicios
  private whatsAppService!: BaileysWhatsAppService;
  
  // Casos de uso
  private eventUseCase!: EventManagementUseCase;
  private scheduleUseCase!: ScheduleManagementUseCase;
  private subscriptionUseCase!: SubscriptionManagementUseCase;
  private whatsAppBotUseCase!: WhatsAppBotUseCase;
  
  // Controladores
  private authController!: AuthController;
  private eventController!: EventController;
  private speakerController!: SpeakerController;
  private scheduleController!: ScheduleController;
  private subscriberController!: SubscriberController;
  private botController!: BotController;
  private dashboardController!: DashboardController;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    
    this.initializeRepositories();
    this.initializeServices();
    this.initializeUseCases();
    this.initializeControllers();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeRepositories(): void {
    this.eventRepository = new MySQLEventRepository();
    this.speakerRepository = new MySQLSpeakerRepository();
    this.scheduleRepository = new MySQLScheduleRepository();
    this.subscriberRepository = new MySQLSubscriberRepository();
    this.botSettingsRepository = new MySQLBotSettingsRepository();
  }

  private initializeServices(): void {
    this.whatsAppService = new BaileysWhatsAppService();
  }

  private initializeUseCases(): void {
    this.eventUseCase = new EventManagementUseCase(this.eventRepository);
    this.scheduleUseCase = new ScheduleManagementUseCase(
      this.scheduleRepository,
      this.eventRepository,
      this.speakerRepository
    );
    this.subscriptionUseCase = new SubscriptionManagementUseCase(
      this.subscriberRepository,
      this.eventRepository,
      this.whatsAppService
    );
    this.whatsAppBotUseCase = new WhatsAppBotUseCase(
      this.eventRepository,
      this.scheduleRepository,
      this.subscriptionUseCase,
      this.whatsAppService
    );
  }

  private initializeControllers(): void {
    this.authController = new AuthController(this.botSettingsRepository);
    this.eventController = new EventController(this.eventUseCase);
    this.speakerController = new SpeakerController(this.speakerRepository);
    this.scheduleController = new ScheduleController(this.scheduleUseCase);
    this.subscriberController = new SubscriberController(this.subscriptionUseCase);
    this.botController = new BotController(this.botSettingsRepository, this.whatsAppService);
    this.dashboardController = new DashboardController(
      this.eventUseCase,
      this.scheduleUseCase,
      this.subscriptionUseCase,
      this.whatsAppService
    );
  }

  private initializeMiddleware(): void {
    // Middleware de seguridad
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:4321',
      credentials: true,
    }));
    
    // Parsing de JSON y URL-encoded
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Logging de requests
    this.app.use(requestLogger);
    
    // Validación de JSON
    this.app.use(validateJSON);
  }

  private initializeRoutes(): void {
    // Ruta de salud del servidor
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });
    });

    // Rutas de la API
    const apiRoutes = createRoutes(
      this.authController,
      this.eventController,
      this.speakerController,
      this.scheduleController,
      this.subscriberController,
      this.botController,
      this.dashboardController
    );
    
    this.app.use('/api', apiRoutes);
    
    // Ruta catch-all para rutas no encontradas
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`🚀 Servidor API ejecutándose en puerto ${this.port}`);
        console.log(`📖 Documentación disponible en http://localhost:${this.port}/health`);
        resolve();
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getWhatsAppBotUseCase(): WhatsAppBotUseCase {
    return this.whatsAppBotUseCase;
  }

  public getWhatsAppService(): BaileysWhatsAppService {
    return this.whatsAppService;
  }
}