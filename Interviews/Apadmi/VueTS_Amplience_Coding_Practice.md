# Vue 3 + TypeScript + Amplience — Coding Practice

> **Format**: Each exercise has a task, hints, and a solution.
> Try writing the code yourself first. Only look at the solution after you've attempted it.
> Plain English explanations included — beginner-friendly.

---

## 🧩 What is a Composable?

A **composable** is just a **reusable function** that contains Vue reactive logic.

> 🔧 **Real-world analogy:**
> Imagine you need a "fetch data + track loading + track errors" mechanism in 10 different components.
> Instead of copy-pasting the same `ref`, `fetch`, and `try/catch` code into every component —
> you put it all in **one function** (the composable) and just call that function wherever you need it.

The name always starts with `use` by convention — `useAmplience`, `useFetch`, `useUser`, etc.

---

### Without a composable (repetitive 😩)

```vue
<!-- ComponentA.vue -->
<script setup>
const content = ref(null)
const isLoading = ref(false)
// same fetch logic copy-pasted...
</script>

<!-- ComponentB.vue -->
<script setup>
const content = ref(null)
const isLoading = ref(false)
// same fetch logic copy-pasted again...
</script>
```

### With a composable (clean ✅)

```ts
// src/composables/useAmplience.ts  — written ONCE
export function useAmplience(contentId) {
  const content = ref(null)
  const isLoading = ref(false)
  // fetch logic here...
  return { content, isLoading, fetchContent }
}
```

```vue
<!-- ComponentA.vue — just call the function -->
<script setup>
const { content, isLoading, fetchContent } = useAmplience('banner-id')
</script>

<!-- ComponentB.vue — same, no duplication -->
<script setup>
const { content, isLoading, fetchContent } = useAmplience('hero-id')
</script>
```

> **Rule of thumb**: If you find yourself writing the same reactive logic in more than one component → put it in a composable.

---

## Exercise 1 — The Basic Composable

### 🎯 What we're building

We're creating the **brain** of our Amplience integration — a reusable function called `useAmplience`.
It will handle the job of calling the Amplience API and tracking whether we're waiting for a response or not.
This function will be used by our Vue components later — they just call it, they don't need to know *how* it fetches.

Think of it like a TV remote: the component (TV) just calls `fetchContent()`, and the composable does all the work behind the scenes.

### 📋 Task

Create a composable called `useAmplience` in `src/composables/useAmplience.ts`.

It should:
1. Accept a `contentId: string` parameter
2. Have a `content` state — starts as `null`
3. Have an `isLoading` state — starts as `false`
4. Have a `fetchContent` async function that:
   - Sets `isLoading` to `true`
   - Fetches: `https://c1.adis.ws/v1/content/demo-hub/{contentId}`
   - Stores the JSON response in `content`
   - Sets `isLoading` back to `false` (always — even if it fails)
5. Returns `{ content, isLoading, fetchContent }`

---

### 💡 Hints

- Use `ref()` for reactive state
- Use `async function` for the fetch call
- Use `try/finally` — the `finally` block always runs, even after an error

---

### ✍️ Your Attempt

```ts
// Write your attempt here before looking at the solution
```

---

### ✅ Solution

```ts
// src/composables/useAmplience.ts
import { ref } from 'vue'

export function useAmplience(contentId: string) {
  const content   = ref<unknown>(null)   // unknown = we don't know the shape yet
  const isLoading = ref(false)

  async function fetchContent(): Promise<void> {
    isLoading.value = true
    try {
      const res = await fetch(
        `https://c1.adis.ws/v1/content/demo-hub/${contentId}`
      )
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      content.value = await res.json()
    } finally {
      isLoading.value = false   // always resets, even if fetch failed
    }
  }

  return { content, isLoading, fetchContent }
}
```

**Key things to notice:**
- `ref<unknown>(null)` — we say "I don't know the shape yet" (we fix this in Exercise 2)
- `isLoading.value = true` — you always need `.value` to read/write a `ref` in script
- `finally` — runs whether the fetch succeeded or failed, so `isLoading` always resets
- No `isLoading.value = false` in `try` — cleaner to put it in `finally` once

---

## Exercise 2 — Add TypeScript Types

### 🎯 What we're building

Right now our composable uses `ref<unknown>(null)` — that means TypeScript has no idea what shape the data is.
We're going to **describe the exact shape** of the Amplience hero banner response using a TypeScript `type`.
Then we'll make the composable **smart enough** to accept any shape (using generics `<T>`) so it can be reused for any content type — banners, product cards, nav menus, etc.

After this exercise, TypeScript will autocomplete `content.value.title`, `content.value.ctaUrl`, etc. for you.

### 📋 Task

We fetched Amplience content but typed it as `unknown`. That's too loose.

The Amplience API returns JSON like this for a hero banner:

```json
{
  "content": {
    "_meta": { "schema": "https://example.com/hero-banner.json" },
    "title": "Summer Sale",
    "subtitle": "Up to 50% off",
    "ctaLabel": "Shop Now",
    "ctaUrl": "/sale",
    "imageUrl": "https://i1.adis.ws/i/demo/hero?w=1200"
  }
}
```

Your task:
1. Define a TypeScript `type` called `HeroBannerContent` that matches this shape
2. Update `useAmplience` to accept a **generic type parameter** `<T>`
3. Use `ref<T | null>(null)` so `content` is properly typed

---

### 💡 Hints

- A `type` for an object looks like: `type Foo = { bar: string }`
- Generics look like: `function useAmplience<T>(contentId: string)`
- `_meta` is a nested object — you'll need a nested type for it

---

### ✍️ Your Attempt

```ts
// Write your attempt here
```

---

### ✅ Solution

```ts
// src/schemas/amplience.schema.ts
type AmplienceMeta = {
  schema: string
}

export type HeroBannerContent = {
  _meta:     AmplienceMeta
  title:     string
  subtitle:  string
  ctaLabel:  string
  ctaUrl:    string
  imageUrl:  string
}
```

```ts
// src/composables/useAmplience.ts  (updated)
import { ref } from 'vue'

export function useAmplience<T>(contentId: string) {
  const content   = ref<T | null>(null)  // ✅ now typed properly
  const isLoading = ref(false)
  const error     = ref<string | null>(null)

  async function fetchContent(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(
        `https://c1.adis.ws/v1/content/demo-hub/${contentId}`
      )
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      const data = await res.json()
      content.value = data.content as T   // Amplience wraps content under 'content' key
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  return { content, isLoading, error, fetchContent }
}
```

**How to use it with the type:**
```ts
const { content, isLoading, fetchContent } = useAmplience<HeroBannerContent>('hero-banner-id')
// Now 'content.value' is typed as HeroBannerContent | null
// TypeScript will autocomplete content.value.title, .ctaLabel, etc.
```

**Key things to notice:**
- `<T>` is the generic — the caller decides the type
- `data.content as T` — we trust the shape matches (Zod would validate this in production)
- Added `error` state — good habit for any composable that fetches data

---

## Exercise 3 — Build the Vue Component

### 🎯 What we're building

Now we put the composable to work inside an actual Vue component — `HeroBanner.vue`.
This component will:
- Receive a `contentId` from its parent (via props)
- Automatically fetch the banner when the page loads
- Show **different things** depending on what's happening: loading spinner → error message → actual content

This is the standard pattern for any data-fetching component in Vue. Once you learn this pattern, you'll use it everywhere.

### 📋 Task

Create `src/components/HeroBanner.vue`.

It should:
1. Accept a `contentId: string` prop
2. Use the `useAmplience<HeroBannerContent>` composable
3. Call `fetchContent()` automatically when the component mounts
4. Show a **loading state** while fetching (simple `<p>Loading...</p>` is fine)
5. Show an **error message** if something went wrong
6. Show the banner content (title, subtitle, a CTA button) when loaded

---

### 💡 Hints

- `onMounted` hook runs code after the component appears on screen
- `v-if` / `v-else-if` / `v-else` for conditional rendering
- Props are defined with `defineProps<{ contentId: string }>()`
- Access composable state directly in the template: `isLoading`, `content`, `error`

---

### ✍️ Your Attempt

```vue
<!-- Write your attempt here -->
```

---

### ✅ Solution

```vue
<!-- src/components/HeroBanner.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useAmplience } from '@/composables/useAmplience'
import type { HeroBannerContent } from '@/schemas/amplience.schema'

const props = defineProps<{
  contentId: string
}>()

const { content, isLoading, error, fetchContent } =
  useAmplience<HeroBannerContent>(props.contentId)

onMounted(() => {
  fetchContent()   // fetch as soon as the component appears
})
</script>

<template>
  <!-- Loading state -->
  <div v-if="isLoading">
    <p>Loading banner...</p>
  </div>

  <!-- Error state -->
  <div v-else-if="error">
    <p>Failed to load banner: {{ error }}</p>
  </div>

  <!-- Content loaded -->
  <div v-else-if="content" class="hero-banner">
    <h1>{{ content.title }}</h1>
    <p>{{ content.subtitle }}</p>
    <a :href="content.ctaUrl">
      <button>{{ content.ctaLabel }}</button>
    </a>
  </div>

  <!-- Fallback (content is null but no error) -->
  <div v-else>
    <p>No content available.</p>
  </div>
</template>
```

**Key things to notice:**
- `v-if / v-else-if / v-else` — covers all 4 states: loading, error, content, nothing
- `onMounted` — fires once after the component renders for the first time
- `:href="content.ctaUrl"` — the `:` means it's a dynamic binding (evaluates JS)
- TypeScript gives you autocomplete on `content.title`, `content.ctaUrl` etc.

---

## Exercise 4 — Add a Loading Skeleton

### 🎯 What we're building

Currently the loading state just shows `<p>Loading banner...</p>` — that looks terrible in a real app.
We're going to replace it with a **skeleton screen** — grey animated placeholder blocks that roughly match the shape of the real content.
You've seen this on YouTube, LinkedIn, Airbnb — that shimmering grey effect while content loads.

This is a CSS-only technique (no JavaScript needed). It makes the app feel much faster and more polished.

### 📋 Task

Replace the plain `<p>Loading banner...</p>` with a styled **skeleton** (a grey placeholder block).

The skeleton should:
1. Be a `<div>` with a CSS class `skeleton`
2. Have an animated shimmer effect (CSS `@keyframes`)
3. Mimic the rough shape of the banner (a tall block for image, two smaller blocks for title/subtitle)

---

### 💡 Hints

- CSS `background: linear-gradient(...)` + `background-size` + `animation` creates the shimmer
- Use `<style scoped>` in your Vue SFC so styles don't leak out
- No JavaScript needed — pure CSS animation

---

### ✍️ Your Attempt

```vue
<!-- Write your attempt here -->
```

---

### ✅ Solution

```vue
<!-- Replace the loading block in HeroBanner.vue -->

<!-- Loading skeleton -->
<div v-if="isLoading" class="skeleton-wrapper">
  <div class="skeleton skeleton--image"></div>
  <div class="skeleton skeleton--title"></div>
  <div class="skeleton skeleton--subtitle"></div>
</div>
```

```css
/* Add to <style scoped> in HeroBanner.vue */

.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton {
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f0f0f0 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton--image    { height: 320px; width: 100%; }
.skeleton--title    { height: 32px;  width: 60%;  }
.skeleton--subtitle { height: 20px;  width: 40%;  }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Key things to notice:**
- `background-size: 200%` + `background-position` animation = shimmer moving left-to-right
- Each `.skeleton--*` class sets a different size to mimic the real content shape
- `scoped` means these CSS classes only apply inside this component

---

## Quick Recap — What You Practiced

| Concept | Where used |
|---|---|
| `ref()` for reactive state | `useAmplience` composable |
| Generic types `<T>` | `useAmplience<HeroBannerContent>()` |
| `async/await` + `try/finally` | `fetchContent()` function |
| `defineProps` with TypeScript | `HeroBanner.vue` |
| `onMounted` lifecycle hook | Auto-fetching on mount |
| `v-if / v-else-if / v-else` | Loading / error / content states |
| CSS skeleton animation | Loading shimmer effect |
| TypeScript `type` for API shape | `HeroBannerContent` |
