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
      <CategoryTabs :categories="store.categories" v-model="selectedCategory" />
      <BrandFilter :brands="store.brands" v-model="selectedBrands" />
      <SortByFilter v-model="sortBy" />
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
  padding-top: $space-xl;
  padding-bottom: $space-xl;
}
.page-title { margin-bottom: $space-lg; font-size: 24px; font-weight: 600; }
.state-msg { text-align: center; padding: $space-xl; color: $color-muted; }
.error { color: $color-error; }
</style>
