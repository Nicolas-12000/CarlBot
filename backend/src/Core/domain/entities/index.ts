// Entidad Event
export interface Event {
    id?: number;
    name: string;
    description?: string;
    date: Date;
    location: string;
    mapsLink?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // Entidad Speaker
  export interface Speaker {
    id?: number;
    name: string;
    bio?: string;
    topic: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // Entidad Schedule
  export interface Schedule {
    id?: number;
    eventId: number;
    speakerId: number;
    startTime: Date;
    endTime: Date;
    reminderSent?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    // Relaciones opcionales para consultas
    event?: Event;
    speaker?: Speaker;
  }
  
  // Entidad Subscriber
  export interface Subscriber {
    id?: number;
    phoneNumber: string;
    eventId: number;
    isActive?: boolean;
    subscribedAt?: Date;
    // Relación opcional
    event?: Event;
  }
  
  // Entidad BotSettings
  export interface BotSettings {
    id?: number;
    phoneNumber: string;
    password: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // Value Objects
  export interface WhatsAppMessage {
    from: string;
    to: string;
    message: string;
    timestamp: Date;
  }
  
  export interface BotResponse {
    message: string;
    options?: string[];
  }
  
  // DTOs para las APIs
  export interface CreateEventDTO {
    name: string;
    description?: string;
    date: string;
    location: string;
    mapsLink?: string;
  }
  
  export interface CreateSpeakerDTO {
    name: string;
    bio?: string;
    topic: string;
  }
  
  export interface CreateScheduleDTO {
    eventId: number;
    speakerId: number;
    startTime: string;
    endTime: string;
  }
  
  export interface SubscribeDTO {
    phoneNumber: string;
    eventId: number;
  }