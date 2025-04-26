import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { redisClient } from '../config/redis'

interface JwtPayload {
  id: string
  role: 'admin' | 'user'
}

// Extiende el objeto Request para incluir info del usuario
declare global {
  namespace Express {
    interface Request {
      userId?: string
      role?: 'admin' | 'user'
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' })
    return
  }

  const token = authHeader.split(' ')[1]
  console.log('Token recibido:', token)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload
    console.log('Token decodificado:', decoded)

    // Verificamos si la sesión está activa en Redis
    const session = await redisClient.get(`session:${decoded.id}`)

    if (!session) {
      res.status(401).json({ message: 'Unauthorized: Session expired or invalid' })
      return
    }

    const sessionData = JSON.parse(session)
    req.userId = decoded.id
    req.role = sessionData.role

    console.log('Autenticación exitosa. userId:', req.userId, 'role:', req.role)
    console.log('ID del usuario desde protect:', req.userId)


    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Unauthorized: Token has expired' })
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Unauthorized: Invalid token' })
    } else {
      res.status(500).json({ message: 'Internal Server Error', error })
    }
  }
}
