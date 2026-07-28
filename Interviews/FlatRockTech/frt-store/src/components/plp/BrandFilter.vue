<script setup lang="ts">
import type { Brand } from "@/types";
import DropdownPopover from "@/components/common/DropdownPopover.vue";

defineProps<{
  brands: Brand[] | null
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void
}>()

const toggleBrand = (brandName: string, currentSelected: string[]) => {
  if (currentSelected.includes(brandName)) {
    emit("update:modelValue", currentSelected.filter(b => b !== brandName))
  } else {
    emit("update:modelValue", [...currentSelected, brandName])
  }
}
</script>

<template>
  <DropdownPopover label="Brand" v-if="brands">
    <div class="brand-filter__list">
      <label v-for="b in brands" :key="b.id" class="brand-filter__item">
        <input
          type="checkbox"
          :checked="modelValue.includes(b.name)"
          @change="toggleBrand(b.name, modelValue)"
        />
        <span>{{ b.name }}</span>
      </label>
    </div>
  </DropdownPopover>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.brand-filter__list {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}
.brand-filter__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: $font-size-sm;
  cursor: pointer;
}
</style>
