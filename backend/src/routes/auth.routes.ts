import { Router } from 'express'
import { register, login, logout } from '../controllers/auth.controller'
import { validateRegister, validateLogin} from '../middlewares/validates.middleware'
import { protect } from '../middlewares/auth.middleware'
import { sanitizeInputs } from '../middlewares/sanitize'

const authRouter: Router = Router()

// Rutas de autenticación
authRouter.post('/register', sanitizeInputs, validateRegister, register)  // sanitización antes de validación
authRouter.post('/login', sanitizeInputs, validateLogin, login)  // sanitización antes de validación
authRouter.post('/logout', logout)  // No necesita protección

export default authRouter
