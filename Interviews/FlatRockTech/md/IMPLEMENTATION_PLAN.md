# Flat Rock Technology — FE Technical Assignment
## Implementation Plan + Engineering Standards Guide

> **Your role**: Implement every line of code.
> **My role**: Senior Vue.js tech lead — review, mentor, catch mistakes.
> **Deadline**: 3 days | **Target**: Stage I + II fully working, Stage III if time allows.

---

## Real TypeScript Types (from BE repo — use these exactly)

```ts
// src/types/index.ts — copy this exactly

// --- From BE types/brands.ts ---
export interface Brand {
  id: string
  name: string
}
export type BrandResponse = Brand[]

// --- From BE types/categories.ts ---
export interface Category {
  id: string
  name: string
}
export type CategoriesResponse = Category[]

// --- From BE types/products.ts ---
export interface Option {
  option_type: string   // UUID — e.g. "7e4fe727-..." = Size, "f1a44e9c-..." = Color
  option_name: string   // "Size" or "Color"
}

export interface SelectibleOption extends Option {
  option: string[]      // actual values: ["red", "blue"] or ["S", "M", "L"]
}

export interface Product {
  id: string
  product_name: string
  category: string
  price: number
  brand: string
  stock_quantity: number
  release_date: string                  // format: "M/D/YYYY" e.g. "6/3/2020"
  description: string
  selectible_option: SelectibleOption | null   // null = no option, must select if present
}
export type ProductsResponse = Product[]

// --- Cart (your own type — not from BE) ---
export interface CartItem {
  cartKey: string           // unique key = productId + optionValue (or just productId if no option)
  productId: string
  product_name: string
  brand: string
  price: number
  selectedOption: string | null    // the actual selected value e.g. "red" or "M"
  qty: number
}

// --- Checkout payload ---
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
```

---

## Tech Stack

| Tool | Choice | Reason |
|---|---|---|
| Framework | Vue 3 (Composition API, script setup) | Required |
| Build | Vite | Standard for Vue 3 |
| Language | TypeScript | Required, BE has typed declarations |
| Router | Vue Router 4 | PLP / PDP / Checkout |
| State | Pinia | Cart + shared data |
| Styling | SCSS | Nesting, partials, variables — structured |
| HTTP | Native fetch | Sufficient for simple REST |

---

## SDLC Best Practices Applied

### 1. Planning (Done — this document)
- Requirements analysed from the brief
- Data structures derived from actual BE types
- Component breakdown planned before coding
- API contract understood before implementation

### 2. Development Standards
- Single Responsibility: each component does ONE thing
- DRY: shared logic in composables, shared styles in SCSS partials
- Separation of Concerns:
    - API calls: api.ts only
    - State: Pinia stores
    - Business logic: composables
    - Presentation: Vue components

### 3. Testing (manual for this assignment)
- Test each feature after implementing it — do not batch test at the end
- Edge cases to verify:
    - Product with no options — direct add to cart
    - Product with options — block add if not selected
    - Out of stock product (stock_quantity = 0) — cannot add to cart
    - Empty cart — show empty state UI
    - No filter results — show empty state
    - Checkout 20% failure — show error, allow retry

### 4. Code Quality Rules
- No any in TypeScript
- No inline styles in templates — always SCSS classes
- No fetch() in components or stores — only api.ts
- No console.log left in submitted code
- Components should be under 200 lines — split if larger

---

## Git Workflow (Follow this strictly)

### Initial Setup
```bash
# Inside frt-store/ — initialise and push to GitHub
git init                          # already done by Vite
git remote add origin <your-github-repo-url>

# Create branch structure
git checkout -b develop           # integration branch
git push -u origin develop
```

### Branch Strategy
```
main      <- production-ready, only merge from develop after each stage is complete
develop   <- integration branch, merge feature branches here
  |
  |-- feature/project-setup
  |-- feature/plp-product-grid
  |-- feature/plp-filters
  |-- feature/cart-store
  |-- feature/pdp
  |-- feature/stage2-price-filter
  |-- feature/stage2-quick-add
  |-- feature/stage3-checkout
```

### Workflow for Each Feature
```bash
# 1. Start a new feature from develop
git checkout develop
git checkout -b feature/plp-product-grid

# 2. Work on the feature — commit often with small, logical commits
git add .
git commit -m "feat: add ProductGrid component with 4-column layout"
git commit -m "feat: add ProductCard with image, name, brand, price"

# 3. When feature is done, merge back to develop
git checkout develop
git merge feature/plp-product-grid
git push origin develop

# 4. After Stage I is fully working, merge develop to main
git checkout main
git merge develop
git push origin main
```

### Conventional Commit Messages (use these prefixes always)
```
feat:     new feature
fix:      bug fix
style:    CSS/SCSS changes only
refactor: code restructure, no behaviour change
chore:    config, tooling, dependencies
docs:     README or documentation
```

Examples:
```
feat: add CategoryTabs component with active state
feat: implement useFilters composable for client-side filtering
fix: prevent add-to-cart when option not selected
style: align ProductCard to match Figma design
chore: add SCSS variables and reset partials
```

### README.md (update before submission)
```md
## FRT Store — Technical Assignment

### Setup
npm install
npm run dev

### Tech Stack
Vue 3, TypeScript, Vite, Pinia, Vue Router, SCSS

### Features Implemented
- Stage I: PLP with category/brand/sort filters, PDP, cart dropdown
- Stage II: Price filter, qty management, quick-add with option modal
- Stage III: Checkout with validation and error handling
```

---

## Folder Structure

```
frt-store/
├── src/
│   ├── assets/styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _reset.scss
│   │   └── main.scss
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppHeader.vue
│   │   ├── plp/
│   │   │   ├── ProductGrid.vue
│   │   │   ├── ProductCard.vue
│   │   │   ├── CategoryTabs.vue
│   │   │   ├── FilterBar.vue
│   │   │   ├── BrandFilter.vue
│   │   │   ├── PriceFilter.vue       (Stage II)
│   │   │   ├── SortByFilter.vue
│   │   │   └── OptionsModal.vue      (Stage II)
│   │   ├── cart/
│   │   │   ├── CartDropdown.vue
│   │   │   └── CartItem.vue
│   │   ├── checkout/
│   │   │   └── CheckoutForm.vue      (Stage III)
│   │   └── common/
│   │       └── AppToast.vue
│   ├── views/
│   │   ├── PLPView.vue
│   │   ├── PDPView.vue
│   │   └── CheckoutView.vue          (Stage III)
│   ├── stores/
│   │   ├── cart.ts
│   │   └── products.ts
│   ├── composables/
│   │   └── useFilters.ts
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── router/
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
```

---

## Important Data Observations (from reading actual BE data)

1. selectible_option is null for many products — no option needed
2. When selectible_option is not null, option is an array of strings e.g. ["red", "blue"] or ["S", "M", "L"]
3. option_type is a UUID that maps to a type in /options endpoint
4. stock_quantity: 0 = out of stock, must block add-to-cart
5. release_date format is "M/D/YYYY" — parse carefully for sorting
6. Categories from BE are "Shoes" and "Shirts" (capitalised) — match exactly
7. No image field in BE data — you need a placeholder image strategy

NOTE on images: The BE has no image URLs. Use a placeholder service or a single
local image for all products. Recommended: https://placehold.co/400x400

---

## Cart Key Logic

```
cartKey = productId + ":" + selectedOption
e.g. "abc123:red"   <- product abc123 with option "red"
e.g. "abc123:"      <- product abc123 with no option

Same cartKey = increment qty
Different cartKey = new cart entry
```

---

## 3-Day Build Plan

### DAY 1

**Feature branch: feature/project-setup**
- Set up SCSS partials (_variables, _mixins, _reset, main)
- Copy types into src/types/index.ts
- Write src/services/api.ts (all endpoints)
- Set up Vue Router (PLP, PDP, Checkout routes)
- Set up Pinia in main.ts
- Commit: "chore: project setup with router, pinia, scss, types"

**Feature branch: feature/plp-product-grid**
- productsStore: state + fetchAll() using Promise.all
- PLPView.vue: call fetchAll on mounted, pass products down
- AppHeader.vue: logo text + cart icon
- ProductGrid.vue: CSS grid 4 columns
- ProductCard.vue: image placeholder, product_name, brand, price
- Commit per component

**Feature branch: feature/plp-filters**
- useFilters.ts composable (category, brand, sort, computed filteredProducts)
- CategoryTabs.vue
- BrandFilter.vue (multi-select checkboxes)
- SortByFilter.vue (Release Date Desc/Asc, Price Asc)
- Wire filters into PLPView

**Feature branch: feature/cart-store**
- cartStore (addItem, removeItem, getters)
- AppToast.vue
- CartDropdown.vue (no qty yet)
- CartItem.vue
- Add to cart from ProductCard (products without options only for now)

---

### DAY 2

**Feature branch: feature/pdp**
- PDPView.vue: fetch product by route :id
- Image, product_name, brand, price, description layout
- Stock display: green if stock_quantity > 0, red "Out of stock"
- Option selector: if selectible_option not null, show dropdown of option values
- Add to cart: validate option selected, block if out of stock
- ProductCard click -> router.push to PDP

**Feature branch: feature/stage2-price-filter**
- PriceFilter.vue: range slider (min/max derived from products)
- Wire price range into useFilters computed

**Feature branch: feature/stage2-quick-add**
- CartDropdown: add qty +/- buttons
- ProductCard: quick-add cart icon
  - No options: addItem directly
  - Has options: open OptionsModal
- OptionsModal.vue: show option values, confirm -> addItem

---

### DAY 3

**Feature branch: feature/stage3-checkout**
- CheckoutView.vue: Name, Surname, Phone, Email, Zip fields
- Validation: all required, email format, phone format
- POST to /checkout with payload
- Handle 20% failure: show error toast + retry button
- Handle success: clear cart, show confirmation message

**Final polish (on develop branch)**
- Match all colours and spacing to design screenshots
- Test all edge cases
- Remove all console.log
- Update README.md
- Merge develop to main
- Add FlatRockTechCareers as GitHub collaborator

---

## Your Next Steps Right Now

1. Create private GitHub repo (name: frt-store or flat-rock-store)
2. Push initial Vite project to main
3. Create develop branch, push it
4. Create feature/project-setup branch
5. Set up SCSS partials + types + api.ts + router + pinia
6. Commit and paste your src/ tree here for review
