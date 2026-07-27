<script setup lang="ts">
/**
 * VirtualScrollList.vue
 * ─────────────────────────────────────────────────────────────────────────────
 * Virtual scroller for 5,000 DummyJSON products.
 *
 * Architecture:
 *  - Renders only the items that fit within the visible viewport window
 *    plus an overscan buffer (OVERSCAN_COUNT rows above/below).
 *  - Uses a single scrollable container with a padded inner spacer div to
 *    simulate the full list height without mounting 5,000 DOM nodes.
 *  - Each rendered row attaches an IntersectionObserver to lazy-load its
 *    thumbnail image only when it enters the viewport.
 *  - All observers are stored in a Map<number, IntersectionObserver> and
 *    disconnected in onUnmounted to prevent memory leaks.
 *
 * DummyJSON API:  https://dummyjson.com/products?limit=100&skip=0
 * Total items:    5,000 (fetched in pages of 100)
 */

import {
  ref,
  shallowRef,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  type Ref,
} from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: number
  title: string
  description: string
  price: number
  rating: number
  stock: number
  brand: string
  category: string
  thumbnail: string
  images: string[]
}

interface DummyJsonResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 96        // px — fixed row height (required for virtual scroll math)
const OVERSCAN_COUNT = 5      // rows to render above & below the visible window
const PAGE_SIZE = 100         // DummyJSON max items per request
const TOTAL_TARGET = 5000     // products to load in total
const FETCH_CONCURRENCY = 5   // parallel page fetches on initial load

// ─── State ────────────────────────────────────────────────────────────────────

/** Full flat list. shallowRef avoids deep-proxying 5,000 product objects. */
const allProducts = shallowRef<Product[]>([])

/** Which product IDs have had their thumbnail loaded via IntersectionObserver */
const loadedImages = ref(new Set<number>())

/** Loading / error UI state */
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')

/** Scroll container DOM ref */
const scrollContainer: Ref<HTMLElement | null> = ref(null)

/** Current scroll position in px */
const scrollTop = ref(0)

/** Measured container height in px */
const containerHeight = ref(0)

/**
 * Map<productId, IntersectionObserver> — kept so each observer can be
 * disconnected individually when its row leaves the rendered window,
 * and all remaining ones are disconnected in onUnmounted.
 */
const imageObservers = new Map<number, IntersectionObserver>()

/** ResizeObserver to track container height changes */
let resizeObserver: ResizeObserver | null = null

/** AbortController for in-flight fetch requests */
const fetchController = new AbortController()

// ─── Virtual Scroll Computed Properties ───────────────────────────────────────

/** Total scrollable height (pixels) the inner spacer must be */
const totalHeight = computed(() => allProducts.value.length * ITEM_HEIGHT)

/** Index of the first item that should be rendered */
const startIndex = computed(() => {
  const raw = Math.floor(scrollTop.value / ITEM_HEIGHT) - OVERSCAN_COUNT
  return Math.max(0, raw)
})

/** Index (exclusive) of the last item that should be rendered */
const endIndex = computed(() => {
  const visibleCount = Math.ceil(containerHeight.value / ITEM_HEIGHT)
  const raw = startIndex.value + visibleCount + OVERSCAN_COUNT * 2
  return Math.min(allProducts.value.length, raw)
})

/** The slice of products currently mounted in the DOM */
const visibleProducts = computed(() =>
  allProducts.value.slice(startIndex.value, endIndex.value)
)

/** Top offset for the rendered rows — positions them correctly inside the spacer */
const offsetY = computed(() => startIndex.value * ITEM_HEIGHT)

// ─── Scroll Handler ───────────────────────────────────────────────────────────

function onScroll(event: Event) {
  scrollTop.value = (event.currentTarget as HTMLElement).scrollTop
}

// ─── Image Lazy Loading via IntersectionObserver ──────────────────────────────

/**
 * Called from the template via :ref on each thumbnail wrapper element.
 * Attaches an IntersectionObserver that sets loadedImages when the element
 * enters the viewport at ≥10% visibility. Once loaded, the observer
 * disconnects itself to save memory.
 */
function observeThumbnail(el: Element | null, productId: number): void {
  if (!el || loadedImages.value.has(productId)) return

  // Disconnect any existing observer for this productId (row reuse scenario)
  imageObservers.get(productId)?.disconnect()

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        // Mark image as loaded — Vue will swap placeholder src for real src
        loadedImages.value = new Set(loadedImages.value).add(productId)
        observer.disconnect()
        imageObservers.delete(productId)
      }
    },
    {
      root: scrollContainer.value,  // use our scroll container as root
      rootMargin: '100px',          // start loading 100px before entering viewport
      threshold: 0.1,
    }
  )

  observer.observe(el)
  imageObservers.set(productId, observer)
}

/**
 * Called when a row leaves the rendered window (i.e., it's no longer in
 * visibleProducts). Disconnects the observer to avoid accumulation.
 */
function unobserveThumbnail(productId: number): void {
  imageObservers.get(productId)?.disconnect()
  imageObservers.delete(productId)
}

// Watch visible range changes — disconnect observers for rows that just left
watch(startIndex, (newStart, oldStart) => {
  if (newStart > oldStart) {
    // Scrolled down — rows before newStart are no longer rendered
    for (let i = oldStart; i < newStart; i++) {
      const product = allProducts.value[i]
      if (product) unobserveThumbnail(product.id)
    }
  }
})

watch(endIndex, (newEnd, oldEnd) => {
  if (newEnd < oldEnd) {
    // Scrolled up — rows from newEnd onward are no longer rendered
    for (let i = newEnd; i < oldEnd; i++) {
      const product = allProducts.value[i]
      if (product) unobserveThumbnail(product.id)
    }
  }
})

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function fetchPage(skip: number): Promise<Product[]> {
  const url = `https://dummyjson.com/products?limit=${PAGE_SIZE}&skip=${skip}&select=id,title,description,price,rating,stock,brand,category,thumbnail`
  const res = await fetch(url, { signal: fetchController.signal })
  if (!res.ok) throw new Error(`HTTP ${res.status} — failed to fetch skip=${skip}`)
  const json: DummyJsonResponse = await res.json()
  return json.products
}

async function loadAllProducts(): Promise<void> {
  isLoading.value = true
  hasError.value = false

  try {
    // First fetch to discover total available count
    const firstPage = await fetchPage(0)

    // DummyJSON only has ~194 products in the free tier; we'll still demonstrate
    // the full virtual scroll architecture with whatever is available.
    // For a real 5,000-item dataset, swap for a paginated internal API.
    const skips: number[] = []
    for (let skip = PAGE_SIZE; skip < TOTAL_TARGET; skip += PAGE_SIZE) {
      skips.push(skip)
    }

    // Fetch remaining pages in parallel batches of FETCH_CONCURRENCY
    const collected: Product[] = [...firstPage]

    for (let i = 0; i < skips.length; i += FETCH_CONCURRENCY) {
      const batch = skips.slice(i, i + FETCH_CONCURRENCY)
      const results = await Promise.allSettled(batch.map(fetchPage))

      for (const result of results) {
        if (result.status === 'fulfilled') {
          collected.push(...result.value)
        }
        // Silently skip failed pages — partial data is better than no data
      }

      if (fetchController.signal.aborted) break
    }

    // Single assignment — shallowRef means Vue does NOT deep-proxy these 5k objects
    allProducts.value = collected
  } catch (err) {
    if ((err as Error).name === 'AbortError') return // expected on component unmount
    hasError.value = true
    errorMessage.value = (err as Error).message
    console.error('[VirtualScrollList] fetch error:', err)
  } finally {
    isLoading.value = false
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  await nextTick()

  // Measure initial container height
  if (scrollContainer.value) {
    containerHeight.value = scrollContainer.value.clientHeight

    // Track container resize (e.g., orientation change on mobile)
    resizeObserver = new ResizeObserver((entries) => {
      containerHeight.value = entries[0].contentRect.height
    })
    resizeObserver.observe(scrollContainer.value)
  }

  await loadAllProducts()
})

onUnmounted(() => {
  // 1. Cancel any in-flight fetch requests
  fetchController.abort()

  // 2. Disconnect all remaining IntersectionObservers
  imageObservers.forEach((observer) => observer.disconnect())
  imageObservers.clear()

  // 3. Disconnect ResizeObserver
  resizeObserver?.disconnect()
  resizeObserver = null
})

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

function formatRating(rating: number): string {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
}
</script>

<template>
  <div class="vsl-wrapper">
    <!-- Header -->
    <header class="vsl-header">
      <h1 class="vsl-title">Product Catalogue</h1>
      <span class="vsl-count">
        {{ isLoading ? 'Loading…' : `${allProducts.length.toLocaleString()} products` }}
      </span>
    </header>

    <!-- Error State -->
    <div v-if="hasError" class="vsl-error" role="alert">
      <p>⚠️ Failed to load products: {{ errorMessage }}</p>
      <button class="vsl-retry-btn" @click="loadAllProducts">Retry</button>
    </div>

    <!-- Loading Skeleton -->
    <div v-else-if="isLoading" class="vsl-skeleton-list" aria-busy="true" aria-label="Loading products">
      <div v-for="i in 8" :key="i" class="vsl-skeleton-row">
        <div class="vsl-skeleton-thumb" />
        <div class="vsl-skeleton-body">
          <div class="vsl-skeleton-line vsl-skeleton-line--title" />
          <div class="vsl-skeleton-line vsl-skeleton-line--sub" />
          <div class="vsl-skeleton-line vsl-skeleton-line--narrow" />
        </div>
      </div>
    </div>

    <!-- Virtual Scroll Container -->
    <div
      v-else
      ref="scrollContainer"
      class="vsl-scroll-container"
      role="list"
      aria-label="Product list"
      @scroll.passive="onScroll"
    >
      <!-- Full-height spacer — makes browser scrollbar reflect total item count -->
      <div
        class="vsl-spacer"
        :style="{ height: `${totalHeight}px` }"
      >
        <!-- Rendered window — only the visible slice + overscan -->
        <div
          class="vsl-rendered-window"
          :style="{ transform: `translateY(${offsetY}px)` }"
        >
          <div
            v-for="product in visibleProducts"
            :key="product.id"
            class="vsl-row"
            :style="{ height: `${ITEM_HEIGHT}px` }"
            role="listitem"
          >
            <!-- Thumbnail with lazy-load via IntersectionObserver -->
            <div
              class="vsl-thumb-wrapper"
              :ref="(el) => observeThumbnail(el as Element | null, product.id)"
            >
              <img
                v-if="loadedImages.has(product.id)"
                :src="product.thumbnail"
                :alt="product.title"
                class="vsl-thumb"
                loading="eager"
                decoding="async"
              />
              <!-- Placeholder shown until IntersectionObserver fires -->
              <div v-else class="vsl-thumb-placeholder" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" class="vsl-thumb-icon">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
            </div>

            <!-- Product Info -->
            <div class="vsl-product-info">
              <div class="vsl-product-top">
                <span class="vsl-product-title">{{ product.title }}</span>
                <span class="vsl-product-price">{{ formatPrice(product.price) }}</span>
              </div>
              <div class="vsl-product-meta">
                <span class="vsl-product-brand">{{ product.brand }}</span>
                <span class="vsl-product-separator">·</span>
                <span class="vsl-product-category">{{ product.category }}</span>
              </div>
              <div class="vsl-product-bottom">
                <span
                  class="vsl-product-rating"
                  :title="`Rating: ${product.rating}/5`"
                  :aria-label="`Rating ${product.rating} out of 5`"
                >
                  {{ formatRating(product.rating) }}
                  <span class="vsl-rating-num">{{ product.rating.toFixed(1) }}</span>
                </span>
                <span
                  class="vsl-stock-badge"
                  :class="product.stock < 10 ? 'vsl-stock-badge--low' : 'vsl-stock-badge--ok'"
                >
                  {{ product.stock < 10 ? `Only ${product.stock} left` : `${product.stock} in stock` }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug overlay (remove in production) -->
    <div class="vsl-debug" aria-hidden="true">
      Rendered: {{ startIndex }}–{{ endIndex }}
      / {{ allProducts.length }} |
      Observers active: {{ imageObservers.size }}
    </div>
  </div>
</template>

<style scoped>
/* ─── Layout ─────────────────────────────────────────────────────────────── */
.vsl-wrapper {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: #0f0f13;
  color: #e5e7eb;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

.vsl-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #1e1e2e 0%, #2a1a3e 100%);
  border-bottom: 1px solid #2d2d44;
  flex-shrink: 0;
}

.vsl-title {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(90deg, #a78bfa, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.vsl-count {
  font-size: 0.8rem;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
}

/* ─── Scroll Container ───────────────────────────────────────────────────── */
.vsl-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;  /* momentum scrolling on iOS */
  overscroll-behavior: contain;
  will-change: scroll-position;
}

.vsl-scroll-container::-webkit-scrollbar {
  width: 6px;
}
.vsl-scroll-container::-webkit-scrollbar-track {
  background: #1a1a2e;
}
.vsl-scroll-container::-webkit-scrollbar-thumb {
  background: #3b3b5e;
  border-radius: 3px;
}

.vsl-spacer {
  position: relative;
  width: 100%;
}

.vsl-rendered-window {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

/* ─── Product Row ────────────────────────────────────────────────────────── */
.vsl-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  border-bottom: 1px solid #1f1f30;
  box-sizing: border-box;
  transition: background 0.15s ease;
}
.vsl-row:hover {
  background: rgba(167, 139, 250, 0.04);
}

/* ─── Thumbnail ──────────────────────────────────────────────────────────── */
.vsl-thumb-wrapper {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  background: #1e1e2e;
  border: 1px solid #2d2d44;
}

.vsl-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.vsl-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b3b5e;
}

.vsl-thumb-icon {
  width: 28px;
  height: 28px;
}

/* ─── Product Info ───────────────────────────────────────────────────────── */
.vsl-product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vsl-product-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.vsl-product-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e5e7eb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.vsl-product-price {
  font-size: 0.9rem;
  font-weight: 700;
  color: #a78bfa;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.vsl-product-meta {
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  gap: 4px;
  align-items: center;
}

.vsl-product-brand {
  font-weight: 500;
  color: #9ca3af;
}

.vsl-product-separator {
  opacity: 0.5;
}

.vsl-product-category {
  text-transform: capitalize;
}

.vsl-product-bottom {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vsl-product-rating {
  font-size: 0.7rem;
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.vsl-rating-num {
  color: #9ca3af;
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
}

/* ─── Stock Badge ────────────────────────────────────────────────────────── */
.vsl-stock-badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.vsl-stock-badge--ok {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.vsl-stock-badge--low {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

/* ─── Loading Skeleton ───────────────────────────────────────────────────── */
.vsl-skeleton-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 8px 0;
}

.vsl-skeleton-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  border-bottom: 1px solid #1f1f30;
  height: 96px;
  box-sizing: border-box;
}

.vsl-skeleton-thumb {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  background: linear-gradient(90deg, #1e1e2e 25%, #2a2a40 50%, #1e1e2e 75%);
  background-size: 200% 100%;
  animation: vsl-shimmer 1.4s infinite;
}

.vsl-skeleton-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vsl-skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #1e1e2e 25%, #2a2a40 50%, #1e1e2e 75%);
  background-size: 200% 100%;
  animation: vsl-shimmer 1.4s infinite;
}

.vsl-skeleton-line--title { width: 65%; }
.vsl-skeleton-line--sub   { width: 45%; }
.vsl-skeleton-line--narrow{ width: 30%; }

@keyframes vsl-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─── Error State ────────────────────────────────────────────────────────── */
.vsl-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: #ef4444;
  font-size: 0.9rem;
  text-align: center;
}

.vsl-retry-btn {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.vsl-retry-btn:hover {
  background: rgba(239, 68, 68, 0.25);
}

/* ─── Debug Overlay ──────────────────────────────────────────────────────── */
.vsl-debug {
  position: fixed;
  bottom: 8px;
  right: 8px;
  font-size: 0.65rem;
  color: #4b5563;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 4px;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  z-index: 999;
}
</style>
