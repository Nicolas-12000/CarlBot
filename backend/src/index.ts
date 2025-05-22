import dotenv from 'dotenv';
import { APIServer } from './Infrastructure/api/server';
import { ReminderScheduler } from './Infrastructure/scheduler/scheduler';
import { testConnection } from './Infrastructure/database/conections';

// Cargar variables de entorno
dotenv.config();

class CarlBotApplication {
  private apiServer: APIServer;
  private reminderScheduler: ReminderScheduler;

  constructor() {
    console.log('🤖 Iniciando CarlBot - Sistema de Gestión de Eventos');
    
    // Inicializar servidor API
    this.apiServer = new APIServer(parseInt(process.env.PORT || '3000'));
    
    // Inicializar programador de recordatorios
    this.reminderScheduler = new ReminderScheduler(this.apiServer.getWhatsAppBotUseCase());
  }

  async start(): Promise<void> {
    try {
      // 1. Verificar conexión a base de datos
      console.log('🔍 Verificando conexión a base de datos...');
      const dbConnected = await testConnection();
      
      if (!dbConnected) {
        throw new Error('No se pudo conectar a la base de datos');
      }

      // 2. Inicializar configuración inicial si es necesario
      await this.initializeDefaultSettings();

      // 3. Iniciar servidor API
      console.log('🌐 Iniciando servidor API...');
      await this.apiServer.start();

      // 4. Iniciar programador de recordatorios
      console.log('⏰ Iniciando programador de recordatorios...');
      this.reminderScheduler.start();

      // 5. Configurar manejo de señales del sistema
      this.setupGracefulShutdown();

      console.log('✅ CarlBot iniciado exitosamente');
      console.log('📱 Esperando conexión de WhatsApp...');
      console.log('🌍 Panel administrativo disponible en: http://localhost:4321');
      console.log('🔗 API disponible en: http://localhost:3000');

    } catch (error) {
      console.error('❌ Error iniciando CarlBot:', error);
      process.exit(1);
    }
  }

  private async initializeDefaultSettings(): Promise<void> {
    try {
      // Aquí podrías inicializar configuraciones por defecto
      // como crear un usuario administrador inicial, etc.
      console.log('⚙️ Inicializando configuraciones por defecto...');
    } catch (error) {
      console.error('❌ Error inicializando configuraciones:', error);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Recibida señal ${signal}. Cerrando aplicación...`);
      
      try {
        // Detener programador de recordatorios
        this.reminderScheduler.stop();
        
        // Desconectar WhatsApp
        await this.apiServer.getWhatsAppService().disconnect();
        
        console.log('✅ Aplicación cerrada correctamente');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error cerrando aplicación:', error);
        process.exit(1);
      }
    };

    // Manejar señales del sistema
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Manejar errores no capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Error no capturado:', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promesa rechazada no manejada:', reason);
      shutdown('UNHANDLED_REJECTION');
    });
  }
}

// Iniciar la aplicación
const app = new CarlBotApplication();
app.start().catch((error) => {
  console.error('❌ Error fatal iniciando aplicación:', error);
  process.exit(1);
});