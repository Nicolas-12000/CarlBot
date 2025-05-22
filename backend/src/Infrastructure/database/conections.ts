import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { 
  events, 
  speakers, 
  schedules, 
  subscribers, 
  botSettings,
  eventsRelations,
  speakersRelations,
  schedulesRelations,
  subscribersRelations
} from './schema';

// Configuración de la conexión
const connection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'carlbot',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Instancia de Drizzle ORM
// Instancia de Drizzle ORM
export const db = drizzle(connection, {
    schema: {
      events,
      speakers,
      schedules,
      subscribers,
      botSettings,
      eventsRelations,
      speakersRelations,
      schedulesRelations,
      subscribersRelations
    },
    mode: 'default' // Agrega esta línea
  });

// Función para probar la conexión
export async function testConnection(): Promise<boolean> {
  try {
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Conexión a base de datos exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    return false;
  }
}

// Función para cerrar la conexión
export async function closeConnection(): Promise<void> {
  await connection.end();
}