import * as cron from 'node-cron';
import { WhatsAppBotUseCase } from '../../Application/useCases';

export class ReminderScheduler {
  private reminderJob: cron.ScheduledTask | null = null;

  constructor(private whatsAppBotUseCase: WhatsAppBotUseCase) {}

  // Iniciar el programador de recordatorios
  start(): void {
    console.log('🕐 Iniciando programador de recordatorios...');
    
    // Ejecutar cada minuto para verificar recordatorios pendientes
    this.reminderJob = cron.schedule('* * * * *', async () => {
      try {
        await this.checkAndSendReminders();
      } catch (error) {
        console.error('❌ Error en programador de recordatorios:', error);
      }
    });

    console.log('✅ Programador de recordatorios iniciado exitosamente');
  }

  // Detener el programador de recordatorios
  stop(): void {
    if (this.reminderJob) {
      this.reminderJob.stop();
      this.reminderJob = null;
      console.log('🛑 Programador de recordatorios detenido');
    }
  }

  // Verificar y enviar recordatorios pendientes
  private async checkAndSendReminders(): Promise<void> {
    try {
      await this.whatsAppBotUseCase.sendReminders();
    } catch (error) {
      console.error('❌ Error enviando recordatorios:', error);
    }
  }

  // Verificar si el programador está activo
  isRunning(): boolean {
    return this.reminderJob !== null;
  }

  // Programar recordatorio específico para una fecha/hora
  scheduleSpecificReminder(date: Date, message: string, phoneNumbers: string[]): void {
    const cronExpression = this.dateToCronExpression(date);
    
    console.log(`📅 Programando recordatorio específico para: ${date.toISOString()}`);
    
    const job = cron.schedule(cronExpression, async () => {
      try {
        // Aquí deberías usar el servicio de WhatsApp directamente
        console.log(`🔔 Enviando recordatorio programado: ${message}`);
        // await this.whatsAppService.sendMessageToMultiple(phoneNumbers, message);
        
        // Destruir el trabajo después de ejecutarlo
        job.stop();
      } catch (error) {
        console.error('❌ Error enviando recordatorio programado:', error);
      }
    });
  }

  // Convertir fecha a expresión cron
  private dateToCronExpression(date: Date): string {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1; // Los meses en cron van de 1-12
    
    return `${minute} ${hour} ${dayOfMonth} ${month} *`;
  }

  // Programar recordatorio de inicio de evento
  scheduleEventStartReminder(eventDate: Date, eventName: string, phoneNumbers: string[]): void {
    // Recordatorio 1 hora antes del evento
    const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000);
    const message = `🎉 *Recordatorio de Evento*\n\nEl evento "${eventName}" comenzará en 1 hora.\n\n¡Prepárate para una experiencia increíble! 🚀`;
    
    this.scheduleSpecificReminder(oneHourBefore, message, phoneNumbers);
    
    // Recordatorio 15 minutos antes del evento
    const fifteenMinutesBefore = new Date(eventDate.getTime() - 15 * 60 * 1000);
    const urgentMessage = `⏰ *¡El evento está por comenzar!*\n\n"${eventName}" iniciará en 15 minutos.\n\n¡Es hora de dirigirse al lugar del evento! 📍`;
    
    this.scheduleSpecificReminder(fifteenMinutesBefore, urgentMessage, phoneNumbers);
  }

  // Programar recordatorios diarios de resumen
  scheduleDailySummary(): void {
    // Ejecutar todos los días a las 8:00 AM
    cron.schedule('0 8 * * *', async () => {
      try {
        console.log('📊 Ejecutando resumen diario...');
        await this.sendDailySummary();
      } catch (error) {
        console.error('❌ Error enviando resumen diario:', error);
      }
    });
    
    console.log('📅 Resumen diario programado para las 8:00 AM');
  }

  // Enviar resumen diario (implementación básica)
  private async sendDailySummary(): Promise<void> {
    // Aquí podrías implementar la lógica para enviar un resumen diario
    // de eventos próximos a los administradores
    console.log('📊 Enviando resumen diario de eventos...');
  }

  // Limpiar recordatorios antiguos
  cleanupOldReminders(): void {
    cron.schedule('0 0 * * *', () => {
      console.log('🧹 Limpiando recordatorios antiguos...');
      // Implementar lógica para limpiar recordatorios de eventos pasados
    });
  }

  // Obtener próximos recordatorios programados
  getUpcomingReminders(): string[] {
    // Esta sería una implementación más avanzada para mostrar
    // los próximos recordatorios en el panel administrativo
    return [];
  }
}