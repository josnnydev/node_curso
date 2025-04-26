import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'

export const validateProduct = (req: Request, res: Response, next: NextFunction): void => {
  const schema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    description: z.string().min(5, 'Description must be at least 5 characters long'),
    price: z.number().positive(),
    image: z.string().optional(),
  })

  try {
    schema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors })
    } else {
      next(error) // Pass the error to the next middleware (error handler)
    }
  }
}

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })

  try {
    schema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors })
    } else {
      next(error) // Pass the error to the next middleware (error handler)
    }
  }
}

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.string().default('user'),
  })

  try {
    schema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors })
    } else {
      next(error) // Pass the error to the next middleware (error handler)
    }
  }
}

 
