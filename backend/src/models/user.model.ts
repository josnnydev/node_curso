import { Schema, model, Document, Types } from 'mongoose'
import bcrypt from 'bcryptjs'


process.loadEnvFile()

export interface IUser extends Document {
  _id: Types.ObjectId
  
  email: string
  password: string
  
  role: 'admin' | 'user'
  comparePassword(candidate: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
     
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
  },
  {
    versionKey: false,
    timestamps: true // Añadir timestamps opcionalmente
  }
)

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err as Error)
  }
})

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
    try {
      console.log("Stored password:", this.password)  // Contraseña guardada encriptada
      console.log("Candidate password:", candidate)   // Contraseña enviada por el usuario
  
      const match = await bcrypt.compare(candidate, this.password)
  
      console.log("Password Match:", match)  // Resultado de la comparación
  
      return match
    } catch (err) {
      console.error("Error comparing passwords:", err)
      return false
    }
  }
  
  
  

export default model<IUser>('User', userSchema)
