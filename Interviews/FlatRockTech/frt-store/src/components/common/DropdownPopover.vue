<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

defineProps<{
  label: string
}>()

const isOpen = ref(false)
const popoverRef = ref<HTMLElement | null>(null)

const toggle = () => {
  isOpen.value = !isOpen.value
}

// Close when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (popoverRef.value && !popoverRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="dropdown" ref="popoverRef">
    <button class="dropdown__toggle" @click="toggle" :class="{ 'dropdown__toggle--active': isOpen }">
      {{ label }}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
    <div v-if="isOpen" class="dropdown__menu">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;
@use "@/assets/styles/mixins" as *;

.dropdown {
  position: relative;
  display: inline-block;

  &__toggle {
    @include flex-center;
    gap: 8px;
    padding: $space-xs $space-md;
    border-radius: 20px;
    background-color: $color-bg-alt;
    color: $color-primary;
    font-size: $font-size-sm;
    font-weight: 500;
    transition: background-color 0.2s;

    &:hover, &--active {
      background-color: #e2e8f0;
    }
  }

  &__menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $border-radius;
    box-shadow: $shadow-md;
    padding: $space-sm;
    min-width: 160px;
    z-index: 50;
  }
}
</style>
