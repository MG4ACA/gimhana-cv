import { api } from '@/services/api';
import type { Brand, Category, Product, ProductsResponse } from '@/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProductsStore = defineStore('products', ()=>{

  const products = ref<Product[] | null>(null);
  const categories = ref<Category[] | null> (null);
  const brands = ref<Brand[]| null> (null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  
  const fetchProducts = async(): Promise<ProductsResponse> => {
    try {
      isLoading.value = true;
      error.value = null;
      const res = await api.getProducts();
      products.value = res;
      return res;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load products";
      throw e;
    } finally {
      isLoading.value = false
    }
  }

  const fetchAll = async() =>{
    try {
      isLoading.value = true;
      error.value = null;
      const [ , categoryData, brandData ] = await Promise.all([
        fetchProducts(),
        api.getCategories(),
        api.getBrands()
      ]);

      brands.value = brandData;
      categories.value = categoryData;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load product store data";
      throw e;
    } finally {
      isLoading.value = false;
    }
  }
    
  return { fetchProducts, products, isLoading, categories, brands, fetchAll, error } 
})
