// src/types/express-session.d.ts
import { Session } from 'express-session';

declare module 'express-session' {
  interface Session {
    userId?: string;
    role?: 'admin' | 'user';
  }
}
