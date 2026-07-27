# TypeScript for Vue 3 & Nuxt — Interview Cheat Sheet

> **Apadmi Interview Prep · Day 2**
> JD says: *"A firm understanding of TypeScript"*
> This file covers only the TypeScript patterns you will actually use in Vue 3 + Nuxt 3 + Pinia + Zod.
> Plain English first, syntax second.

---

## The One Thing to Understand About TypeScript

TypeScript is just JavaScript with **labels**.

You're writing the same JavaScript logic, but you add labels that tell the editor (and your team):
*"This variable will always be a number"*, or *"This function always returns a string or null"*.

The labels are checked at **build time** (when you save/compile). At runtime in the browser, TypeScript is completely gone — it's been stripped out and only plain JavaScript runs.

### Why? Because browsers don't understand TypeScript.

Browsers only speak **JavaScript**. They have no idea what `string`, `number`, or `: string[]` means.

So when you write TypeScript, there's a build step (done by Vite/webpack/tsc) that **compiles** your `.ts` files into plain `.js` files — removing all the type labels before sending the code to the browser.

> 🏗️ **Analogy:**
> Think of TypeScript like **scaffolding** on a building under construction.
> It helps workers (developers) build safely and correctly.
> But once the building is finished, the scaffolding is removed — the building stands on its own.
> The browser only ever sees the finished building (JavaScript). The scaffolding (TypeScript) is gone.

**What your TypeScript looks like:**
```ts
function greet(name: string): string {
  return `Hello, ${name}`
}
```

**What the browser actually runs after compilation:**
```js
function greet(name) {
  return `Hello, ${name}`
}
```

The `: string` labels are just erased. This is why TypeScript can't catch errors at runtime — it literally doesn't exist anymore by then.

This is why Zod exists alongside TypeScript. TypeScript checks your labels at **build time**. Zod checks real data at **runtime** (from an API, a CMS, a user form). They solve different problems.

### Can't we just use try/catch instead of Zod?

**Short answer**: `try/catch` handles *crashes*. Zod handles *wrong data shapes*. They are different problems.

`try/catch` only fires when something **throws an error** — like network failure, server down, invalid JSON.
But it **cannot detect** when the data comes back fine technically, but with the wrong shape.

```ts
// Imagine the API is supposed to return: { title: string, price: number }
// But today it returns:                  { titel: string, preis: number }  ← typos in field names

// ❌ try/catch won't help you here — the fetch SUCCEEDED, JSON parsed fine, no error was thrown
try {
  const res = await fetch('/api/product/1')
  const data = await res.json()
  // data = { titel: 'T-shirt', preis: 29.99 }  ← wrong field names, but no error thrown
  console.log(data.title)   // undefined — but no crash, no warning
  console.log(data.price)   // undefined — your UI silently breaks
} catch (e) {
  // This block NEVER runs because technically nothing went wrong
}
```

```ts
// ✅ Zod catches the wrong shape immediately
import { z } from 'zod'

const ProductSchema = z.object({
  title: z.string(),
  price: z.number(),
})

const res = await fetch('/api/product/1')
const raw = await res.json()

const result = ProductSchema.safeParse(raw)  // validates the shape at runtime

if (!result.success) {
  console.error('API returned unexpected shape:', result.error)
  // ← You know immediately something is wrong, before it silently breaks the UI
} else {
  console.log(result.data.title)  // ✅ TypeScript knows this is a string
}
```

**Summary of what each tool catches:**

| Problem | `try/catch` | Zod |
|---|---|---|
| Network failure (no internet) | ✅ catches | ✅ catches (via try/catch around it) |
| Server error (500, 404) | ✅ catches if you check `res.ok` | ✅ |
| Invalid JSON response | ✅ catches | ✅ |
| **Wrong field names** (typo in API) | ❌ **misses it** | ✅ catches |
| **Missing required fields** | ❌ **misses it** | ✅ catches |
| **Wrong data type** (string instead of number) | ❌ **misses it** | ✅ catches |

> **Rule**: Use `try/catch` for *network and HTTP errors*. Use Zod for *validating the shape of the data that came back*.
> In production Vue apps you use **both** — `try/catch` wraps the fetch, Zod validates what's inside.


## 0. TypeScript Fundamentals — The Absolute Basics

### Primitive Data Types

These are the basic building blocks — the same as JavaScript, just with explicit labels:

| TypeScript type | What it holds | Example value |
|---|---|---|
| `string` | Text | `"hello"`, `"Summer Sale"` |
| `number` | Any number (int or decimal) | `42`, `3.14` |
| `boolean` | True or false | `true`, `false` |
| `null` | Intentionally empty | `null` |
| `undefined` | Not yet assigned | `undefined` |
| `unknown` | Could be anything — handle with care | any value |
| `void` | Nothing — used for functions that return nothing | (no value) |

---

### Declaring Variables

In TypeScript you add `: type` after the variable name:

```ts
// JavaScript (no type)
let name = "Gimhana"

// TypeScript (with type label)
let name: string = "Gimhana"
let age: number = 28
let isLoggedIn: boolean = true
```

> **Tip — TypeScript can usually guess the type for you (called "inference")**
>
> When you write `let name = "Gimhana"`, TypeScript looks at the value `"Gimhana"` and thinks:
> *"That's clearly a string — I'll label it as string automatically."*
> You don't need to write `: string` yourself.
>
> ```ts
> let name = "Gimhana"    // TypeScript infers: string ✅ (no label needed)
> let age = 28            // TypeScript infers: number ✅
> let active = true       // TypeScript infers: boolean ✅
> ```
>
> **But sometimes TypeScript genuinely can't guess:**
>
> ```ts
> // ❌ TypeScript sees an empty string '' and thinks "this is always a string"
> // But you actually plan to put Product objects in here later — TypeScript doesn't know that!
> const selected = ref('')
>
> // ✅ You have to tell it explicitly with ref<string | null>(null)
> // or ref<Product | null>(null) — TypeScript now knows the real intention
> const selected = ref<string | null>(null)
> const product  = ref<Product | null>(null)
> ```
>
> **Breaking down `ref<Product | null>(null)` part by part:**
>
> ```
> ref  <Product | null>  (null)
>  │         │              │
>  │         │              └── JavaScript: the ACTUAL starting value passed to ref()
>  │         │                  This is what product.value will be right now = null
>  │         │
>  │         └── TypeScript: the TYPE LABEL saying "this ref can hold a Product OR null"
>  │             This is erased at build time — it's just a hint for the editor
>  │
>  └── Vue's ref() function — makes the value reactive
> ```
>
> So there are **two separate nulls doing two completely different jobs**:
> - `<Product | null>` → **TypeScript type** — tells the editor what values are allowed
> - `(null)` → **JavaScript argument** — the actual starting value right now
>
> You could even mix them:
> ```ts
> const product = ref<Product | null>(null)   // starts as null, can become a Product later
> const name    = ref<string>('Guest')        // starts as 'Guest', but TypeScript confirms it's always a string
> ```

>
> **Another example — empty arrays:**
> ```ts
> // ❌ TypeScript sees [] and has no idea what goes inside
> const items = ref([])
>
> // ✅ You must tell it
> const items = ref<Product[]>([])
> ```
>
> **Rule of thumb**: If you start with `null`, `[]`, or `{}` as an initial value — TypeScript needs your help. Everything else it usually figures out on its own.


---

### Arrays

```ts
// Array of strings
let fruits: string[] = ['apple', 'banana', 'mango']

// Array of numbers
let scores: number[] = [10, 20, 30]

// Array of objects (we'll cover object types below)
let users: User[] = []
```

---

### Objects

```ts
// Inline object type
let product: { name: string; price: number } = {
  name: 'T-shirt',
  price: 29.99
}

// Better — define a type alias and reuse it
type Product = {
  name:  string
  price: number
}

let product: Product = {
  name:  'T-shirt',
  price: 29.99
}
```

---

### Optional Properties

Add `?` to mark a property as optional (it may or may not exist):

```ts
type Product = {
  name:        string
  price:       number
  description: string    // required — must always be there
  salePrice?:  number    // optional — might not exist
}

// Both are valid:
const p1: Product = { name: 'Hat', price: 20, description: 'A hat' }
const p2: Product = { name: 'Hat', price: 20, description: 'A hat', salePrice: 15 }
```

---

### Union Types — "This OR That"

Use `|` to say a value can be one of several types:

```ts
// A variable that can be string OR null
let username: string | null = null
username = 'Gimhana'   // ✅ fine

// A variable that can only be specific string values
type Status = 'loading' | 'success' | 'error'
let pageStatus: Status = 'loading'   // ✅
let pageStatus: Status = 'pending'   // ❌ TypeScript error
```

---

### Declaring Functions

```ts
// Basic function — annotate parameters AND return type
function greet(name: string): string {
  return `Hello, ${name}`
}

// Arrow function — same idea
const greet = (name: string): string => {
  return `Hello, ${name}`
}

// Function that returns nothing — use void
function logMessage(msg: string): void {
  console.log(msg)
}

// Function with an optional parameter
function greet(name: string, title?: string): string {
  return title ? `Hello, ${title} ${name}` : `Hello, ${name}`
}
greet('Gimhana')          // ✅ "Hello, Gimhana"
greet('Gimhana', 'Mr')   // ✅ "Hello, Mr Gimhana"

// Function with a default parameter
function greet(name: string, role: string = 'Guest'): string {
  return `Hello ${role} ${name}`
}
```

---

### Async Functions

```ts
// An async function always returns a Promise
// Promise<string> means "this will eventually return a string"
async function fetchUsername(id: number): Promise<string> {
  const res = await fetch(`/api/users/${id}`)
  const data = await res.json()
  return data.username   // TypeScript knows this should be a string
}

// Promise<void> — async function that returns nothing
async function saveData(): Promise<void> {
  await fetch('/api/save', { method: 'POST' })
}
```

---

## 1. The Basics — Types & Interfaces


### Types

A `type` is just a label you define and reuse:

```ts
// Defining a type
type Status = 'loading' | 'success' | 'error'

// Using it
const pageStatus: Status = 'loading'      // ✅ fine
const pageStatus: Status = 'pending'      // ❌ TypeScript error — 'pending' is not in the type
```

```ts
// Object type
type Product = {
  id: number
  title: string
  price: number
  thumbnail: string
  brand?: string    // the ? means this property is optional (may or may not exist)
}
```

### Interfaces

An `interface` does almost the same thing as a `type` for objects.
At Apadmi-level Vue work, the main practical difference is:

| | `type` | `interface` |
|---|---|---|
| Can describe unions (`'a' \| 'b'`) | ✅ | ❌ |
| Can describe objects | ✅ | ✅ |
| Can be extended later | ❌ (not directly) | ✅ |
| Convention in Vue ecosystem | `type` preferred | used for class contracts |

**Rule of thumb**: Use `type` for almost everything in Vue projects.
Use `interface` if you're defining a contract for a class.

---

## 2. Union Types — Values That Can Be One of Several Things

```ts
// A value that can be a string or null
type ErrorMessage = string | null

const error: ErrorMessage = 'Network failed'   // ✅
const error: ErrorMessage = null               // ✅ (no error yet)
const error: ErrorMessage = 42                 // ❌ TypeScript error
```

### The FetchState Pattern (used in the master plan)

This is a union type where each option has a `status` field. TypeScript uses the `status` field
to know which shape the object is:

```ts
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }         // has data when successful
  | { status: 'error'; message: string }   // has message when failed

// Using it:
const state: FetchState<Product[]> = { status: 'loading' }

// TypeScript is smart enough to know:
if (state.status === 'success') {
  console.log(state.data)     // ✅ TypeScript knows data exists here
  console.log(state.message)  // ❌ TypeScript error — message doesn't exist on success
}
```

> **Both styles below are valid TypeScript — it's purely formatting:**
>
> ```ts
> // Style A — leading pipe on every line (including the first)
> type FetchState<T> =
>   | { status: 'idle' }
>   | { status: 'loading' }
>   | { status: 'success'; data: T }
>
> // Style B — no pipe on the first line
> type FetchState<T> =
>   { status: 'idle' }
>   | { status: 'loading' }
>   | { status: 'success'; data: T }
> ```
>
> **Which to use?** Style A (leading `|` on every line) is the convention preferred in most TypeScript projects because:
> - Every option **looks the same visually** — easier to scan
> - Easy to add/remove options without worrying about the first line being different
> - It's what you'll see in most Vue/TypeScript codebases
>
> ✅ **Use Style A** — it's what this cheat sheet uses throughout.


This is called **type narrowing** — TypeScript narrows down which union member you're working with
based on a condition you check.

---

## 3. Generics — Reusable Types with a Blank

**The problem without generics:**

```ts
// You'd need a separate function for every type:
function getFirstProduct(items: Product[]): Product { return items[0] }
function getFirstUser(items: User[]): User { return items[0] }
// Annoying. Lots of repetition.
```

**With generics — one function, works for any type:**

```ts
// ❌ WRONG — TypeScript has no idea what T is. T is never declared.
function getFirst(items: T[]): T {
  return items[0]
}
// Error: "Cannot find name 'T'"
// T looks like a type but it was never introduced/declared anywhere.

// ✅ CORRECT — <T> after the function name declares T as a generic placeholder
function getFirst<T>(items: T[]): T {
  return items[0]
}
```

> **Think of `<T>` like declaring a variable before using it:**
> ```ts
> // You can't use x before declaring it:
> console.log(x)      // ❌ x is not defined
> let x = 5
>
> // Same with T — you can't use T before declaring it:
> function getFirst(items: T[]): T   // ❌ T is not defined
> function getFirst<T>(items: T[]): T  // ✅ T is declared with <T>, then used
> ```
> The `<T>` right after the function name is TypeScript saying: *"I'm introducing a new placeholder type called T — it will be filled in when someone calls this function."*

```ts
// TypeScript figures out what T is from what you pass in:
const product = getFirst<Product>(products)  // T = Product
const user    = getFirst<User>(users)        // T = User

// Or even simpler — TypeScript infers T automatically:
const product = getFirst(products)  // TypeScript sees Product[] and sets T = Product
```


### Where You'll See Generics in Vue/Nuxt Code

**1. Typing `ref`:**

```ts
import { ref } from 'vue'

// Without generic — TypeScript has to guess the type
const count = ref(0)           // TypeScript infers: Ref<number> ✅ (simple case, fine)

// With generic — you declare exactly what it can hold
const products = ref<Product[]>([])   // Ref<Product[]> — explicitly typed
const error = ref<string | null>(null) // Can be a string or null
```

**2. Typing `shallowRef`:**

```ts
import { shallowRef } from 'vue'

const items = shallowRef<Product[]>([])
// items.value is typed as Product[]
// TypeScript will error if you try to assign a User[] to items.value
```

**3. Typing `computed`:**

```ts
import { computed } from 'vue'

const totalPrice = computed<number>(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price, 0)
})
// totalPrice.value is typed as number — TypeScript knows this
```

**4. Nuxt's `useFetch`:**

```ts
// The <ProductList> tells TypeScript what shape the API response will be
const { data, pending, error } = useFetch<ProductList>('/api/products')

// Now TypeScript knows: data.value is ProductList | null
// You get full autocomplete on data.value.products, data.value.total, etc.
```

---

## 4. Typing Vue Component Props — `defineProps<{}>()`

This is one of the most common TypeScript patterns in Vue 3.

```vue
<script setup lang="ts">
// Define what props this component accepts:
const props = defineProps<{
  product: Product        // required — must always be passed
  isHighlighted?: boolean // optional — ? means it might not be passed
  maxWidth: number
}>()

// Now TypeScript knows:
console.log(props.product.title)   // ✅ autocomplete works
console.log(props.product.xyz)     // ❌ TypeScript error — xyz doesn't exist on Product
</script>
```

### With Default Values

```vue
<script setup lang="ts">
// withDefaults lets you set fallback values for optional props
const props = withDefaults(
  defineProps<{
    isHighlighted?: boolean
    maxWidth?: number
  }>(),
  {
    isHighlighted: false,   // default if not passed
    maxWidth: 400,
  }
)
</script>
```

---

## 5. Typing Vue Component Emits — `defineEmits<{}>()`

```vue
<script setup lang="ts">
// Define what events this component can fire, and the shape of their payload:
const emit = defineEmits<{
  'add-to-cart': [product: Product]     // fires with a Product
  'close': []                           // fires with no data
  'quantity-changed': [id: number, qty: number]  // fires with two values
}>()

// Using it:
emit('add-to-cart', currentProduct)    // ✅
emit('add-to-cart', 'wrong-type')     // ❌ TypeScript error — expects Product
emit('close')                          // ✅
</script>
```

---

## 6. Typing Composables — Return Values

When you write a composable, you should type what it returns so callers get autocomplete:

```ts
// composables/useProducts.ts
import { shallowRef, ref } from 'vue'
import type { Product } from '@/schemas/product.schema'

// The return type is inferred automatically — you don't have to write it manually.
// But you can be explicit:
export function useProducts(): {
  products: Ref<Product[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  fetchProducts: () => Promise<void>
} {
  const products  = shallowRef<Product[]>([])
  const isLoading = ref(false)
  const error     = ref<string | null>(null)

  async function fetchProducts(): Promise<void> {
    // fetch logic...
  }

  return { products, isLoading, error, fetchProducts }
}
```

**Shortcut**: Most of the time you don't need to write the return type manually.
TypeScript infers it from what you `return`. The explicit return type is mainly useful
when the composable is complex and you want to be very clear for teammates.

---

## 7. Utility Types — The Most Useful Ones

These are built into TypeScript. You don't need to define them — just use them.

### `Partial<T>` — Make all properties optional

```ts
type Product = { id: number; title: string; price: number }

// All properties become optional:
type ProductDraft = Partial<Product>
// Same as: { id?: number; title?: string; price?: number }

// Useful for: form state, partial API updates (PATCH requests)
const formState: ProductDraft = { title: 'New product' } // ✅ id and price not required
```

### `Pick<T, Keys>` — Take only some properties

```ts
// Only take id and title from Product:
type ProductSummary = Pick<Product, 'id' | 'title'>
// Same as: { id: number; title: string }

// Useful for: list views that only need a subset of fields
function renderProductCard(product: ProductSummary): void { ... }
```

### `Omit<T, Keys>` — Remove some properties

```ts
// Product without the price:
type ProductWithoutPrice = Omit<Product, 'price'>
// Same as: { id: number; title: string; thumbnail: string; ... }

// Useful for: removing sensitive or irrelevant fields before passing to a component
```

### `Record<Keys, Value>` — An object where you know the key and value types

```ts
// An object where keys are strings and values are Product arrays:
type CategoryMap = Record<string, Product[]>

const byCategory: CategoryMap = {
  electronics: [product1, product2],
  clothing:    [product3],
}

// Useful for: grouping data, caches, lookup tables
const productCache: Record<number, Product> = {} // keyed by product id
```

### `ReturnType<typeof fn>` — Get the return type of a function

```ts
function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

// Instead of writing string manually:
type FormattedPrice = ReturnType<typeof formatPrice>  // string

// Useful for: matching the return type of a function without repeating yourself
```

---

## 8. Type Inference from Zod — `z.infer<>`

This is the pattern used throughout the master plan. It means:
*"I don't want to write the TypeScript type manually — I want TypeScript to figure it out from the Zod schema."*

```ts
import { z } from 'zod'

// Define the Zod schema (runtime validation):
const ProductSchema = z.object({
  id:    z.number(),
  title: z.string(),
  price: z.number(),
})

// Derive the TypeScript type FROM the schema — single source of truth:
type Product = z.infer<typeof ProductSchema>
// TypeScript now knows: Product = { id: number; title: string; price: number }

// You never write the type twice. Change the schema → type updates automatically.
```

**Why this is powerful**: If the API adds a new field and you update the Zod schema,
the TypeScript type automatically updates everywhere. No manual sync required.

---

## 9. Typing Pinia Stores

```ts
// stores/cart.store.ts
import { defineStore } from 'pinia'
import type { Product } from '@/schemas/product.schema'

// TypeScript infers the state shape automatically from what you return in state()
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],    // 'as CartItem[]' tells TS what this array holds
    isOpen: false as boolean,
  }),

  getters: {
    // Return type inferred automatically:
    totalItems: (state): number =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
  },

  actions: {
    // Typed action:
    addItem(product: Product, quantity: number = 1): void {
      const existing = this.items.find(i => i.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        this.items.push({ ...product, quantity })
      }
    },
  },
})

// Using the store — TypeScript knows everything about it:
const cart = useCartStore()
cart.addItem(product, 2)    // ✅ TypeScript checks product is Product type
cart.totalItems             // ✅ TypeScript knows this is number
cart.xyz                    // ❌ TypeScript error — xyz doesn't exist
```

---

## 10. `type` vs `import type` — Important for Performance

```ts
// Regular import — bundles the value AND the type
import { Product } from '@/schemas/product.schema'

// Type-only import — TypeScript erases this completely at build time
// Use this when you only need the type label, not the runtime value
import type { Product } from '@/schemas/product.schema'
```

**Rule**: If you're only using something as a TypeScript type annotation (not calling it as
a function or creating instances), use `import type`. This keeps your bundle smaller.

```ts
// Example — you only use Product as a label here, not as a value:
import type { Product } from '@/schemas/product.schema'

function formatPrice(product: Product): string {   // Product used as label only
  return `$${product.price}`
}
```

---

## 11. Common Interview Questions & Answers

**"What's the difference between `type` and `interface` in TypeScript?"**

Think of them like this:
- **`interface`** = a **contract/blueprint** → "this object MUST have these properties"
- **`type`** = a **label/alias** → "this thing can be described as..."

| | `type` | `interface` |
|---|---|---|
| Describe unions (`'a' \| 'b'`) | ✅ Yes | ❌ No |
| Describe objects | ✅ Yes | ✅ Yes |
| Add fields later (declaration merging) | ❌ No | ✅ Yes |

```ts
// ✅ Only 'type' can do this
type Status = 'active' | 'inactive' | 'pending'
type ID = string | number

// ✅ Only 'interface' can do this — add fields across declarations
interface Animal { name: string }
interface Animal { age: number }  // merges! Animal now has both fields

// ✅ Use 'interface' for class contracts
interface Repository {
  save(): void
  find(id: number): User
}
class UserRepository implements Repository { ... }
```

> **Rule of thumb**: Use `type` for almost everything in Vue projects — it's more flexible.
> Only reach for `interface` when defining a contract for a class.

> *Interview answer: "Both describe object shapes. `type` is more flexible — it handles unions
> and primitive aliases, which `interface` can't. `interface` supports declaration merging.
> In Vue 3 I default to `type` for everything, and only use `interface` for class contracts."*

**"How do you type a Vue composable?"**
> *"The return type is usually inferred automatically by TypeScript from what the composable
> returns. I annotate the parameters explicitly and let TypeScript infer the return. For complex
> composables I'll add an explicit return type annotation so teammates see the public API
> clearly. The critical ones to annotate are the `ref`s — `ref<Product[]>([])` instead of just
> `ref([])`, so TypeScript knows the array holds Products, not `never[]`."*

**"What are TypeScript utility types and which do you use most?"**
> *"`Partial` for form/draft states where not all fields are filled yet. `Pick` and `Omit`
> for creating subset types for list views (you don't need all 20 fields on a product card,
> just `id`, `title`, `thumbnail`). `Record` for cache objects keyed by ID. In a Vue project
> the most useful one day-to-day is `Partial` — almost every form or PATCH request needs it."*

**"What is `z.infer<typeof Schema>` doing?"**
> *"It's telling TypeScript: don't make me write the type manually — derive it from the Zod
> schema I've already defined. The schema and the TypeScript type stay in sync automatically.
> If the API adds a field and I update the Zod schema, the TypeScript type updates everywhere
> it's used without me touching anything. Single source of truth."*

**"Why use `import type` instead of `import`?"**
> *"When you import something only as a type annotation, it's erased completely at build time —
> it contributes zero bytes to your bundle. `import type` makes this explicit and enforced:
> TypeScript will error if you accidentally try to use the import as a runtime value. On a
> mobile project where every kilobyte matters, it's a good habit."*
