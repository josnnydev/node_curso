 

  export interface Product {
    _id: string
    name: string
    price: number
  }

  
  
  export interface ProductBody {
    name: string
    description: string
    price: number
    userId: Types.ObjectId
    image?: string
  }
  

  