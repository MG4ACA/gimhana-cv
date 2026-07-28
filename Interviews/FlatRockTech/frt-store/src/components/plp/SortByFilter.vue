<script setup lang="ts">
import DropdownPopover from "@/components/common/DropdownPopover.vue";

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

const options = [
  { value: "date_desc", label: "Release Date: Desc" },
  { value: "date_asc", label: "Release Date: Asc" },
  { value: "price_desc", label: "Price: Desc" },
  { value: "price_asc", label: "Price: Asc" }
]

const selectOption = (val: string) => {
  emit("update:modelValue", val)
}
</script>

<template>
  <DropdownPopover label="Sort By:">
    <div class="sort-list">
      <button 
        v-for="opt in options" 
        :key="opt.value"
        class="sort-list__btn"
        :class="{ 'sort-list__btn--active': modelValue === opt.value }"
        @click="selectOption(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </DropdownPopover>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.sort-list {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__btn {
    text-align: left;
    padding: $space-xs $space-sm;
    font-size: $font-size-sm;
    border-radius: 4px;
    width: 100%;
    color: $color-primary;
    
    &:hover {
      background-color: $color-bg-alt;
    }

    &--active {
      color: $color-error;
      font-weight: 600;
    }
  }
}
</style>
