import { Request, Response } from 'express'
import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import { redisClient } from '../config/redis'
import bcrypt from 'bcryptjs'
 

process.loadEnvFile()

 

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'mi_clave_secreta', {
    expiresIn: '7d' // El token expirará en 7 días
  })
}

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body

  if (!email || !password || !role) {
    res.status(400).json({ message: 'Email, password, and role are required' })
    return
  }

  try {
    // Verificamos si el usuario ya existe
    const exists = await User.findOne({ email })
    if (exists) {
      res.status(400).json({ message: 'User already exists' })
      return
    }

    // Encriptamos la contraseña antes de guardarla
    
    
    const user = new User({ email, password, role })
    
    
    await user.save()

    // Generamos el token JWT
    const token = generateToken(user._id.toString(), user.role)

    // Guardamos la sesión en Redis con un tiempo de expiración
    await redisClient.set(
      `session:${user._id}`,
      JSON.stringify({ role: user.role }),
      { EX: 86400 } // 1 día
    )

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error })
  }
}


export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' })
    return
  }

  const token = authHeader.split(' ')[1]
  console.log('Token recibido:', token)

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' })
    return
  }

  try {
    // Verificamos si el usuario existe
    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({ message: 'User not found' })
      return
    }

    

    // Verificamos si la contraseña coincide
    const trimmedPassword = password.trim() // Esto elimina espacios innecesarios
    const isMatch = await bcrypt.compare(trimmedPassword, user.password)
    console.log('¿La contraseña coincide?', isMatch);
    
    

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    // Generamos el token JWT
    const token = generateToken(user._id.toString(), user.role)

    // Renovamos la sesión en Redis con un nuevo tiempo de expiración
    await redisClient.set(
      `session:${user._id}`,
      JSON.stringify({ role: user.role }),
      { EX: 86400 } // 1 día
    )

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error })
  }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization

  // Verificamos que el encabezado Authorization esté presente y comience con "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' })
    return
  }

  const token = authHeader.split(' ')[1]  // Extraemos el token del encabezado

  try {
    // Verificamos el token y decodificamos su contenido
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string, role: string }

    const userId = decoded.id  // Extraemos el userId del payload del token
    console.log('User ID en logout:', userId)

    if (!userId) {
      res.status(400).json({ message: 'No user ID found in token' })
      return
    }

    // Eliminar la clave de sesión de Redis
    await redisClient.del(`session:${userId}`)

    // Limpiar la caché de productos del usuario
    const cacheKey = `products:${userId}:*`
    await redisClient.del(cacheKey)

    res.status(200).json({ message: 'Logout successful', userId })
  } catch (error) {
    console.error('Error al eliminar la sesión:', error)
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Unauthorized: Token has expired' })
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Unauthorized: Invalid token' })
    } else {
      res.status(500).json({ message: 'Internal Server Error', error })
    }
  }
}
