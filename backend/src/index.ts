import express, { Application } from 'express'
 
import cors from 'cors'
import connectDB from './config/db'
import productRoutes from './routes/product.routes'
import authRoutes from './routes/auth.routes'
import errorHandler from './middlewares/errorHandler.middleware'
import helmet from 'helmet'
import { sanitizeInputs } from './middlewares/sanitize'
import session from 'express-session'
import { redisClient, RedisStore } from './config/redis'

 
process.loadEnvFile()

const startServer = async (): Promise<void> => {
  try {
    // Conexión a la base de datos
    await connectDB()

    const app: Application = express()
    const PORT: number = Number(process.env.PORT) || 3000

    // Middlewares
    app.use(express.json()) // Para el cuerpo de las solicitudes en JSON
    app.use(sanitizeInputs) // Sanitiza las entradas
    app.use(helmet()) // Protege contra vulnerabilidades comunes
    app.use(express.urlencoded({ extended: true })) // Para cuerpos URL codificados
    app.use(express.static('public')) // Servir archivos estáticos desde la carpeta 'public'
    app.use(cors({
      origin: 'http://localhost:3000', // Asegúrate de ajustar esto para el origen de tu cliente
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }))

    // Configuración de la sesión con Redis
    app.use(
      session({
        store: new RedisStore({ client: redisClient }),
        secret: process.env.JWT_SECRET || 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          maxAge: 1000 * 60 * 15, // 15 minutos
          secure: process.env.NODE_ENV === 'production', // Asegúrate de usar HTTPS en producción
        }
      })
    )

    // Rutas
    app.use('/api/auth', authRoutes)
    app.use('/api/products', productRoutes)

    // Middleware de manejo de errores
    app.use(errorHandler)

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Error starting server:', error)
    process.exit(1)
  }
}

startServer()
