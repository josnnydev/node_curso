 // middlewares/roleCheck.middleware.ts
import { Request, Response, NextFunction } from 'express'

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.role !== 'admin') {
    res.status(403).json({ message: 'Access denied, admin role required' })
    return
  }

  next()
}
