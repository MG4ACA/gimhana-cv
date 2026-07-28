<script setup lang="ts">
import type { Product } from "@/types";
import ProductCard from "./ProductCard.vue";

defineProps<{
  products: Product[]
}>()
</script>

<template>
  <div class="grid">
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
    />
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $card-gap;
}
</style>
