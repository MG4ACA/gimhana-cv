<script setup lang="ts">
import type { Product } from "@/types";
import { useRouter } from "vue-router";

const props = defineProps<{ product: Product }>()
const router = useRouter()

const goToDetail = () => {
  router.push(`/product/${props.product.id}`)
}

const quickAdd = () => {
  // Stage II placeholder
  console.log("Quick add:", props.product.product_name)
}
</script>

<template>
  <div class="card" @click="goToDetail">
    <div class="card__image-wrapper">
      <img src="https://placehold.co/400x400/f3f4f6/9ca3af?text=Image" :alt="product.product_name" class="card__image" />
      <button class="card__quick-add" @click.stop="quickAdd">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      </button>
    </div>
    <div class="card__info">
      <div class="card__meta">
        <p class="card__name">{{ product.product_name }}</p>
        <p class="card__brand">{{ product.brand }}</p>
      </div>
      <p class="card__price">${{ product.price.toFixed(2) }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;
@use "@/assets/styles/mixins" as *;

.card {
  cursor: pointer;
  border-radius: $border-radius;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: $color-bg;
  border: 1px solid $color-bg-alt;

  &:hover { 
    transform: translateY(-2px);
    box-shadow: $shadow-md; 
  }

  &__image-wrapper {
    position: relative;
    background-color: $color-bg-alt;
    padding: $space-sm;
  }

  &__image { 
    width: 100%; 
    aspect-ratio: 1; 
    object-fit: cover; 
    border-radius: 4px;
  }

  &__quick-add {
    position: absolute;
    top: $space-sm;
    right: $space-sm;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: white;
    color: $color-primary;
    @include flex-center;
    box-shadow: $shadow-sm;
    transition: background-color 0.2s;

    &:hover {
      background: $color-bg-alt;
    }
  }

  &__info { 
    padding: $space-md; 
    display: flex;
    flex-direction: column;
    gap: $space-lg;
    text-align: center;
  }
  
  &__name { font-weight: 700; font-size: $font-size-md; color: $color-primary; }
  &__brand { color: $color-muted; font-size: $font-size-sm; margin-top: 4px; }
  &__price { font-weight: 800; font-size: $font-size-lg; }
}
</style>
