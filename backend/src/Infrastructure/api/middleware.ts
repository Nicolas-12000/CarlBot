import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface para el payload del JWT
interface JWTPayload {
  phoneNumber: string;
  id: number;
  iat: number;
  exp: number;
}

// Extender la interface Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Middleware de autenticación
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token de acceso requerido' });
      return;
    }

    const token = authHeader.substring(7); // Remover 'Bearer '
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'carlbot-secret') as JWTPayload;
      req.user = decoded;
      next();
    } catch (jwtError) {
      res.status(401).json({ error: 'Token inválido o expirado' });
      return;
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Middleware de manejo de errores
export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('Error no manejado:', error);
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Ha ocurrido un error inesperado'
  });
}

// Middleware de logging
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
  next();
}

// Middleware para validar JSON
export function validateJSON(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'POST' || req.method === 'PUT') {
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      // Express ya parsea el JSON automáticamente, pero podemos agregar validación adicional aquí
      if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).json({ error: 'Cuerpo de la petición requerido' });
        return;
      }
    }
  }
  next();
}