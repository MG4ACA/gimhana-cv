# Vue Testing Strategy — Interview Cheat Sheet

> **JD Requirement**: *"Solid understanding of… automated testing"*
> **Stack**: Vitest · Vue Test Utils · Playwright · Testing Library

---

## 1. The Testing Pyramid for Vue Apps

```
          ┌─────────────────────────────┐
          │         E2E Tests           │  ← Playwright (5–10 critical flows)
          │   (slowest, most realistic) │
          └─────────────┬───────────────┘
                        │
          ┌─────────────┴───────────────┐
          │     Integration Tests       │  ← Vitest + Vue Test Utils (20–40 tests)
          │  (component + composable)   │     Testing rendered output + user events
          └─────────────┬───────────────┘
                        │
          ┌─────────────┴───────────────┐
          │        Unit Tests           │  ← Vitest (many — fast, cheap)
          │ (schemas, utils, mappers)   │     Pure functions, Zod schemas, formatters
          └─────────────────────────────┘
```

**Senior-level principle**: Don't test implementation details — test behaviour.
Test what the user sees and does, not how Vue tracks reactivity internally.

---

## 2. Unit Testing — Schemas, Mappers & Utilities

### Testing Zod Schemas (critical — validates CMS drift protection)

```ts
// tests/unit/schemas/product.schema.test.ts
import { describe, it, expect } from 'vitest'
import { ProductSchema, ProductListSchema } from '@/schemas/product.schema'

describe('ProductSchema', () => {
  it('parses a valid product payload', () => {
    const raw = {
      id: 1,
      title: 'Test Product',
      description: 'A description',
      price: 29.99,
      rating: 4.2,
      stock: 50,
      brand: 'Acme',
      category: 'electronics',
      thumbnail: 'https://example.com/thumb.jpg',
      images: ['https://example.com/img1.jpg'],
    }
    const result = ProductSchema.safeParse(raw)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Test Product')
    }
  })

  it('returns error when thumbnail is not a URL', () => {
    const raw = { ...validProduct, thumbnail: 'not-a-url' }
    const result = ProductSchema.safeParse(raw)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('thumbnail')
    }
  })

  it('uses empty array as default for missing images field', () => {
    const raw = { ...validProduct, images: undefined }
    const result = ProductSchema.safeParse(raw)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.images).toEqual([])
  })
})
```

### Testing Mappers

```ts
// tests/unit/mappers/product.mapper.test.ts
import { describe, it, expect } from 'vitest'
import { mapContentfulToProduct } from '@/utils/mappers/product.mapper'

describe('mapContentfulToProduct', () => {
  it('maps a valid Contentful entry to a Product', () => {
    const entry = mockContentfulEntry({ name: 'Hoodie', price: 49.99 })
    const product = mapContentfulToProduct(entry)
    expect(product.title).toBe('Hoodie')
    expect(product.price).toBe(49.99)
  })

  it('falls back to empty string when shortDescription is absent', () => {
    const entry = mockContentfulEntry({ shortDescription: undefined })
    const product = mapContentfulToProduct(entry)
    expect(product.description).toBe('')
  })
})
```

---

## 3. Component Testing — Vue Test Utils + Vitest

### Core Pattern: mount → interact → assert rendered output

```ts
// tests/unit/components/ProductRow.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductRow from '@/components/product/ProductRow.vue'
import type { Product } from '@/schemas/product.schema'

const mockProduct: Product = {
  id: 1,
  title: 'Wireless Headphones',
  description: 'Premium sound',
  price: 149.99,
  rating: 4.5,
  stock: 5,
  brand: 'SoundMax',
  category: 'electronics',
  thumbnail: 'https://example.com/thumb.jpg',
  images: [],
}

describe('ProductRow', () => {
  it('renders product title', () => {
    const wrapper = mount(ProductRow, { props: { product: mockProduct } })
    expect(wrapper.text()).toContain('Wireless Headphones')
  })

  it('renders formatted price', () => {
    const wrapper = mount(ProductRow, { props: { product: mockProduct } })
    expect(wrapper.text()).toContain('$149.99')
  })

  it('shows "Only X left" badge when stock < 10', () => {
    const wrapper = mount(ProductRow, { props: { product: mockProduct } }) // stock: 5
    expect(wrapper.find('[data-testid="stock-badge"]').text()).toContain('Only 5 left')
  })

  it('shows "X in stock" badge when stock >= 10', () => {
    const wrapper = mount(ProductRow, {
      props: { product: { ...mockProduct, stock: 50 } },
    })
    expect(wrapper.find('[data-testid="stock-badge"]').text()).toContain('50 in stock')
  })

  it('emits "add-to-cart" event when add button is clicked', async () => {
    const wrapper = mount(ProductRow, { props: { product: mockProduct } })
    await wrapper.find('[data-testid="add-to-cart"]').trigger('click')
    expect(wrapper.emitted('add-to-cart')?.[0]).toEqual([mockProduct])
  })
})
```

### Testing Composables

```ts
// tests/unit/composables/useNetworkStatus.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useNetworkStatus } from '@/composables/useNetworkStatus'

describe('useNetworkStatus', () => {
  beforeEach(() => {
    // Simulate online state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
  })

  it('initialises isOnline from navigator.onLine', () => {
    const { isOnline } = useNetworkStatus()
    expect(isOnline.value).toBe(true)
  })

  it('updates isOnline to false when offline event fires', async () => {
    const { isOnline } = useNetworkStatus()
    window.dispatchEvent(new Event('offline'))
    await nextTick()
    expect(isOnline.value).toBe(false)
  })
})
```

---

## 4. E2E Testing — Playwright

### What to test with Playwright (not everything — only critical flows)

| Test | Reason |
|---|---|
| Product list loads & first item visible | Core user journey |
| Virtual scroll renders items on scroll | Performance-critical, hard to unit test |
| Offline banner appears when network cut | Resilience behaviour |
| Cart persists across page navigation | Pinia persistence |
| Keyboard navigation through product list | Accessibility requirement |

### Playwright Example — Scroll Performance

```ts
// tests/e2e/virtual-scroll.spec.ts
import { test, expect } from '@playwright/test'

test('virtual scroll renders items on demand without layout thrash', async ({ page }) => {
  await page.goto('/products')

  // Wait for first item to appear
  await expect(page.locator('[role="listitem"]').first()).toBeVisible()

  // Initially should only render a small window of items (not all 5000)
  const initialCount = await page.locator('[role="listitem"]').count()
  expect(initialCount).toBeLessThan(30) // max overscan window

  // Scroll to the bottom — check items are still rendering
  await page.evaluate(() => {
    const container = document.querySelector('.vsl-scroll-container')
    container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  })

  await page.waitForTimeout(500) // allow scroll settle
  const afterScrollCount = await page.locator('[role="listitem"]').count()
  expect(afterScrollCount).toBeLessThan(30) // still virtual — not all 5000 mounted
})
```

### Playwright — Accessibility Audit

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('product list page has no critical a11y violations', async ({ page }) => {
  await page.goto('/products')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])  // WCAG 2.1 AA
    .analyze()
  expect(results.violations).toEqual([])
})
```

---

## 5. Vitest Configuration

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',       // DOM APIs available in unit tests
    globals: true,              // describe/it/expect without importing
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/types/**', 'src/**/*.d.ts'],
      thresholds: {
        lines:   80,
        branches: 75,
        functions: 80,
      },
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
})
```

---

## 6. Interview Answers — Rehearse These

**"What is your testing strategy for a Vue feature?"**
> *"I follow a pyramid: unit tests for Zod schemas, mappers, and pure utilities with Vitest — these run in milliseconds and give me schema drift protection at the CMS boundary. Integration tests with Vue Test Utils cover component rendering and user events without a browser. E2E with Playwright covers 5–10 critical user journeys. I consciously avoid testing Vue reactivity internals — I test what the user sees, not how the framework tracks it."*

**"How do you test a composable?"**
> *"I instantiate the composable inside a Vitest test with `withSetup()` — a thin wrapper that calls `app.mount()` to give the composable a Vue lifecycle context. I then simulate events (online/offline, scroll) and assert the returned reactive state changes correctly."*

**"How do you test for accessibility?"**
> *"I integrate `@axe-core/playwright` in my E2E suite and run it against the WCAG 2.1 AA ruleset on every PR. For component-level accessibility I use `@testing-library/vue` which queries by ARIA role rather than CSS selectors — that forces me to write accessible markup to make the test queryable."*

**"What's your coverage target?"**
> *"80% line coverage as a floor, but coverage is a means not a goal. I'd rather have 60% coverage that tests critical paths correctly than 95% that only tests getters. I always prioritise: Zod schemas 100%, mappers 90%, utils 85%, components 70%."*
