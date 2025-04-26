import { Schema, model, Document, Types } from 'mongoose'

export interface IProduct extends Document {
  name: string
  description: string
  price: number
  userId: Types.ObjectId // Usar Types.ObjectId correctamente
  image?: string
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true }, // Usar Schema.Types.ObjectId
    image: { type: String },
  },
  {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
    versionKey: false, // Desactiva el campo __v
  }
)

const ProductModel = model<IProduct>('Product', productSchema)

export default ProductModel
