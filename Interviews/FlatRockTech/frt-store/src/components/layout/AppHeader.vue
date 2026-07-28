<script setup lang="ts">
import { ref } from "vue"

// Mock cart count for now (from Figma design).
const cartCount = ref(3) 

const toggleCart = () => {
  // isCartOpen.value = !isCartOpen.value
}
</script>

<template>
  <header class="header">
    <div class="header__container">
      <RouterLink to="/" class="header__logo">Flat Rock Tech</RouterLink>
      
      <div class="header__cart">
        <button class="header__cart-btn" @click="toggleCart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span class="header__badge" v-if="cartCount > 0">{{ cartCount }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/mixins" as *;
@use "@/assets/styles/variables" as *;

.header {
  border-bottom: 1px solid $color-bg-light;
  background: $color-bg;
  position: sticky;
  top: 0;
  z-index: 100;

  &__container {
    @include container;
    @include flex-between;
    height: 80px;
  }

  &__logo {
    font-size: 22px;
    font-weight: 800;
    font-style: italic;
    color: #102a43;
    letter-spacing: -0.5px;
  }

  &__cart {
    position: relative;

    &-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background-color: #faf5f5;
      color: #102a43;
      @include flex-center;
      position: relative;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f3ebeb;
      }
    }
  }

  &__badge {
    position: absolute;
    top: -2px;
    right: -4px;
    background-color: #334155;
    color: white;
    font-size: 11px;
    font-weight: 700;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    @include flex-center;
    border: 2px solid white;
  }
}
</style>
