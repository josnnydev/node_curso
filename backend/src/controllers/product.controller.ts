import { Request, Response } from 'express'
import ProductModel, { IProduct } from '../models/product.model'
import mongoose from 'mongoose'
import { ProductBody } from '../types/types'
import { redisClient } from '../config/redis'
 

const clearCache = async (userId: mongoose.Types.ObjectId) => {
  const keys = await redisClient.keys(`products:${userId}:page:*:limit:*`)

  if (keys.length > 0) {
    await Promise.all(keys.map((key) => redisClient.del(key)))
  }
  
}





export const getProducts = async (_req: Request, res: Response): Promise<void> => {
  console.log('User ID en getProducts:', _req.userId)
  const userId = _req.userId
  const { page = 1, limit = 10 } = _req.query

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  try {
    // Intentamos obtener los productos desde Redis
    const cacheKey = `products:${userId}:page:${page}:limit:${limit}`
    const cachedProducts = await redisClient.get(cacheKey)

    if (cachedProducts) {
      // Si los productos están en caché, retornamos la respuesta desde Redis
      const { products, totalProducts, totalPages, currentPage } = JSON.parse(cachedProducts)
      res.status(200).json({ products, totalProducts, totalPages, currentPage })
      return
    }

    // Si no están en caché, obtenemos los productos desde la base de datos
    const products = await ProductModel.find({ userId })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    console.log('Productos encontrados:', products) 

     


    const totalProducts = await ProductModel.countDocuments({ userId })

    // Guardamos los productos en caché para futuras peticiones
    const cacheData = JSON.stringify({
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / Number(limit)),
      currentPage: Number(page),
    })
    await redisClient.set(cacheKey, cacheData, { EX: 3600 })  // Expires in 1 hour

    res.status(200).json({
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / Number(limit)),
      currentPage: Number(page),
      userId
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error })
  }
}

export const createProduct = async (
  req: Request<{}, {}, ProductBody>,
  res: Response
): Promise<void> => {
  console.log('User ID en createProduct:', req.userId)
  const { name, description, price, image } = req.body
  const userId = req.userId

  if (!name || !price) {
    res.status(400).json({ message: 'Name and price are required' })
    return
  }

  try {
    const newProduct: IProduct = new ProductModel({ name, description, price, userId, image })
    await newProduct.save()

    // Limpiamos la caché del usuario
    await clearCache(new mongoose.Types.ObjectId(userId))


  

    res.status(201).json(newProduct)
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error })
  }
}

export const updateProduct = async (
  req: Request<{ id: string }, {}, ProductBody>,
  res: Response
): Promise<void> => {
  const { id } = req.params
  const userId = req.userId
  console.log('User ID en updateProduct:', userId)

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid product ID' })
    return
  }

  try {
    const product = await ProductModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    })

    if (!product) {
      res.status(404).json({ message: 'Product not found' })
      return
    }

    // Limpiamos la caché del producto afectado
    await clearCache(new mongoose.Types.ObjectId(userId))

    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error })
  }
}

export const deleteProduct = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params
  const userId = req.userId

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid product ID' })
    return
  }

  try {
    const deleted = await ProductModel.findByIdAndDelete(id)

    if (!deleted) {
      res.status(404).json({ message: 'Product not found' })
      return
    }

     // Limpiamos la caché del producto afectado
    await clearCache(new mongoose.Types.ObjectId(userId))

    res.status(200).json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error })
  }
}
