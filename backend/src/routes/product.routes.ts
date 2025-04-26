import { Router } from 'express'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller'
import { protect } from '../middlewares/auth.middleware'
import { validateProduct } from '../middlewares/validates.middleware'
import { isAdmin } from '../middlewares/roleCheck.middleware'
import upload from '../middlewares/upload.middleware'
import { sanitizeInputs } from '../middlewares/sanitize'

const productRouter: Router = Router()

// Rutas públicas (sin protección)
productRouter.get('/', sanitizeInputs,protect, isAdmin, getProducts )

// Rutas protegidas (requieren autenticación)
productRouter.post('/', sanitizeInputs, protect, validateProduct, isAdmin, upload.single('image'), createProduct)
productRouter.put('/:id', sanitizeInputs, protect, validateProduct, isAdmin, upload.single('image'), updateProduct)
productRouter.delete('/:id', sanitizeInputs, protect, isAdmin, deleteProduct)

export default productRouter
