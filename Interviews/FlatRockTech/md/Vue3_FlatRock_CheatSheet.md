# Vue 3 Interview Prep — Flat Rock Technology
## Cheat Sheet: Composition API, React vs Vue, Pinia, Router, TypeScript

---

## 1. Composition API vs Options API

### Options API (Vue 2 style — still valid in Vue 3)
```
export default {
  data() { return { count: 0 } },
  computed: { doubled() { return this.count * 2 } },
  methods: { increment() { this.count++ } },
  mounted() { ... }
}
```

### Composition API (Vue 3 style — use this)
```
<script setup lang="ts">
import { ref, computed, onMounted } from "vue"

const count = ref(0)
const doubled = computed(() => count.value * 2)
const increment = () => count.value++

onMounted(() => { ... })
</script>
```

### Why Composition API is better

| Problem with Options API | How Composition API solves it |
|---|---|
| Related logic is split across data/methods/computed | You group related code together |
| Hard to reuse logic between components | Extract to a composable (useProducts, useCart) |
| "this" keyword causes confusion | No "this" — everything is a plain variable |
| Gets messy in large components | Easy to split into small composable functions |

### When to use which?
- Composition API: Always, for new Vue 3 code
- Options API: Only if maintaining an old codebase

---

## 2. Vue 3 Composition API — Core Primitives

### ref — reactive single value
```ts
const count = ref(0)          // number
const name = ref<string>("")  // string with explicit type
const user = ref<User | null>(null)

// Access/change always via .value in <script>
count.value++
// In <template> — Vue auto-unwraps, no .value needed
// {{ count }}
```

### reactive — reactive object
```ts
const state = reactive({
  count: 0,
  name: "Gimhana"
})
state.count++  // no .value needed, direct access
```

> Rule: Use ref for single values. Use reactive for related groups of values (form fields, filters).

### computed — derived value, auto-updates
```ts
const products = ref<Product[]>([])
const selectedCategory = ref("all")

const filtered = computed(() => {
  if (selectedCategory.value === "all") return products.value
  return products.value.filter(p => p.category === selectedCategory.value)
})
```

> computed is read-only — never assign to it directly. It auto-recalculates when its dependencies change.

### watch — react to changes
```ts
// Watch a single ref
watch(count, (newVal, oldVal) => {
  console.log(`Count changed: ${oldVal} -> ${newVal}`)
})

// Watch multiple sources
watch([firstName, lastName], ([newFirst, newLast]) => {
  console.log(`Name: ${newFirst} ${newLast}`)
})

// Immediate execution (runs on mount too)
watch(userId, (id) => fetchUser(id), { immediate: true })
```

### watchEffect — auto-tracks dependencies
```ts
// No need to specify what to watch — runs when any reactive value inside changes
watchEffect(() => {
  console.log(`count is ${count.value}`)
})
```

### Lifecycle Hooks
```ts
import { onMounted, onUnmounted, onUpdated } from "vue"

onMounted(() => {
  // DOM is ready — fetch initial data here
  fetchProducts()
})

onUnmounted(() => {
  // Cleanup — clear intervals, event listeners
  clearInterval(timer)
})

onUpdated(() => {
  // Component re-rendered
})
```

---

## 3. Custom Composables — Reusable Logic

A composable is a function that starts with "use" and contains reactive logic.

### Without composable — logic scattered in every component:
```ts
// ProductList.vue
const products = ref([])
const isLoading = ref(false)
const error = ref(null)
onMounted(async () => {
  isLoading.value = true
  products.value = await fetch("/products").then(r => r.json())
  isLoading.value = false
})

// FeaturedProducts.vue — SAME code duplicated!
```

### With composable — write once, use anywhere:
```ts
// useProducts.ts
export function useProducts() {
  const products = ref<Product[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchProducts = async () => {
    isLoading.value = true
    try {
      products.value = await api.getProducts()
    } catch {
      error.value = "Failed to load"
    } finally {
      isLoading.value = false
    }
  }

  return { products, isLoading, error, fetchProducts }
}

// ProductList.vue — use it
const { products, isLoading, fetchProducts } = useProducts()
onMounted(fetchProducts)

// FeaturedProducts.vue — same composable, no duplication
const { products, isLoading, fetchProducts } = useProducts()
```

---

## 4. Vue Router in Composition API

### Setup
```ts
// router/index.ts
import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: PLPView },
    { path: "/product/:id", component: PDPView },
    { path: "/checkout", component: CheckoutView }
  ]
})
```

### Inside components
```ts
import { useRouter, useRoute } from "vue-router"

const router = useRouter()  // for navigation
const route = useRoute()    // for reading current route

// Navigate programmatically
router.push("/product/123")
router.push({ path: `/product/${id}` })

// Read route params
const id = route.params.id as string

// Read query params (?page=2)
const page = route.query.page
```

### Navigation Guards
```ts
// Per-route guard (inside router/index.ts)
{
  path: "/checkout",
  component: CheckoutView,
  beforeEnter: (to, from) => {
    if (cartIsEmpty) return "/"  // redirect if cart is empty
  }
}
```

---

## 5. Pinia — State Management

### Why Pinia over Vuex?
- Much simpler API — no mutations, no complex setup
- TypeScript support out of the box
- Composable-style — feels like Vue 3 native

### Define a store
```ts
// stores/cart.ts
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { CartItem } from "@/types"

export const useCartStore = defineStore("cart", () => {
  // State
  const items = ref<CartItem[]>([])

  // Getters (computed)
  const totalItems = computed(() => items.value.length)
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.qty, 0)
  )

  // Actions
  const addItem = (item: CartItem) => {
    const existing = items.value.find(i => i.cartKey === item.cartKey)
    if (existing) {
      existing.qty++
    } else {
      items.value.push(item)
    }
  }

  const removeItem = (cartKey: string) => {
    items.value = items.value.filter(i => i.cartKey !== cartKey)
  }

  return { items, totalItems, totalPrice, addItem, removeItem }
})
```

### Use a store in a component
```ts
import { useCartStore } from "@/stores/cart"

const cartStore = useCartStore()

// Access state
console.log(cartStore.totalItems)

// Call actions
cartStore.addItem(newItem)
```

---

## 6. TypeScript with Vue

### Typing props
```ts
// Define props with TypeScript interfaces
interface Props {
  product: Product
  isLoading?: boolean   // optional
}

const props = defineProps<Props>()

// With defaults
const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})
```

### Typing emits
```ts
const emit = defineEmits<{
  addToCart: [productId: string, option: string | null]
  close: []
}>()

// Call:
emit("addToCart", product.id, selectedOption.value)
```

### Typing ref
```ts
// TypeScript can infer simple types:
const count = ref(0)              // TypeScript knows: Ref<number>
const name = ref("")              // TypeScript knows: Ref<string>

// Add explicit type when TypeScript can't infer:
const product = ref<Product | null>(null)    // could be Product or null
const products = ref<Product[]>([])          // array of Products
```

---

## 7. Vue vs React — Key Differences

| Feature | Vue 3 | React |
|---|---|---|
| Reactivity | Built-in (ref, reactive) | Manual hooks (useState, useEffect) |
| Templates | HTML-like templates with directives | JSX (JavaScript + HTML mixed) |
| Two-way binding | v-model built in | Controlled components (manual) |
| State management | Pinia (official) | Redux / Zustand / Context |
| Component style | Single File Components (.vue) | .jsx/.tsx files |
| Learning curve | Gentler — HTML + JS + CSS separated | Steeper — JSX requires JS mindset |
| Performance | Compiles to optimised render functions | Virtual DOM diffing |

### Vue-specific concepts React doesn't have:
- `v-if`, `v-for`, `v-model` directives
- `<template>` blocks (logical grouping without extra DOM nodes)
- `scoped` styles inside components
- `defineProps` / `defineEmits` macros
- Slot system for component composition

### React concepts that map to Vue:
| React | Vue equivalent |
|---|---|
| useState | ref / reactive |
| useEffect | watch / watchEffect / onMounted |
| useMemo | computed |
| Custom hook | Composable |
| Context | Pinia store |
| props drilling | props + defineProps |
| children prop | slots |

### In interviews — say this about Vue vs React:
> "Vue has a gentler learning curve because it keeps HTML, JavaScript and CSS separated
> in Single File Components. React uses JSX which mixes everything together.
> Vue's reactivity system is automatic — you declare reactive data and Vue tracks dependencies.
> React requires you to manually declare dependencies in useEffect dependency arrays."

---

## 8. REST API Integration Patterns (from JD)

```ts
// Services layer — always centralise API calls
// src/services/api.ts
const BASE_URL = "http://localhost:3010"

export const api = {
  getProducts: (): Promise<Product[]> =>
    fetch(`${BASE_URL}/products`).then(r => {
      if (!r.ok) throw new Error(`HTTP error: ${r.status}`)
      return r.json()
    }),
}

// In a composable — handle loading and error state
const isLoading = ref(false)
const error = ref<string | null>(null)

const fetchData = async () => {
  isLoading.value = true
  error.value = null
  try {
    data.value = await api.getProducts()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Unknown error"
  } finally {
    isLoading.value = false
  }
}
```

> Key interview point: "I always separate API calls into a services layer so components
> never call fetch() directly. This makes testing easier and keeps components focused on presentation."

---

## 9. Performance — Things to Mention in Interviews

- `computed` is cached — only recalculates when dependencies change (vs a method which runs on every render)
- `v-once` — renders element once and never re-renders (for static content)
- `v-memo` — memoize a subtree
- Lazy load routes with `defineAsyncComponent`
- `Promise.all` for parallel API calls instead of sequential `await`

---

## 10. Quick Interview Answers

**"What is the Composition API?"**
> "It is a way to write Vue components using functions instead of an options object.
> You define ref, computed and lifecycle hooks directly in a setup function.
> The key advantage is that related logic stays together and can be extracted into reusable composables."

**"What is a composable?"**
> "A composable is a function that starts with 'use' and encapsulates reactive logic that can be shared across components.
> For example, useCart manages cart state, useFilters manages product filtering.
> It is Vue's equivalent of React custom hooks."

**"Why Pinia over Vuex?"**
> "Pinia is the officially recommended state manager for Vue 3. It has a simpler API —
> no mutations, no complex boilerplate. You define state, getters and actions in one place
> and it has built-in TypeScript support."

**"How do you handle async data fetching?"**
> "I use a loading and error state with try/catch and finally. I always centralise
> fetch calls in a services layer so components don't call fetch directly.
> For parallel fetches I use Promise.all."
