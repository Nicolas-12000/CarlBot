import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema'; // Importamos el esquema que acabamos de definir

// Configura tus credenciales de base de datos.
// Es altamente recomendable usar variables de entorno para esto en un proyecto real.
const connection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password', // ¡Cambia esto por una contraseña segura!
  database: process.env.DB_NAME || 'carlbot_db',
});

// Exportamos el cliente de Drizzle
export const db = drizzle(connection, { schema, mode: 'default' });