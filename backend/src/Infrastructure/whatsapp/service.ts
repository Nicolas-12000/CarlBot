import { Boom } from '@hapi/boom';
import makeWASocket, {
  AnyMessageContent,
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
  isJidBroadcast,
  isJidGroup,
} from '@whiskeysockets/baileys';
import { WhatsAppRepository } from '../../Core/domain/repositories';
import pino from 'pino';
import qrcode from 'qrcode-terminal';

export class BaileysWhatsAppService implements WhatsAppRepository {
  private socket: WASocket | null = null;
  private isConnectionActive = false;
  private logger = pino({ level: 'silent' });

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      console.log('🔄 Inicializando conexión con WhatsApp...');

      // Usar estado de autenticación multi-archivo
      const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

      // Crear socket de WhatsApp
      this.socket = makeWASocket({
        logger: this.logger,
        printQRInTerminal: false,
        auth: state,
        generateHighQualityLinkPreview: true,
      });

      // Manejar eventos de conexión
      this.socket.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          console.log('📱 Escanea este código QR con WhatsApp:');
          qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log('❌ Conexión cerrada debido a:', lastDisconnect?.error, 'Reconectando...', shouldReconnect);
          
          if (shouldReconnect) {
            this.initializeConnection();
          }
          this.isConnectionActive = false;
        } else if (connection === 'open') {
          console.log('✅ Conexión a WhatsApp establecida exitosamente');
          this.isConnectionActive = true;
        }
      });

      // Guardar credenciales cuando se actualicen
      this.socket.ev.on('creds.update', saveCreds);

      // Manejar mensajes entrantes
      this.socket.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        
        if (!message.key.fromMe && message.message) {
          await this.handleIncomingMessage(message);
        }
      });

    } catch (error) {
      console.error('❌ Error inicializando WhatsApp:', error);
      setTimeout(() => this.initializeConnection(), 5000);
    }
  }

  private async handleIncomingMessage(message: proto.IWebMessageInfo): Promise<void> {
    try {
      const from = message.key.remoteJid;
      const messageText = this.extractMessageText(message);

      if (!from || !messageText || isJidBroadcast(from) || isJidGroup(from)) {
        return;
      }

      // Procesar el mensaje usando el caso de uso correspondiente
      // Esto se conectará con el WhatsAppBotUseCase
      console.log(`📨 Mensaje recibido de ${from}: ${messageText}`);
      
      // Por ahora, enviar respuesta básica
      // En la implementación completa, esto se conectará con el caso de uso
      if (messageText.toLowerCase().includes('hola') || messageText.toLowerCase().includes('menu')) {
        await this.sendMessage(from, `¡Hola! 👋 Soy CarlBot, tu asistente para eventos académicos.

*Menú de opciones:*

1️⃣ Ver información del evento
2️⃣ Ver horario de ponencias
3️⃣ Ver ubicación del evento
4️⃣ Suscribirse al evento
5️⃣ Desuscribirse del evento

*Responde con el número de la opción que deseas.*`);
      }

    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
    }
  }

  private extractMessageText(message: proto.IWebMessageInfo): string | null {
    return (
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      null
    );
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      if (!this.socket || !this.isConnectionActive) {
        console.error('❌ WhatsApp no está conectado');
        return false;
      }

      await this.socket.sendMessage(to, { text: message });
      console.log(`✅ Mensaje enviado a ${to}: ${message.substring(0, 50)}...`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      return false;
    }
  }

  async sendMessageToMultiple(phoneNumbers: string[], message: string): Promise<boolean> {
    try {
      if (!this.socket || !this.isConnectionActive) {
        console.error('❌ WhatsApp no está conectado');
        return false;
      }

      const promises = phoneNumbers.map(async (phoneNumber) => {
        // Formatear número de teléfono para WhatsApp
        const formattedNumber = this.formatPhoneNumber(phoneNumber);
        return await this.sendMessage(formattedNumber, message);
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(Boolean).length;
      
      console.log(`✅ Mensajes enviados: ${successCount}/${phoneNumbers.length}`);
      return successCount > 0;
    } catch (error) {
      console.error('❌ Error enviando mensajes múltiples:', error);
      return false;
    }
  }

  async isConnected(): Promise<boolean> {
    return this.isConnectionActive;
  }

  async getQRCode(): Promise<string | null> {
    // En esta implementación, el QR se muestra en la consola
    // Para la web, se podría implementar un mecanismo para capturar el QR
    return null;
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remover caracteres no numéricos
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Agregar código de país si no existe (asumiendo Colombia +57)
    if (!cleaned.startsWith('57') && cleaned.length === 10) {
      return `57${cleaned}@s.whatsapp.net`;
    }
    
    return `${cleaned}@s.whatsapp.net`;
  }

  // Método para cerrar la conexión
  async disconnect(): Promise<void> {
    if (this.socket) {
      await this.socket.logout();
      this.socket = null;
      this.isConnectionActive = false;
      console.log('🔌 Desconectado de WhatsApp');
    }
  }

  // Método para obtener información del bot
  async getBotInfo(): Promise<{ phoneNumber: string; isConnected: boolean } | null> {
    if (!this.socket || !this.isConnectionActive) {
      return null;
    }

    try {
      const info = this.socket.user;
      return {
        phoneNumber: info?.id?.split(':')[0] || 'Desconocido',
        isConnected: this.isConnectionActive,
      };
    } catch (error) {
      console.error('❌ Error obteniendo información del bot:', error);
      return null;
    }
  }
}