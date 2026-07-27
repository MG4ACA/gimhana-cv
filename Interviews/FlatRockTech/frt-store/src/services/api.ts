import type { BrandResponse, CategoriesResponse, Product, ProductsResponse } from '@/types'

const BASE_URL = 'http://localhost:3010'

export const api = {
  getProducts: (): Promise<ProductsResponse> =>
    fetch(`${BASE_URL}/products`).then(r => r.json()),

  getProduct: (id: string): Promise<Product> =>
    fetch(`${BASE_URL}/products/${id}`).then(r => r.json()),

  getBrands: (): Promise<BrandResponse> =>
    fetch(`${BASE_URL}/brands`).then(r => r.json()),

  getCategories: (): Promise<CategoriesResponse> =>
    fetch(`${BASE_URL}/categories`).then(r => r.json()),

  checkout: (payload: unknown): Promise<Response> =>
    fetch(`${BASE_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
}
