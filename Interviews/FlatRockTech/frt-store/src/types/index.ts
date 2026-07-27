export interface Brand {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
}

export interface Option {
  option_type: string
  option_name: string
}

export interface SelectibleOption extends Option {
  option: string[]   
}

export interface Product {
  id: string
  product_name: string
  category: string
  price: number
  brand: string
  stock_quantity: number
  release_date: string                       
  description: string
  selectible_option: SelectibleOption | null  
}

export interface CartItem {
  cartKey: string         
  productId: string
  product_name: string
  brand: string
  price: number
  selectedOption: string | null
  qty: number
}

export interface CheckoutPayload {
  name: string
  surname: string
  phone: string
  email: string
  zip_code: string
  items: {
    productId: string
    product_name: string
    qty: number
    selectedOption: string | null
    price: number
  }[]
}

export type BrandResponse = Brand[]
export type CategoriesResponse = Category[]
export type ProductsResponse = Product[]
