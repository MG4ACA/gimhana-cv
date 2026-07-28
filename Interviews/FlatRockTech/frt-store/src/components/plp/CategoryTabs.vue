<script setup lang="ts">
import type { Category } from "@/types";

defineProps<{
  categories: Category[] | null
  modelValue: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()
</script>

<template>
  <div class="tabs">
    <button
      class="tabs__btn"
      :class="{ 'tabs__btn--active': modelValue === 'all' }"
      @click="emit('update:modelValue', 'all')"
    >
      All Products
    </button>

    <div v-if="categories">
      <button
      v-for="cat in categories"
      :key="cat.id"
      class="tabs__btn"
      :class="{ 'tabs__btn--active': modelValue === cat.name }"
      @click="emit('update:modelValue', cat.name)"
    >
      {{ cat.name }}
    </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.tabs {
  display: flex;
  gap: $space-sm;
  overflow-x: auto;
  padding-bottom: $space-sm;

  &__btn {
    padding: $space-xs $space-md;
    border: 1px solid transparent;
    border-radius: 20px;
    font-size: $font-size-sm;
    font-weight: 500;
    color: $color-muted;
    background-color: transparent;
    white-space: nowrap;
    transition: all 0.2s;

    &:hover {
      background-color: $color-bg-light;
    }

    &--active {
      background-color: $color-bg-alt;
      color: $color-primary;
    }
  }
}
</style>
