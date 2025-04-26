declare namespace Express {
    export interface Request {
      sanitizedQuery?: Record<string, any>;
    }
  }
  