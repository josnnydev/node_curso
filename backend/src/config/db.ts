import mongoose from 'mongoose'
 
process.loadEnvFile()



const connectDB = async (): Promise<void> => {
    
  try {
    
    const conn = await mongoose.connect(process.env.MONGO_URI || 'http://localhost:27017')
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1)
  }
}

export default connectDB
