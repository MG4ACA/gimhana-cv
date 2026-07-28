<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue"
import BrandFilter from "@/components/plp/BrandFilter.vue"
import CategoryTabs from "@/components/plp/CategoryTabs.vue"
import ProductGrid from "@/components/plp/ProductGrid.vue"
import SortByFilter from "@/components/plp/SortByFilter.vue"
import { useFilters } from "@/composables/useFilters"
import { useProductsStore } from "@/stores/products"
import { computed, onMounted } from "vue"

const store = useProductsStore()
const productsRef = computed(() => store.products || [])
onMounted(() => {
  store.fetchAll()
})

const { filteredProducts, selectedCategory, selectedBrands, sortBy } = useFilters(productsRef)
</script>

<template>
  <div class="page-wrapper">
    <AppHeader />
    <main class="container">
      <h1 class="page-title">Products</h1>
      
      <div class="controls-bar">
        <CategoryTabs :categories="store.categories || []" v-model="selectedCategory" />
        
        <div class="controls-bar__right">
          <BrandFilter :brands="store.brands || []" v-model="selectedBrands" />
          
          <!-- Mock Price filter to match Stage I design requirements for layout -->
          <button class="mock-filter">
            Price 
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          <SortByFilter v-model="sortBy" />
        </div>
      </div>
      
      <div v-if="store.isLoading" class="state-msg">Loading products...</div>
      <div v-else-if="store.error" class="state-msg error">{{ store.error }}</div>
      <ProductGrid v-else-if="store.products" :products="filteredProducts" />
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/mixins" as *;
@use "@/assets/styles/variables" as *;

.page-wrapper { min-height: 100vh; }
.container {
  @include container;
  padding-top: $space-md;
  padding-bottom: $space-xl;
}
.page-title { margin-bottom: $space-lg; font-size: 28px; font-weight: 800; }
.state-msg { text-align: center; padding: $space-xl; color: $color-muted; }
.error { color: $color-error; }

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-xl;
  
  &__right {
    display: flex;
    gap: $space-sm;
    align-items: center;
  }
}

.mock-filter {
  @include flex-center;
  gap: 8px;
  padding: $space-xs $space-md;
  border-radius: 20px;
  background-color: $color-bg-alt;
  color: $color-primary;
  font-size: $font-size-sm;
  font-weight: 500;
  transition: background-color 0.2s;
  cursor: pointer;

  &:hover {
    background-color: #e2e8f0;
  }
}
</style>
