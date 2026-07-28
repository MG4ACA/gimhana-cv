# FRT Store — Vue 3 + TypeScript Coding Practice
## E-Commerce Assignment Exercises

> **Format**: Each exercise has what we are building, the task, your attempt space, and the solution.
> Try writing the code yourself first. Only look at the solution after you have attempted it.

---

## Exercise 0 — How a Senior Front-End Dev Starts

### What we are building
This is not a coding exercise. This is the mindset section.
Before a senior dev writes a single line of code on a new assignment or feature, they do this:

---

### How a Senior Dev Approaches a New Assignment

**Step 1 — Read the brief fully before touching anything**
Read the entire brief. Highlight unknowns, ambiguities, and edge cases.
Write down questions before starting. Never assume.

In this assignment, the edge cases to spot early were:
- Products have no image field in the API — need a placeholder strategy
- selectible_option can be null — option selection is conditional, not always required
- /checkout fails 20% of the time by design — must handle errors, not just success
- "each option is a different cart entry" — the cart key logic needs planning upfront

**Step 2 — Understand the data before designing the UI**
Before designing components, look at what the API actually returns.
Read the backend types directory. Look at actual JSON samples.
Map out what fields exist, what can be null, what is optional.

**Step 3 — Make tech decisions explicitly**
Do not just start coding. Write down what framework, what state manager, what folder structure.
Justify each decision. A senior dev can explain why they chose Pinia over Vuex, or SCSS over plain CSS.

**Step 4 — Plan the folder and component structure first**
Draw the component tree before writing components.
Know what data each component needs. Know what it emits.
Separate concerns: Views are containers. Components are presentational. Stores hold state. Composables hold logic. Services hold API calls.

**Step 5 — Set up Git before writing any feature code**
Initialise the repo, push to remote, create develop branch, then branch off per feature.
Never commit half-finished features to main or develop.
Commit often with small, logical commits that tell a story.

**Step 6 — Build from data upward, not from UI downward**
Build in this order:
1. Types first (data contracts)
2. Service layer (API calls)
3. Store (state management)
4. Composables (business logic)
5. Views and components (presentation last)

This way, when you write a component, all its dependencies already exist and are tested.

**Step 7 — Test as you build, not at the end**
After each step, verify it works before moving on.
Open DevTools Network tab to confirm API calls succeed.
Console.log store state to verify data flows correctly.
Do not build 5 components and then debug everything together.

---

## Exercise 1 — Project Setup

> 🔀 **Git: Start here**
> ```bash
> git checkout develop
> git checkout -b feature/project-setup
> ```

### What we are building
The foundation of the project: the folder structure, types, API service, routing, Pinia, and SCSS setup.
This is the scaffolding that everything else will plug into.
A good setup means every future component has a clear home and every dependency is pre-wired.

### Task
1. Initialise a Vite + Vue 3 + TypeScript project
2. Install vue-router, pinia, sass
3. Create the full folder structure (empty files with correct names)
4. Copy types from the BE repository into src/types/index.ts — adding CartItem and CheckoutPayload types
5. Write src/services/api.ts with all endpoint functions
6. Configure the @/ path alias in vite.config.ts and tsconfig.app.json
7. Create SCSS partials: _variables.scss, _mixins.scss, _reset.scss, main.scss
8. Set up Vue Router with PLP, PDP, and Checkout routes
9. Set up Pinia in main.ts
10. Import main.scss in main.ts
11. Clean App.vue to only render RouterView

### Your Attempt
```bash
# Commands to run:
```

```ts
// src/types/index.ts
```

```ts
// src/services/api.ts
```

---

### Solution

```bash
npm create vite@latest frt-store -- --template vue-ts
cd frt-store
npm install
npm install vue-router@4 pinia sass
npm run dev
```

Git setup:
```bash
git remote add origin <your-repo-url>
git add .
git commit -m "chore: initial vite vue3 typescript project setup"
git push -u origin main
git checkout -b develop
git push -u origin develop
git checkout -b feature/project-setup
```

```ts
// src/types/index.ts
export interface Brand {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
}

export interface Option {
  option_type: string
  option_name: string
}

export interface SelectibleOption extends Option {
  option: string[]
}

export interface Product {
  id: string
  product_name: string
  category: string
  price: number
  brand: string
  stock_quantity: number
  release_date: string
  description: string
  selectible_option: SelectibleOption | null
}

export interface CartItem {
  cartKey: string         // productId + ":" + optionValue
  productId: string
  product_name: string
  brand: string
  price: number
  selectedOption: string | null
  qty: number
}

export interface CheckoutPayload {
  name: string
  surname: string
  phone: string
  email: string
  zip_code: string
  items: {
    productId: string
    product_name: string
    qty: number
    selectedOption: string | null
    price: number
  }[]
}

export type BrandResponse = Brand[]
export type CategoriesResponse = Category[]
export type ProductsResponse = Product[]
```

```ts
// src/services/api.ts
import type { BrandResponse, CategoriesResponse, Product, ProductsResponse } from "@/types"

const BASE_URL = "http://localhost:3010"

export const api = {
  getProducts: (): Promise<ProductsResponse> =>
    fetch(`${BASE_URL}/products`).then(r => r.json()),

  getProduct: (id: string): Promise<Product> =>
    fetch(`${BASE_URL}/products/${id}`).then(r => r.json()),

  getBrands: (): Promise<BrandResponse> =>
    fetch(`${BASE_URL}/brands`).then(r => r.json()),

  getCategories: (): Promise<CategoriesResponse> =>
    fetch(`${BASE_URL}/categories`).then(r => r.json()),

  checkout: (payload: unknown): Promise<Response> =>
    fetch(`${BASE_URL}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
}
```

```ts
// vite.config.ts
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath } from "url"

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
```

```json
// tsconfig.app.json — add inside compilerOptions
"baseUrl": ".",
"ignoreDeprecations": "6.0",
"paths": {
  "@/*": ["src/*"]
}
```

```scss
// src/assets/styles/_variables.scss
$color-primary: #1a1a1a;
$color-accent: #22c55e;
$color-bg: #ffffff;
$color-border: #e5e7eb;
$color-muted: #6b7280;
$color-error: #ef4444;

$font-family: "Inter", sans-serif;
$font-size-sm: 12px;
$font-size-md: 14px;
$font-size-lg: 16px;

$space-xs: 4px;
$space-sm: 8px;
$space-md: 16px;
$space-lg: 24px;
$space-xl: 32px;

$max-width: 1200px;
$border-radius: 8px;
$card-gap: 16px;
```

```scss
// src/assets/styles/_reset.scss
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

a { text-decoration: none; color: inherit; }
button { cursor: pointer; border: none; background: none; font-family: inherit; }
ul { list-style: none; }
img { max-width: 100%; display: block; }
```

```scss
// src/assets/styles/_mixins.scss
@use "variables" as *;

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin container {
  max-width: $max-width;
  margin: 0 auto;
  padding: 0 $space-lg;
}
```

```scss
// src/assets/styles/main.scss
@use "reset";
@use "variables" as *;

body {
  font-family: $font-family;
  background: $color-bg;
  color: $color-primary;
  font-size: $font-size-md;
}
```

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router"
import PLPView from "@/views/PLPView.vue"
import PDPView from "@/views/PDPView.vue"
import CheckoutView from "@/views/CheckoutView.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: PLPView },
    { path: "/product/:id", component: PDPView },
    { path: "/checkout", component: CheckoutView },
  ]
})

export default router
```

```ts
// src/main.ts
import { createApp } from "vue"
import { createPinia } from "pinia"
import router from "./router"
import App from "./App.vue"
import "./assets/styles/main.scss"

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount("#app")
```

```vue
<!-- src/App.vue -->
<script setup lang="ts">
</script>

<template>
  <RouterView />
</template>
```

Commit when done:
```bash
git add .
git commit -m "chore: project setup with router, pinia, scss, types, api"
git push -u origin feature/project-setup
git checkout develop
git merge feature/project-setup
git push origin develop
```

> 💾 **Git: Commits for this exercise**
> ```bash
> git add .
> git commit -m "chore: add folder structure and empty component files"
> git add src/types/
> git commit -m "chore: add typescript types from BE repo"
> git add src/services/
> git commit -m "chore: add api service layer"
> git add src/assets/
> git commit -m "chore: add scss partials and variables"
> git add src/router/ src/main.ts src/App.vue vite.config.ts tsconfig.app.json
> git commit -m "chore: configure vue router, pinia and path alias"
> git push -u origin feature/project-setup
> # Merge when all files verified and npm run dev is clean
> git checkout develop
> git merge feature/project-setup
> git push origin develop
> ```

---

## Exercise 2 — Products Store

> 🔀 **Git: Start here**
> ```bash
> git checkout develop
> git checkout -b feature/plp-product-grid
> ```
> Exercises 2 and 3 share this branch — both are about building the product listing.

### What we are building
The products store is the single source of truth for all product data.
It fetches products, brands, and categories in parallel and stores them.
Every component that needs product data reads from this store — never fetches directly.

### Task
Write src/stores/products.ts using Pinia.

It should:
1. Use the Composition API style of defineStore (not Options style)
2. Have state: products, brands, categories (typed arrays), isLoading (boolean), error (string or null)
3. Have a fetchAll action that fetches all three endpoints in parallel using Promise.all
4. Handle errors with try/catch and always reset isLoading in finally
5. Export the store as useProductsStore

### Your Attempt
```ts
// src/stores/products.ts
```

---

### Solution

```ts
// src/stores/products.ts
import { defineStore } from "pinia"
import { ref } from "vue"
import { api } from "@/services/api"
import type { Product, Brand, Category } from "@/types"

export const useProductsStore = defineStore("products", () => {
  const products = ref<Product[]>([])
  const brands = ref<Brand[]>([])
  const categories = ref<Category[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchAll = async () => {
    isLoading.value = true
    error.value = null
    try {
      const [p, b, c] = await Promise.all([
        api.getProducts(),
        api.getBrands(),
        api.getCategories()
      ])
      products.value = p
      brands.value = b
      categories.value = c
    } catch (e: unknown) {
      error.value = "Failed to load store data. Please try again."
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  return { products, brands, categories, isLoading, error, fetchAll }
})
```

Key things to notice:
- Promise.all fetches all three at the same time — not one after another. Faster.
- finally always runs — isLoading resets whether the fetch succeeded or failed
- error is typed as string | null — null means no error currently

> 💾 **Git: Commit after products store is working**
> ```bash
> git add src/stores/products.ts
> git commit -m "feat: add products pinia store with fetchAll and loading/error state"
> ```

---

## Exercise 3 — PLPView + ProductGrid + ProductCard

> 📌 **Git: No new branch** — continue on `feature/plp-product-grid` from Exercise 2

### What we are building
The main product listing page. PLPView is the container that holds everything together.
It calls the store on mount and passes data down to the grid.
ProductGrid arranges cards in a 4-column layout.
ProductCard displays one product and handles click to navigate to PDP.

### Task

**PLPView.vue**
1. Import and call useProductsStore
2. Call fetchAll on onMounted
3. Show loading state while isLoading is true
4. Show error state if error is not null
5. Show ProductGrid with products when data is ready
6. Include AppHeader at the top

**ProductGrid.vue**
1. Accept a products prop typed as Product[]
2. Render a ProductCard for each product
3. Use CSS grid: 4 columns

**ProductCard.vue**
1. Accept a product prop typed as Product
2. Show a placeholder image (https://placehold.co/400x400)
3. Show product_name, brand, price formatted as currency
4. Click on card navigates to /product/:id using useRouter

### Your Attempt
```vue
<!-- PLPView.vue -->
```

```vue
<!-- ProductGrid.vue -->
```

```vue
<!-- ProductCard.vue -->
```

---

### Solution

```vue
<!-- src/views/PLPView.vue -->
<script setup lang="ts">
import { onMounted } from "vue"
import { useProductsStore } from "@/stores/products"
import AppHeader from "@/components/layout/AppHeader.vue"
import ProductGrid from "@/components/plp/ProductGrid.vue"

const store = useProductsStore()

onMounted(() => {
  store.fetchAll()
})
</script>

<template>
  <div class="page-wrapper">
    <AppHeader />
    <main class="container">
      <h1 class="page-title">Products</h1>
      <div v-if="store.isLoading" class="state-msg">Loading products...</div>
      <div v-else-if="store.error" class="state-msg error">{{ store.error }}</div>
      <ProductGrid v-else :products="store.products" />
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
```

```vue
<!-- src/components/plp/ProductGrid.vue -->
<script setup lang="ts">
import type { Product } from "@/types"
import ProductCard from "./ProductCard.vue"

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
```

```vue
<!-- src/components/plp/ProductCard.vue -->
<script setup lang="ts">
import { useRouter } from "vue-router"
import type { Product } from "@/types"

const props = defineProps<{ product: Product }>()
const router = useRouter()

const goToDetail = () => {
  router.push(`/product/${props.product.id}`)
}
</script>

<template>
  <div class="card" @click="goToDetail">
    <div class="card__image-wrapper">
      <img src="https://placehold.co/400x400" :alt="product.product_name" class="card__image" />
    </div>
    <div class="card__info">
      <p class="card__name">{{ product.product_name }}</p>
      <p class="card__brand">{{ product.brand }}</p>
      <p class="card__price">${{ product.price.toFixed(2) }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.card {
  cursor: pointer;
  border: 1px solid $color-border;
  border-radius: $border-radius;
  overflow: hidden;
  transition: box-shadow 0.2s ease;

  &:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }

  &__image { width: 100%; aspect-ratio: 1; object-fit: cover; }
  &__info { padding: $space-sm $space-md $space-md; }
  &__name { font-weight: 600; font-size: $font-size-md; }
  &__brand { color: $color-muted; font-size: $font-size-sm; margin-top: 2px; }
  &__price { font-weight: 700; margin-top: $space-sm; }
}
</style>
```

> 💾 **Git: Commit each component, then merge when all 3 are done and visible in browser**
> ```bash
> git add src/views/PLPView.vue
> git commit -m "feat: add PLPView with loading and error states"
> git add src/components/plp/ProductGrid.vue
> git commit -m "feat: add ProductGrid with 4-column layout"
> git add src/components/plp/ProductCard.vue src/components/layout/AppHeader.vue
> git commit -m "feat: add ProductCard with navigation and AppHeader"
> git push -u origin feature/plp-product-grid
> # Verify: products show on screen, clicking a card logs the ID
> git checkout develop
> git merge feature/plp-product-grid
> git push origin develop
> ```

---

## Exercise 4 — useFilters Composable

> 🔀 **Git: Start here**
> ```bash
> git checkout develop
> git checkout -b feature/plp-filters
> ```

### What we are building
A composable that handles all client-side filtering and sorting of products.
The products array from the store is never mutated. Filtering is a computed transformation.
Category filter, brand multi-select, and sort order all feed into one computed result.

### Task
Write src/composables/useFilters.ts

It should:
1. Accept the products array from the store as a parameter (typed as Ref or ComputedRef of Product[])
2. Have reactive state: selectedCategory (string, default "all"), selectedBrands (string[], default empty), sortBy (string, default "date_desc")
3. Return a filteredProducts computed that applies all filters and sorting in sequence
4. Sorting options: date_desc (newest first), date_asc (oldest first), price_asc (cheapest first)
5. Brand filter: if selectedBrands is empty, show all brands
6. Export all state refs so the filter components can bind to them

### Your Attempt
```ts
// src/composables/useFilters.ts
```

---

### Solution

```ts
// src/composables/useFilters.ts
import { ref, computed, type Ref } from "vue"
import type { Product } from "@/types"

export function useFilters(products: Ref<Product[]>) {
  const selectedCategory = ref("all")
  const selectedBrands = ref<string[]>([])
  const sortBy = ref("date_desc")

  const filteredProducts = computed(() => {
    let result = [...products.value]

    // Category filter
    if (selectedCategory.value !== "all") {
      result = result.filter(p => p.category === selectedCategory.value)
    }

    // Brand filter — empty array means all brands shown
    if (selectedBrands.value.length > 0) {
      result = result.filter(p => selectedBrands.value.includes(p.brand))
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy.value === "date_desc") {
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
      }
      if (sortBy.value === "date_asc") {
        return new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
      }
      if (sortBy.value === "price_asc") {
        return a.price - b.price
      }
      return 0
    })

    return result
  })

  return { selectedCategory, selectedBrands, sortBy, filteredProducts }
}
```

Key things to notice:
- [...products.value] copies the array — the original is never mutated
- computed auto-recalculates whenever selectedCategory, selectedBrands, sortBy, or products changes
- Date parsing: release_date is "M/D/YYYY" string — new Date() parses this correctly

> 💾 **Git: Commit and merge when all 3 filters are wired and working in the browser**
> ```bash
> git add src/composables/useFilters.ts
> git commit -m "feat: add useFilters composable with category, brand and sort logic"
> git add src/components/plp/CategoryTabs.vue
> git commit -m "feat: add CategoryTabs component"
> git add src/components/plp/BrandFilter.vue
> git commit -m "feat: add BrandFilter multi-select dropdown"
> git add src/components/plp/SortByFilter.vue
> git commit -m "feat: add SortByFilter dropdown"
> git add src/views/PLPView.vue
> git commit -m "feat: wire filters and sort into PLPView"
> git push -u origin feature/plp-filters
> git checkout develop
> git merge feature/plp-filters
> git push origin develop
> ```

---

## Exercise 5 — Cart Store + Cart Dropdown

> 🔀 **Git: Start here**
> ```bash
> git checkout develop
> git checkout -b feature/cart
> ```

### What we are building
The cart store manages all cart items globally. CartDropdown renders them.
The critical concept: productId + optionValue = unique cart key.
Same product with same option increments qty. Same product with different option is a separate entry.

### Task

**src/stores/cart.ts**
1. State: items typed as CartItem[]
2. Action addItem: accept a product and selectedOption — build cartKey — if cartKey exists increment qty, otherwise push new item
3. Action removeItem: remove by cartKey
4. Action updateQty: find by cartKey, update qty
5. Action clearCart: empty the array
6. Getter totalItems: items.length
7. Getter totalPrice: sum of price * qty for all items

**src/components/cart/CartDropdown.vue**
1. Accept an isOpen prop
2. Read items, totalPrice from cartStore
3. Render CartItem for each item
4. Show empty state when no items
5. Show total price and Continue to Checkout button

### Your Attempt
```ts
// src/stores/cart.ts
```

```vue
<!-- CartDropdown.vue -->
```

---

### Solution

```ts
// src/stores/cart.ts
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { CartItem, Product } from "@/types"

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([])

  const totalItems = computed(() => items.value.length)
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.qty, 0)
  )

  const addItem = (product: Product, selectedOption: string | null = null) => {
    const cartKey = `${product.id}:${selectedOption ?? ""}`
    const existing = items.value.find(i => i.cartKey === cartKey)

    if (existing) {
      existing.qty++
    } else {
      items.value.push({
        cartKey,
        productId: product.id,
        product_name: product.product_name,
        brand: product.brand,
        price: product.price,
        selectedOption,
        qty: 1
      })
    }
  }

  const removeItem = (cartKey: string) => {
    items.value = items.value.filter(i => i.cartKey !== cartKey)
  }

  const updateQty = (cartKey: string, qty: number) => {
    const item = items.value.find(i => i.cartKey === cartKey)
    if (item) item.qty = qty
  }

  const clearCart = () => {
    items.value = []
  }

  return { items, totalItems, totalPrice, addItem, removeItem, updateQty, clearCart }
})
```

> 💾 **Git: Commit and merge when cart add/remove works end to end**
> ```bash
> git add src/stores/cart.ts
> git commit -m "feat: add cart pinia store with add, remove and qty logic"
> git add src/components/common/AppToast.vue
> git commit -m "feat: add AppToast component for cart feedback"
> git add src/components/cart/CartItem.vue src/components/cart/CartDropdown.vue
> git commit -m "feat: add CartDropdown and CartItem components"
> git add src/components/layout/AppHeader.vue
> git commit -m "feat: wire cart badge and dropdown into AppHeader"
> git push -u origin feature/cart
> git checkout develop
> git merge feature/cart
> git push origin develop
> ```

---

## Exercise 6 — PDPView (Product Detail Page)

> 🔀 **Git: Start here**
> ```bash
> git checkout develop
> git checkout -b feature/pdp
> ```

### What we are building
The product detail page fetches one product by its ID from the route params.
If the product has options, the user must select one before adding to cart.
If the product is out of stock, add to cart is blocked.

### Task
Write src/views/PDPView.vue

It should:
1. Read the :id from route params using useRoute
2. Fetch the product using api.getProduct on onMounted
3. Show loading, error, and loaded states
4. If stock_quantity is 0, show "Out of stock" in red and disable the add button
5. If selectible_option is not null, show a select dropdown with option values
6. Track selectedOption as a ref
7. On add to cart: validate option is selected if required, block if out of stock
8. Show a success/error toast after adding
9. Navigate back to PLP possible via back link or breadcrumb

### Your Attempt
```vue
<!-- src/views/PDPView.vue -->
```

---

### Solution

```vue
<!-- src/views/PDPView.vue -->
<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { api } from "@/services/api"
import { useCartStore } from "@/stores/cart"
import type { Product } from "@/types"

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref<Product | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedOption = ref<string | null>(null)
const toastMessage = ref<string | null>(null)
const toastType = ref<"success" | "error">("success")

onMounted(async () => {
  isLoading.value = true
  try {
    product.value = await api.getProduct(route.params.id as string)
  } catch {
    error.value = "Product not found."
  } finally {
    isLoading.value = false
  }
})

const addToCart = () => {
  if (!product.value) return

  if (product.value.stock_quantity === 0) {
    showToast("This product is out of stock.", "error")
    return
  }

  if (product.value.selectible_option !== null && !selectedOption.value) {
    showToast("Please select an option before adding to cart.", "error")
    return
  }

  cartStore.addItem(product.value, selectedOption.value)
  showToast(`${product.value.product_name} added to cart!`, "success")
}

const showToast = (message: string, type: "success" | "error") => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => { toastMessage.value = null }, 3000)
}
</script>

<template>
  <div class="pdp">
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="product" class="pdp__content">
      <img src="https://placehold.co/500x500" :alt="product.product_name" class="pdp__image" />
      <div class="pdp__details">
        <h1>{{ product.product_name }}</h1>
        <p class="pdp__brand">{{ product.brand }}</p>
        <p class="pdp__price">${{ product.price.toFixed(2) }}</p>
        <p class="pdp__desc">{{ product.description }}</p>

        <!-- Option selector — only shown if product has options -->
        <div v-if="product.selectible_option" class="pdp__options">
          <label>{{ product.selectible_option.option_name }}</label>
          <select v-model="selectedOption">
            <option value="" disabled>Select option</option>
            <option
              v-for="opt in product.selectible_option.option"
              :key="opt"
              :value="opt"
            >
              {{ opt }}
            </option>
          </select>
        </div>

        <!-- Stock status -->
        <p v-if="product.stock_quantity > 0" class="pdp__stock in-stock">
          Available: {{ product.stock_quantity }}
        </p>
        <p v-else class="pdp__stock out-of-stock">Out of stock</p>

        <!-- Add to cart -->
        <button
          class="pdp__btn"
          :disabled="product.stock_quantity === 0"
          @click="addToCart"
        >
          Add to Cart
        </button>

        <!-- Toast -->
        <div v-if="toastMessage" :class="['toast', toastType]">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  </div>
</template>
```

> 💾 **Git: Commit and merge — this completes Stage I. Merge develop into main.**
> ```bash
> git add src/views/PDPView.vue
> git commit -m "feat: add PDPView with option selector, stock display and add-to-cart"
> git push -u origin feature/pdp
> git checkout develop
> git merge feature/pdp
> git push origin develop
> # Stage I is complete — merge to main
> git checkout main
> git merge develop
> git push origin main
> ```

---

## Exercise 7 — Stage II: Price Filter, Qty Management, Quick Add Modal

> 🔀 **Git: Start here**
> ```bash
> git checkout develop
> git checkout -b feature/stage2-enhancements
> ```

### What we are building
Three connected enhancements: a price range slider filter, qty +/- controls in the cart dropdown, and a quick-add flow from the PLP that shows an option modal when needed.

### Task

**PriceFilter.vue**
1. Compute min and max price from the products array
2. Use two range inputs (or a dual-thumb slider) for min and max
3. Expose priceRange as a ref so useFilters can consume it
4. Add price filter logic to useFilters computed

**CartDropdown qty controls**
1. Add + and - buttons to each CartItem
2. - button calls updateQty(cartKey, qty - 1), but if qty is 1 calls removeItem instead
3. + button calls updateQty(cartKey, qty + 1)

**Quick add from ProductCard**
1. Add a cart icon button to each ProductCard (prevent click from bubbling to card navigation)
2. If product has no options: call cartStore.addItem directly
3. If product has options: emit an event to open OptionsModal with that product

**OptionsModal.vue**
1. Accept a product prop
2. Show option dropdown
3. Confirm button: addItem with selected option, close modal
4. Cancel button: close modal without adding

### Your Attempt
```vue
<!-- PriceFilter.vue -->
```

```vue
<!-- OptionsModal.vue -->
```

---

### Solution (key logic — apply to your styled components)

```ts
// Add to useFilters.ts
const priceRange = ref<[number, number]>([0, 99999])

// Inside filteredProducts computed, add after brand filter:
result = result.filter(p => p.price >= priceRange.value[0] && p.price <= priceRange.value[1])

// Return priceRange from composable
```

```vue
<!-- CartItem qty controls -->
<button @click="decrease">-</button>
<span>{{ item.qty }}</span>
<button @click="() => cartStore.updateQty(item.cartKey, item.qty + 1)">+</button>

<script>
const decrease = () => {
  if (item.qty === 1) {
    cartStore.removeItem(item.cartKey)
  } else {
    cartStore.updateQty(item.cartKey, item.qty - 1)
  }
}
</script>
```

```vue
<!-- ProductCard quick add icon -->
<button class="card__add-btn" @click.stop="onQuickAdd">
  <!-- cart icon svg -->
</button>

<script>
const emit = defineEmits<{ quickAdd: [product: Product] }>()

const onQuickAdd = () => {
  if (!props.product.selectible_option) {
    cartStore.addItem(props.product, null)
  } else {
    emit("quickAdd", props.product)
  }
}
</script>
```

> 💾 **Git: Commit per feature, then merge develop into main when Stage II is complete**
> ```bash
> git add src/components/plp/PriceFilter.vue src/composables/useFilters.ts
> git commit -m "feat: add price range filter to PLP"
> git add src/components/cart/CartItem.vue src/components/cart/CartDropdown.vue
> git commit -m "feat: add qty management to cart dropdown"
> git add src/components/plp/ProductCard.vue src/components/plp/OptionsModal.vue
> git commit -m "feat: add quick-add to cart from PLP with options modal"
> git push -u origin feature/stage2-enhancements
> git checkout develop
> git merge feature/stage2-enhancements
> git push origin develop
> # Stage II complete — merge to main
> git checkout main
> git merge develop
> git push origin main
> ```

---

## Exercise 8 — Stage III: Checkout

> 🔀 **Git: Start here**
> ```bash
> git checkout develop
> git checkout -b feature/stage3-checkout
> ```

### What we are building
The checkout page collects user details, validates them, sends them with the cart items to /checkout, and handles the response. The API fails 20% of the time by design — error handling is required.

### Task
Write src/views/CheckoutView.vue

It should:
1. Show form fields: Name, Surname, Phone, Email, Zip Code
2. Validate all fields on submit: required, email format, phone is numeric
3. Show inline error messages per field
4. On submit: POST to /checkout using api.checkout with user data + cart items from cartStore
5. If response is ok: clear cart, show success message
6. If response fails (20% chance): show error message and a Try Again button
7. Do not navigate away on error — let the user retry

### Your Attempt
```vue
<!-- src/views/CheckoutView.vue -->
```

---

### Solution (core logic)

```ts
// Form state
const form = reactive({
  name: "",
  surname: "",
  phone: "",
  email: "",
  zip_code: ""
})

const formErrors = reactive<Record<string, string>>({})

const validate = (): boolean => {
  Object.keys(formErrors).forEach(k => delete formErrors[k])

  if (!form.name.trim()) formErrors.name = "Name is required"
  if (!form.surname.trim()) formErrors.surname = "Surname is required"
  if (!form.phone.trim()) formErrors.phone = "Phone is required"
  else if (!/^\d+$/.test(form.phone)) formErrors.phone = "Phone must be numeric"
  if (!form.email.trim()) formErrors.email = "Email is required"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) formErrors.email = "Invalid email"
  if (!form.zip_code.trim()) formErrors.zip_code = "Zip code is required"

  return Object.keys(formErrors).length === 0
}

const submit = async () => {
  if (!validate()) return

  isSubmitting.value = true
  submitError.value = null

  try {
    const payload: CheckoutPayload = {
      ...form,
      items: cartStore.items.map(item => ({
        productId: item.productId,
        product_name: item.product_name,
        qty: item.qty,
        selectedOption: item.selectedOption,
        price: item.price
      }))
    }

    const response = await api.checkout(payload)

    if (response.ok) {
      cartStore.clearCart()
      isSuccess.value = true
    } else {
      submitError.value = "Something went wrong. Please try again."
    }
  } catch {
    submitError.value = "Network error. Please check your connection and try again."
  } finally {
    isSubmitting.value = false
  }
}
```

Key things to notice:
- Validation runs first — submit does not proceed if any field is invalid
- response.ok checks the HTTP status (200-299 = ok, anything else = error)
- The API randomly returns a non-ok status 20% of the time — this catches it
- clearCart only called on success — not before
- isSubmitting prevents double submission while request is in flight

> 💾 **Git: Final commit — then merge everything up to main**
> ```bash
> git add src/views/CheckoutView.vue src/components/checkout/
> git commit -m "feat: add checkout page with validation and error handling"
> git push -u origin feature/stage3-checkout
> git checkout develop
> git merge feature/stage3-checkout
> git push origin develop
> # Stage III complete — final merge to main
> git checkout main
> git merge develop
> git push origin main
> # Add reviewer as collaborator on GitHub
> # Settings -> Collaborators -> Add: FlatRockTechCareers
> ```
