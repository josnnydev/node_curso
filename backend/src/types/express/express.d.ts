// types/express.d.ts

import { IUser } from '../models/user.model' // Ajusta la ruta según la ubicación de tu modelo

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Aquí añades la propiedad user con el tipo IUser
      sanitizedQuery?: Record<string, any>;
      userId?: string;
      role?: 'admin' | 'user';
    }
  }
}
