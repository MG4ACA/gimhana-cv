import { ref, computed, type Ref } from "vue"
import type { Product } from "@/types"

export function useFilters(products: Ref<Product[]>) {
  const selectedCategory = ref("all")
  const selectedBrands = ref<string[]>([])
  const sortBy = ref("date_desc")

  const filteredProducts = computed(() => {
    let result = [...products.value]

    // Category filter
    if (selectedCategory.value !== "all") {
      result = result.filter(p => p.category === selectedCategory.value)
    }

    // Brand filter — empty array means all brands shown
    if (selectedBrands.value.length > 0) {
      result = result.filter(p => selectedBrands.value.includes(p.brand))
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy.value === "date_desc") {
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
      }
      if (sortBy.value === "date_asc") {
        return new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
      }
      if (sortBy.value === "price_asc") {
        return a.price - b.price
      }
      return 0
    })

    return result
  })

  return { selectedCategory, selectedBrands, sortBy, filteredProducts }
}
