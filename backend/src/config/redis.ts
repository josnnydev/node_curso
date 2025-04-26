import { createClient } from 'redis'
import connectRedis from 'connect-redis'
import session from 'express-session'

process.loadEnvFile()

 



 
// Crear el cliente de Redis
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379', // Configura correctamente la URL de tu Redis
})

redisClient.on('error', (err) => console.error('Redis Error:', err))

// Nos aseguramos de que la conexión esté establecida correctamente
redisClient.connect()

// Crear RedisStore usando el cliente Redis
const RedisStore = connectRedis(session)



export { redisClient, RedisStore }
