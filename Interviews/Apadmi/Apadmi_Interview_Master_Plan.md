# Apadmi — Senior Front-End Developer Interview Master Plan

> **Role**: Senior Front-End Developer · Mobile-First Digital Product Agency  
> **Stack**: Vue 3 · Nuxt 3 · TypeScript · Pinia · Headless CMS  
> **Schedule**: Tuesday → Wednesday → [Thursday OFF] → Friday (Mock + Delivery)  
> **Single source of truth** — own this file. Review it every morning.

---

## Table of Contents

1. [3-Day Execution Schedule](#3-day-execution-schedule)
   - [Day 1 — Vue 3 Core, Memory & Component Architecture](#day-1--tuesday--vue-3-core-memory--component-architecture)
   - [Day 2 — Data Fetching, Headless CMS & TypeScript Schemas](#day-2--wednesday--data-fetching-headless-cms--typescript-schemas)
   - [Day 3 — Nuxt SSR, Pinia Architecture & Mock Interview](#day-3--friday-morning--nuxt-ssr-pinia-architecture--mock-interview)
2. [Enterprise Technical Standards](#enterprise-technical-standards)
   - [Mobile Performance Benchmarks](#mobile-performance-benchmarks)
   - [API Resilience Architecture](#api-resilience-architecture)
3. [Project Directory Structure](#project-directory-structure)
4. [Daily Ritual Checklist](#daily-ritual-checklist)

---

## Companion Cheat Sheets (read alongside this plan)

> These files were generated after a JD gap analysis. Study in order on the assigned day.

| File | Day to Study | JD Gap It Covers |
|---|---|---|
| `Day_1_Vue_Core_Performance/Vue_Reactivity_And_Memory.md` | Day 1 morning | Vue reactivity internals, memory leaks |
| `Day_1_Vue_Core_Performance/VirtualScrollList.vue` | Day 1 afternoon | Virtual scroll working implementation |
| `TypeScript_Vue3_CheatSheet.md` | **Day 2 morning** | TypeScript — "firm understanding" required in JD |
| `Amplience_CMS_CheatSheet.md` | Day 2 evening | **Amplience** — explicitly named in JD |
| `Testing_Strategy_CheatSheet.md` | Day 2 evening | Automated testing — Vitest + Playwright |
| `AI_Assisted_Dev_CheatSheet.md` | Day 3 morning | AI-assisted development + security review |
| `Senior_Behaviours_STAR_Stories.md` | Day 3 mock block | Mentoring, client liaison, leadership stories |

---

## 3-Day Execution Schedule

---

### Day 1 · Tuesday — Vue 3 Core, Memory & Component Architecture

> **North Star**: Walk into Day 2 able to explain Vue's reactivity internals and write a production-quality virtual scroll list without reaching for a library.

#### Morning Block (08:00 – 12:00) — Reactivity Deep Dive

- [ ] **`ref` vs `shallowRef` internals**
  - `ref()` → wraps value in `RefImpl`, calls `reactive()` on objects → full deep Proxy
  - `shallowRef()` → wraps value in `RefImpl`, does **not** apply Proxy to the value → only `.value` itself is tracked
  - **Rule**: Use `shallowRef` for any array > 500 items you replace wholesale (e.g., API page results)
  - Be able to trace: `get` trap → `track()` → `activeEffect` → `WeakMap<target, Map<key, Set<effect>>>`

- [ ] **Dependency tracking pseudocode** — write from memory:
  ```ts
  function track(target, key) {
    if (!activeEffect) return
    let depsMap = targetMap.get(target) ?? new Map()
    targetMap.set(target, depsMap)
    let dep = depsMap.get(key) ?? new Set()
    depsMap.set(key, dep)
    dep.add(activeEffect)
    activeEffect.deps.push(dep) // back-reference for cleanup
  }

  function trigger(target, key) {
    targetMap.get(target)?.get(key)?.forEach(e => e.run())
  }
  ```

- [ ] **`computed()` lazy + cached** — `_dirty` flag, only re-runs on dep change
- [ ] **`watch` vs `watchEffect`** — explicit source vs auto-tracked, old/new value

#### Afternoon Block (13:00 – 17:00) — Virtual Scroll & Mobile Performance

- [ ] **Virtual scroll from scratch** — the four numbers that matter:
  ```
  ITEM_HEIGHT     = 96px   (fixed — enables simple index arithmetic)
  startIndex      = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN)
  endIndex        = startIndex + Math.ceil(containerHeight / ITEM_HEIGHT) + OVERSCAN * 2
  offsetY         = startIndex * ITEM_HEIGHT        (translateY the window)
  totalHeight     = allItems.length * ITEM_HEIGHT   (height of the spacer div)
  ```

- [ ] **Spacer + rendered window pattern** — single `position: relative` parent, `position: absolute` child, `translateY` not `top` (GPU-composited layer, avoids layout)

- [ ] **Thumbnail lazy-load** via `IntersectionObserver`:
  - `root` = scroll container
  - `rootMargin: '100px'` — start load 100px before viewport entry
  - Disconnect observer immediately after image loads → no memory accumulation
  - Store observers in `Map<productId, IntersectionObserver>` → disconnect all in `onUnmounted`

#### Evening Block (18:00 – 20:00) — Memory Leak Patterns

- [ ] The **5 mandatory teardowns** — memorise, recite, code:

  | Created in `onMounted` | Torn down in `onUnmounted` |
  |---|---|
  | `window.addEventListener(event, fn)` | `window.removeEventListener(event, fn)` |
  | `setInterval(fn, ms)` | `clearInterval(id)` |
  | `fetch(url, { signal })` | `controller.abort()` |
  | `new IntersectionObserver(cb).observe(el)` | `observer.disconnect()` |
  | `store.$subscribe(cb)` / `eventBus.on(e, cb)` | `unsubscribe()` / `eventBus.off(e, cb)` |

- [ ] Write the `useEventListener` composable from memory (captures lifecycle automatically)
- [ ] Write the `useIntersectionObserver` composable from memory

#### Day 1 Exit Criteria

- [ ] Can explain `ref` vs `shallowRef` in ≤ 60 seconds without notes
- [ ] Can trace Vue's WeakMap dep graph verbally
- [ ] `VirtualScrollList.vue` renders 5,000 items without jank (Chrome DevTools performance panel shows no dropped frames during scroll)
- [ ] Zero memory leaks confirmed (Chrome Memory tab — heap snapshot before and after unmount shows same retained size)

---

### Day 2 · Wednesday — Data Fetching, Headless CMS & TypeScript Schemas

> **North Star**: Walk into Day 3 able to write a typed, resilient data layer that handles offline states, CMS schema drift, and retry logic — all on a 2G connection.

#### Morning Block (08:00 – 12:00) — TypeScript Schema Architecture

- [ ] **Two-layer type safety**: understand the split

  ```
  src/types/        ← compile-time only (TypeScript interfaces / type aliases)
  src/schemas/      ← runtime validation (Zod schemas — parse at API boundary)
  ```

- [ ] **Why Zod at the CMS boundary?**
  Headless CMS (Contentful / Sanity / Storyblok) can change field names or types in their dashboard without any deploy — your TypeScript types will still compile but data will be undefined/null at runtime. Zod `.parse()` / `.safeParse()` catches this at the network layer.

- [ ] Write Zod schemas for DummyJSON product:

  ```ts
  // src/schemas/product.schema.ts
  import { z } from 'zod'

  export const ProductSchema = z.object({
    id:          z.number().int().positive(),
    title:       z.string().min(1),
    description: z.string(),
    price:       z.number().nonnegative(),
    rating:      z.number().min(0).max(5),
    stock:       z.number().int().nonnegative(),
    brand:       z.string().optional(),
    category:    z.string(),
    thumbnail:   z.string().url(),
    images:      z.array(z.string().url()).default([]),
  })

  export const ProductListSchema = z.object({
    products: z.array(ProductSchema),
    total:    z.number(),
    skip:     z.number(),
    limit:    z.number(),
  })

  // Infer TypeScript type from Zod schema — single source of truth
  export type Product     = z.infer<typeof ProductSchema>
  export type ProductList = z.infer<typeof ProductListSchema>
  ```

- [ ] **`.safeParse()` over `.parse()`** in production:

  ```ts
  const result = ProductListSchema.safeParse(rawJson)
  if (!result.success) {
    console.error('[schema] CMS payload drift:', result.error.flatten())
    // Return fallback / empty state rather than crashing
    return { products: [], total: 0, skip: 0, limit: 0 }
  }
  return result.data
  ```

#### Afternoon Block (13:00 – 17:00) — API Resilience & Composables

- [ ] **Server-state composable pattern** — the full anatomy:

  ```ts
  // src/composables/useProducts.ts
  export function useProducts() {
    const products  = shallowRef<Product[]>([])
    const isLoading = ref(false)
    const error     = ref<string | null>(null)
    const controller = new AbortController()

    async function fetchWithRetry(skip: number, retries = 3): Promise<ProductList> {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const result = await fetchPage(skip, controller.signal)
          return result
        } catch (err) {
          if ((err as Error).name === 'AbortError') throw err
          if (attempt === retries) throw err
          // Exponential back-off: 500ms, 1000ms, 2000ms
          await delay(500 * 2 ** (attempt - 1))
        }
      }
      throw new Error('Unreachable')
    }

    onUnmounted(() => controller.abort())

    return { products, isLoading, error, fetchWithRetry }
  }
  ```

- [ ] **Offline detection** — `navigator.onLine` + event listeners:

  ```ts
  const isOnline = ref(navigator.onLine)
  window.addEventListener('online',  () => { isOnline.value = true })
  window.addEventListener('offline', () => { isOnline.value = false })
  // onUnmounted: removeEventListener for both
  ```

- [ ] **DummyJSON integration** — endpoints to know:

  | Purpose | Endpoint |
  |---|---|
  | Paginated products | `GET /products?limit=100&skip={n}&select=id,title,price,thumbnail` |
  | Single product | `GET /products/{id}` |
  | Search | `GET /products/search?q={term}` |
  | Categories | `GET /products/categories` |
  | By category | `GET /products/category/{name}` |

- [ ] **Stale-while-revalidate pattern** for mobile:
  1. Return cached data immediately (from `localStorage` or in-memory `Map`)
  2. Fetch fresh data in background
  3. Replace stale data when fetch resolves
  4. User sees content in < 100ms even on slow networks

- [ ] **Timeout wrapper** — `fetch` has no built-in timeout:

  ```ts
  function fetchWithTimeout(url: string, ms: number, signal: AbortSignal): Promise<Response> {
    const timeoutId = setTimeout(() => controller.abort(), ms)
    return fetch(url, { signal })
      .finally(() => clearTimeout(timeoutId))
  }
  // Use 8000ms for 3G/mobile, 3000ms for desktop
  ```

#### Evening Block (18:00 – 20:00) — CMS Mapping & Payload Normalisation

- [ ] **Headless CMS field mapping** — Contentful / Sanity raw payloads never match your frontend types directly. Write a transform layer:

  ```ts
  // src/utils/mappers/product.mapper.ts
  import type { ContentfulProductEntry } from '@/types/cms'
  import type { Product } from '@/schemas/product.schema'

  export function mapContentfulToProduct(entry: ContentfulProductEntry): Product {
    return {
      id:          entry.sys.id as unknown as number,
      title:       entry.fields.name,
      description: entry.fields.shortDescription ?? '',
      price:       entry.fields.price.value,
      rating:      entry.fields.averageRating ?? 0,
      stock:       entry.fields.inventoryCount ?? 0,
      brand:       entry.fields.brand?.fields.name,
      category:    entry.fields.productCategory,
      thumbnail:   `https:${entry.fields.mainImage.fields.file.url}`,
      images:      entry.fields.gallery?.map(img => `https:${img.fields.file.url}`) ?? [],
    }
  }
  ```

- [ ] **`select` parameter discipline** — never fetch full product objects when you only need `id`, `title`, `thumbnail` for the list view. Always use DummyJSON's `?select=` param.

#### Evening Block (18:00 – 20:00) — Amplience CMS & Testing Foundation

> **Read**: `Amplience_CMS_CheatSheet.md` and `Testing_Strategy_CheatSheet.md`

- [ ] **Amplience Content Delivery API** — the fetch pattern:
  - Base URL: `https://c1.adis.ws/v1/content/{hub-name}/{contentId}?depth=all&format=inlined`
  - Key params: `depth=all` (avoids N+1 linked content fetches), `locale=en-GB`, `stagingEnvironment` for preview
  - Dynamic Media image CDN: URL query params (`?w=400&fmt=webp&qlt=80`) — no upload from Vue, pure URL manipulation
  - **Bridge statement for interview**: "I haven't used Amplience's authoring UI directly, but the delivery API pattern — fetch → Zod validate at boundary → map to frontend type → surface reactively in Vue — is identical to how I've handled product catalogue APIs at Velou."

- [ ] **Testing pyramid** — memorise the three layers and what belongs in each:
  - **Unit (Vitest)**: Zod schemas, mappers, pure utilities — fast, many, no DOM
  - **Integration (Vue Test Utils + Vitest)**: component rendering + user events — `mount()`, `trigger()`, `emitted()`
  - **E2E (Playwright)**: 5–10 critical user flows — scroll behaviour, offline banner, cart persistence

- [ ] **One-line principle to cite**: *"I test behaviour, not implementation — I test what the user sees and does, not how Vue tracks reactivity internally."*

- [ ] **Coverage targets**: Zod schemas 100%, mappers 90%, utils 85%, components 70%

- [ ] **Accessibility in testing**: `@axe-core/playwright` + `withTags(['wcag2a', 'wcag2aa'])` — run on every PR

#### Day 2 Exit Criteria

- [ ] Can explain Zod vs TypeScript in ≤ 90 seconds: "TypeScript is erased at runtime; Zod validates at runtime"
- [ ] `useProducts` composable handles: timeout → retry (3x) → offline fallback → error state
- [ ] CMS payload mapper has unit tests (Vitest) for malformed input returning safe defaults
- [ ] Can recite the 5 DummyJSON endpoints from memory
- [ ] Can describe Amplience delivery API fetch pattern and explain the Velou bridge statement confidently
- [ ] Can name all 3 testing pyramid layers and give one example test for each

---

### Day 3 · Friday Morning — Nuxt SSR, Pinia Architecture & Mock Interview

> **North Star**: On the day of the interview, deliver like you have shipped this in production. Every answer has a concrete reason grounded in mobile UX.

#### Block 1 (07:00 – 09:00) — Nuxt 3 SSR vs Client Hydration

- [ ] **SSR rendering modes** — know when to use each:

  | Mode | Nuxt directive | Use case |
  |---|---|---|
  | Server-Side Rendered | default | SEO-critical pages (product detail, category) |
  | Static Generated | `nuxt generate` | Marketing pages, blog (rarely change) |
  | Client-Side Only | `<ClientOnly>` | Auth-dependent widgets, interactive charts |
  | Hybrid | `routeRules` per route | Mix SSR + static per page |

- [ ] **Hydration mismatch** — the #1 SSR gotcha:
  - Server renders HTML with one set of data → client re-renders with different data → DOM mismatch → Vue discards SSR output and re-renders from scratch (kills TTFB benefit)
  - **Fix**: ensure server and client fetch from same source in same order. Use `useAsyncData` / `useFetch` — Nuxt serialises the result and ships it in `__NUXT_DATA__` to prevent double-fetch.

- [ ] **`useAsyncData` vs `useFetch`**:

  ```ts
  // useFetch — sugar for GET requests to URLs
  const { data, pending, error } = useFetch<ProductList>(
    () => `/api/products?skip=${skip.value}`,
    { watch: [skip], transform: (raw) => ProductListSchema.parse(raw) }
  )

  // useAsyncData — for any async function (GraphQL, SDK calls, etc.)
  const { data } = useAsyncData(
    'products',                          // cache key — deduplicated across server/client
    () => $fetch('/api/products'),
    { transform: (raw) => ProductListSchema.parse(raw) }
  )
  ```

- [ ] **Key Nuxt SSR performance facts**:
  - `useAsyncData` with `server: false` → only runs on client (skip for non-SEO data)
  - `lazy: true` → unblocks page navigation, loads data in background
  - `getCachedData` option → implement stale-while-revalidate at Nuxt level

#### Block 2 (09:00 – 11:00) — Pinia Architecture

- [ ] **When to use Pinia store vs composable**:

  | Concern | Use |
  |---|---|
  | Global UI state (sidebar open, theme, auth user) | Pinia store |
  | Server/API fetched data (products, categories) | `useAsyncData` / `useFetch` composable |
  | Form state (local to one page) | `ref/reactive` in component |
  | Cross-component shared logic | Composable (no store) |

  > **Key principle**: Pinia is for state that must survive route navigation. Data that is re-fetched per route belongs in composables.

- [ ] **Store anatomy** — Options API style is fine for interviews (easier to read aloud):

  ```ts
  // src/stores/cart.store.ts
  import { defineStore } from 'pinia'
  import { CartItemSchema } from '@/schemas/cart.schema'

  export const useCartStore = defineStore('cart', {
    state: () => ({
      items: [] as CartItem[],
      isOpen: false,
    }),
    getters: {
      totalItems: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: (state) => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    },
    actions: {
      addItem(product: Product, quantity = 1) {
        const existing = this.items.find(i => i.id === product.id)
        if (existing) {
          existing.quantity += quantity
        } else {
          this.items.push({ ...product, quantity })
        }
      },
      removeItem(productId: number) {
        this.items = this.items.filter(i => i.id !== productId)
      },
      clearCart() {
        this.items = []
      },
    },
    persist: true, // pinia-plugin-persistedstate — localStorage sync
  })
  ```

- [ ] **Pinia in SSR (Nuxt)** — state is serialised per-request (no cross-request contamination):
  - Each server request gets a fresh Pinia instance
  - `useNuxtApp().$pinia` is request-scoped
  - Never store request-specific data in a store that leaks between users

#### Block 3 (09:00 – 11:00) — AI-Assisted Dev & Senior Behaviours

> **Read**: `AI_Assisted_Dev_CheatSheet.md` and `Senior_Behaviours_STAR_Stories.md`

- [ ] **AI tools you cite**: GitHub Copilot (in-editor completion), Claude (architecture + composables), Cursor (multi-file refactoring)

- [ ] **Security review checklist** — memorise the 5 categories:
  1. No hardcoded secrets / API keys
  2. All external data through Zod `.safeParse()` at boundary
  3. No `v-html` without sanitisation (XSS)
  4. Any new npm package → check CVEs + maintenance (`npm audit`)
  5. Auth flows written manually — never accept AI output for auth

- [ ] **Three STAR stories rehearsed** — tell each aloud, timed:

  | Story | Question trigger | Target time |
  |---|---|---|
  | Composable template + junior mentoring (Recurved) | "Tell me about mentoring a junior" | 2 minutes |
  | Client requirement scoping → admin panel (Recurved) | "Technical liaison with a client" | 2 minutes |
  | `shallowRef` perf fix → 3-5s → <100ms (Velou) | "Proactive problem resolution" | 2 minutes |

#### Block 4 (11:00 – 13:00) — Full Mock Interview & Delivery Practice

- [ ] **Run a self-timed mock interview** (set phone timer for each answer):

  | Question | Cheat sheet | Target time |
  |---|---|---|
  | "Walk me through the Vue reactivity system" | `Vue_Reactivity_And_Memory.md` §2 | 90 seconds |
  | "How would you build a virtual scroll for 5,000 products?" | `Apadmi_Interview_Master_Plan.md` Day 1 | 2 minutes |
  | "What's your API resilience strategy on a weak mobile network?" | Master Plan §API Resilience | 2 minutes |
  | "SSR vs CSR — when do you choose each at Apadmi?" | Master Plan Day 3 Block 1 | 60 seconds |
  | "How do you prevent memory leaks in a mobile SPA?" | `Vue_Reactivity_And_Memory.md` §3 | 90 seconds |
  | "Walk me through your Pinia vs composable decision" | Master Plan Day 3 Block 2 | 60 seconds |
  | "Have you used Amplience before?" | `Amplience_CMS_CheatSheet.md` §6 | 60 seconds |
  | "What is your testing strategy for a Vue feature?" | `Testing_Strategy_CheatSheet.md` §6 | 90 seconds |
  | "Do you use AI in your development workflow?" | `AI_Assisted_Dev_CheatSheet.md` §6 | 90 seconds |
  | "Tell me about mentoring a junior developer" | `Senior_Behaviours_STAR_Stories.md` Story 1 | 2 minutes |

- [ ] **Closing question prep** (ask these — shows product depth and research):
  - "Amplience is named in your JD — is that the primary CMS across your client projects, or does it vary by client?"
  - "How does Apadmi measure mobile performance on client projects — Lighthouse CI, Web Vitals, or proprietary tooling?"
  - "How does the team handle knowledge transfer when rotating between multiple client projects simultaneously?"

---

## Enterprise Technical Standards

---

### Mobile Performance Benchmarks

> These are the numbers you cite when asked about "performance standards". Know them cold.

#### Core Web Vitals Targets (Mobile — 4G)

| Metric | Good | Needs Improvement | Poor |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s – 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200ms – 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |
| **FCP** (First Contentful Paint) | ≤ 1.8s | 1.8s – 3.0s | > 3.0s |
| **TTFB** (Time to First Byte) | ≤ 800ms | 800ms – 1800ms | > 1800ms |

> **Apadmi framing**: "On a mobile-first project I target ≤ 2.5s LCP on 4G and ≤ 200ms INP. SSR with Nuxt handles LCP; virtualisation and `shallowRef` handle INP during scroll."

#### Mobile Bundle Size Targets

| Asset | Target | Enforcement |
|---|---|---|
| **Initial JS bundle** (gzipped) | ≤ 170 KB | Vite `build.rollupOptions` chunk splitting |
| **First CSS** (gzipped) | ≤ 14 KB | Purge unused styles (`purgecss`) |
| **Single route chunk** | ≤ 50 KB | Dynamic `import()` per route |
| **Image (product thumb)** | ≤ 40 KB | WebP + `srcset`, served from CDN |
| **Total page weight (mobile)** | ≤ 500 KB | Lighthouse budget.json CI gate |

#### Lighthouse CI Thresholds (block merge if failed)

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance":    ["error", { "minScore": 0.85 }],
        "categories:accessibility":  ["error", { "minScore": 0.95 }],
        "first-contentful-paint":    ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint":  ["error", { "maxNumericValue": 2500 }],
        "total-blocking-time":       ["error", { "maxNumericValue": 300 }],
        "cumulative-layout-shift":   ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

#### Mobile Scroll Performance Rules

| Rule | Target |
|---|---|
| DOM nodes in viewport at any time | ≤ 30 rendered rows (virtual scroll) |
| Scroll event handler cost | Passive listener only (`@scroll.passive`) |
| Image decode strategy | `decoding="async"` on all thumbnails |
| Animation property | `transform` / `opacity` only (compositor thread) |
| Layout thrash guard | Never read `.offsetHeight` inside scroll loop |

---

### API Resilience Architecture

> The exact pattern to describe in interview when asked "how do you handle API calls on mobile?"

#### Decision Tree

```
User action → fetch required?
    │
    ├─ Is device online?  (navigator.onLine)
    │       No  → Show cached stale data + offline banner
    │       Yes → proceed
    │
    ├─ Is fresh cache available? (< 5 min old)
    │       Yes → Return cache immediately, revalidate in background (SWR)
    │       No  → proceed
    │
    ├─ Execute fetch with AbortController + 8s timeout
    │       AbortError (timeout) → retry with back-off
    │       HTTP 429 / 503      → retry with back-off
    │       HTTP 404 / 400      → show error state (no retry — user error)
    │       Network error       → retry with back-off
    │
    ├─ Retry schedule: attempt 1 → 500ms → attempt 2 → 1000ms → attempt 3 → 2000ms
    │       3rd failure → show error state with manual retry button
    │
    └─ Success → parse with Zod .safeParse()
            Invalid schema → log drift, return safe default
            Valid         → update reactive state + write cache
```

#### Timeout Thresholds

| Network condition | Fetch timeout | Retry attempts |
|---|---|---|
| WiFi / fast 4G | 5,000 ms | 2 |
| Standard 4G | 8,000 ms | 3 |
| 3G / weak signal | 12,000 ms | 3 |
| Offline (detected) | — (skip fetch) | 0 |

> Detect connection quality: `navigator.connection.effectiveType` (`'4g'` / `'3g'` / `'2g'` / `'slow-2g'`)

#### Offline Fallback States (UI Spec)

```ts
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'stale'; data: T; staleSince: Date }      // showing cached data
  | { status: 'success'; data: T; fetchedAt: Date }
  | { status: 'offline'; cachedData: T | null }          // device is offline
  | { status: 'error'; message: string; retryable: boolean }
```

#### Retry Logic Implementation (Production-Grade)

```ts
// src/utils/fetchWithResilience.ts

interface FetchOptions {
  timeoutMs?: number
  maxRetries?: number
  retryOn?: number[]   // HTTP status codes that trigger retry
}

const DEFAULT_RETRY_CODES = [408, 429, 500, 502, 503, 504]

export async function fetchWithResilience<T>(
  url: string,
  signal: AbortSignal,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeoutMs  = 8000,
    maxRetries = 3,
    retryOn    = DEFAULT_RETRY_CODES,
  } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const timeoutController = new AbortController()
    const timeoutId = setTimeout(
      () => timeoutController.abort(new Error('Request timed out')),
      timeoutMs
    )

    // Merge the component's AbortSignal with the timeout signal
    const combinedSignal = AbortSignal.any([signal, timeoutController.signal])

    try {
      const response = await fetch(url, { signal: combinedSignal })
      clearTimeout(timeoutId)

      if (!response.ok) {
        if (!retryOn.includes(response.status)) {
          // Non-retryable error (e.g. 404, 401) — fail immediately
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        throw new Error(`Retryable HTTP ${response.status}`)
      }

      return response.json() as Promise<T>
    } catch (err) {
      clearTimeout(timeoutId)
      lastError = err as Error

      // Never retry if the component unmounted (AbortError from component's controller)
      if (signal.aborted) throw lastError

      if (attempt < maxRetries) {
        const backoffMs = 500 * 2 ** (attempt - 1) // 500ms, 1000ms, 2000ms
        await new Promise(resolve => setTimeout(resolve, backoffMs))
      }
    }
  }

  throw lastError!
}
```

---

## Project Directory Structure

> This is the **canonical layout** for the Apadmi mock project. Cite it directly in interview.

```
apadmi-product-catalogue/
│
├── public/                         # Static assets (favicon, robots.txt, og-image)
│
├── src/
│   │
│   ├── assets/                     # Images, fonts, global SVGs
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/                 # Purely presentational, no data fetching
│   │   ├── ui/                     # Atomic: Button, Badge, Spinner, Card
│   │   │   ├── AppButton.vue
│   │   │   ├── AppBadge.vue
│   │   │   └── AppSpinner.vue
│   │   ├── product/                # Domain: ProductRow, ProductCard, ProductSkeleton
│   │   │   ├── ProductRow.vue
│   │   │   ├── ProductCard.vue
│   │   │   └── ProductSkeleton.vue
│   │   └── layout/                 # AppHeader, AppNav, AppFooter
│   │       ├── AppHeader.vue
│   │       └── AppNav.vue
│   │
│   ├── composables/                # ← SERVER STATE & REUSABLE LOGIC (no Pinia)
│   │   ├── useProducts.ts          # Fetch + virtual scroll state for product list
│   │   ├── useProduct.ts           # Single product detail fetching
│   │   ├── useEventListener.ts     # Memory-safe event listener lifecycle
│   │   ├── useIntersectionObserver.ts  # Lazy-load / infinite scroll helper
│   │   ├── useNetworkStatus.ts     # navigator.onLine + effectiveType watcher
│   │   └── useVirtualScroll.ts     # Pure virtual scroll math composable
│   │
│   ├── schemas/                    # ← RUNTIME VALIDATION (Zod — parsed at API boundary)
│   │   ├── product.schema.ts       # ProductSchema, ProductListSchema
│   │   ├── cart.schema.ts          # CartItemSchema
│   │   └── cms.schema.ts           # CMS-specific Zod schemas (Contentful/Sanity)
│   │
│   ├── types/                      # ← COMPILE-TIME TYPES ONLY (TypeScript — erased at runtime)
│   │   ├── api.types.ts            # Raw API response shapes (before Zod parse)
│   │   ├── cms.types.ts            # Headless CMS SDK types
│   │   └── env.d.ts                # import.meta.env typings
│   │
│   ├── stores/                     # ← GLOBAL UI STATE (Pinia — survives route navigation)
│   │   ├── cart.store.ts           # Cart items, open/close
│   │   ├── auth.store.ts           # Auth user, JWT token
│   │   └── ui.store.ts             # Theme, sidebar state, toast queue
│   │
│   ├── utils/                      # Pure functions — no Vue reactivity
│   │   ├── fetchWithResilience.ts  # Timeout + retry wrapper
│   │   ├── mappers/
│   │   │   ├── product.mapper.ts   # CMS payload → Product type
│   │   │   └── cart.mapper.ts
│   │   ├── formatters.ts           # formatPrice, formatRating, formatDate
│   │   └── cache.ts                # localStorage SWR cache helpers
│   │
│   ├── pages/                      # Nuxt file-based routing
│   │   ├── index.vue               # Product list (SSR — SEO)
│   │   ├── products/
│   │   │   └── [id].vue            # Product detail (SSR — SEO)
│   │   └── cart.vue                # Cart (CSR — auth-gated, no SSR needed)
│   │
│   ├── layouts/
│   │   ├── default.vue
│   │   └── minimal.vue
│   │
│   ├── middleware/                 # Nuxt route middleware
│   │   └── auth.ts
│   │
│   └── plugins/                   # Nuxt plugins (Pinia persistence, error reporting)
│       └── error-handler.client.ts
│
├── server/                        # Nuxt server routes (BFF — Backend For Frontend)
│   └── api/
│       ├── products.get.ts        # Proxy + cache DummyJSON, add auth headers
│       └── products/
│           └── [id].get.ts
│
├── tests/
│   ├── unit/                      # Vitest — schemas, mappers, utils
│   │   ├── schemas/
│   │   └── utils/
│   └── e2e/                       # Playwright — scroll performance, offline mode
│
├── .lighthouserc.json             # Lighthouse CI performance budget
├── nuxt.config.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

### Separation Rationale (Memorise This)

| Directory | Technology | When it runs | Purpose |
|---|---|---|---|
| `src/types/` | TypeScript | Compile-time only (erased) | Shape contracts between layers |
| `src/schemas/` | Zod | **Runtime** (at API boundary) | Validate real data, catch CMS drift |
| `src/composables/` | Vue Composition API | Per-component lifecycle | Server state, async data, DOM logic |
| `src/stores/` | Pinia | App lifetime (survives routes) | Global UI state only |
| `src/utils/` | Pure TypeScript | Anywhere | Zero-dependency business logic |
| `server/api/` | Nuxt server routes | **Server only** (H3) | BFF: proxy, auth, cache headers |

---

## Daily Ritual Checklist

> Run this every morning before starting a block.

### Before Each Day Starts

- [ ] Review the **Exit Criteria** from the previous day — can you pass them without notes?
- [ ] Open Chrome DevTools Memory tab — baseline heap snapshot before any work
- [ ] Pull up `Vue_Reactivity_And_Memory.md` — read the soundbites section aloud

### Before Each Coding Block

- [ ] Write the target component/composable API contract in comments first (interface-first development)
- [ ] `onUnmounted` teardown section written **before** the `onMounted` section — forces you to think about cleanup upfront

### Before Mock Interview Block

- [ ] No notes visible — answers from memory only
- [ ] Voice record your answers and play them back — identify filler words and gaps
- [ ] Time each answer — cut anything over 2 minutes

---

> **Mindset**: Apadmi builds products for real users on real mobile networks. Every technical decision you make in the interview — `shallowRef` over `ref`, retry logic, virtual scroll — should be grounded in *user experience on a 4G device*, not framework cleverness. Lead with mobile UX reasoning, then explain the implementation.
