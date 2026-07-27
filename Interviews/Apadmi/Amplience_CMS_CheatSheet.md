# Amplience CMS — Interview Cheat Sheet

> **Why this matters**: Apadmi explicitly names Amplience in the JD.
> Amplience is a **UK-founded headless commerce CMS** used by major retail and fashion brands
> (Coop, Argos, N Brown, The Very Group). Apadmi serves similar clients.

---

## 1. What Is Amplience?

Amplience is a **headless CMS** (Content Management System) built specifically for **retail and e-commerce** websites. Think of it like this:

> 🏪 **Real-world analogy:**
> A shop editor (non-technical person) logs into a nice UI to update a homepage banner —
> they write the text, pick the image, set the dates.
> Amplience stores that content.
> Your Vue app then **fetches it via an API** and displays it.
> The editor never touches your code. Your code never touches their UI.

This separation is called **"headless"** — the CMS has no fixed frontend (no "head"). You bring your own.

---

### The 4 Layers of Amplience

#### 🖊️ Layer 1 — Authoring (Dynamic Content)
- The **editor UI** where content teams create and manage content (banners, product pages, campaigns)
- Think of it like a Google Docs for retail content — text, images, scheduling
- **You as a FE dev don't build this.** The client's marketing team uses it
- You only care about the *shape* of the data it produces (the JSON schema)

#### 🚀 Layer 2 — Delivery (Content Delivery API) ← **Your main concern**
- A **CDN-backed REST API** that serves the content your app fetches
- Fast, cached, no auth needed for public content
- You call it like any other API: `fetch('https://c1.adis.ws/v1/content/...')`
- Returns JSON that your Vue component renders

#### 🖼️ Layer 3 — Media (Dynamic Media)
- Amplience hosts images and serves them via CDN URLs
- You can transform images **on the fly using query params** — no server needed:
  ```
  https://i1.adis.ws/i/your-hub/hero-banner?w=800&h=400&fmt=webp&qlt=80
  ```
  - `w=800` → resize to 800px wide
  - `fmt=webp` → convert to WebP automatically
  - `qlt=80` → 80% quality (balance size vs clarity)
- Perfect for responsive images — same source URL, different params per breakpoint

#### 🤖 Layer 4 — AI (Amplience AI)
- Auto-tags images, suggests content variants, helps editors work faster
- Not something you integrate directly — useful as an **interview talking point**
- Shows you know Amplience is modern and AI-aware

---

### Summary Table

| Layer | Amplience Component | Your concern as FE dev |
|---|---|---|
| **Authoring** | Dynamic Content (rich UI for editors) | You don't build this — clients use it |
| **Delivery** | Content Delivery API (CDN-backed REST) | **This is what you integrate against** |
| **Media** | Dynamic Media (image transformation) | CDN image URLs with query-param transforms |
| **AI** | Amplience AI (auto-tagging, content variants) | Talking point — shows awareness |



---

## 2. Content Delivery API — How It Works

### Base URL Pattern
```
https://c1.adis.ws/v1/content/{hub-name}/
```

### Fetch Content by ID (most common)
```ts
// src/composables/useAmplience.ts
import { shallowRef, ref } from 'vue'
import { AmplienceContentSchema } from '@/schemas/amplience.schema'

const AMPLIENCE_BASE = 'https://c1.adis.ws/v1/content'
const HUB_NAME = 'your-hub-name'  // set per client, usually in .env

export function useAmplience<T>(contentId: string) {
  const content  = shallowRef<T | null>(null)
  const isLoading = ref(false)
  const error    = ref<string | null>(null)

  async function fetchContent(): Promise<void> {
    isLoading.value = true
    try {
      const res = await fetch(
        `${AMPLIENCE_BASE}/${HUB_NAME}/${contentId}?depth=all&format=inlined`
      )
      if (!res.ok) throw new Error(`Amplience HTTP ${res.status}`)
      const raw = await res.json()

      // Runtime validate with Zod at the CMS boundary
      const parsed = AmplienceContentSchema.safeParse(raw)
      if (!parsed.success) {
        console.error('[Amplience] Schema mismatch:', parsed.error.flatten())
        return
      }
      content.value = parsed.data as T
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      isLoading.value = false
    }
  }

  return { content, isLoading, error, fetchContent }
}
```

### Key Query Parameters

| Param | Value | Effect |
|---|---|---|
| `depth` | `all` | Inline all linked content (avoids N+1 fetches) |
| `format` | `inlined` | Flatten linked content refs inline |
| `locale` | `en-GB` | Localisation (important for UK clients) |
| `stagingEnvironment` | `staging-id` | Preview unpublished content |

---

## 3. Amplience Dynamic Media — Image CDN

Amplience serves images via a CDN URL with **query-param transformations** — no separate image server required:

```
https://i1.adis.ws/i/{hub}/{image-name}
  ?w=400          ← width
  &h=300          ← height
  &fmt=webp       ← format
  &qlt=80         ← quality (0–100)
  &sm=c           ← scale mode: c=crop, s=stretch, etc.
```

### Vue component integration with `srcset`:
```html
<img
  :src="`https://i1.adis.ws/i/${hub}/${image}?w=400&fmt=webp&qlt=80`"
  :srcset="`
    https://i1.adis.ws/i/${hub}/${image}?w=400&fmt=webp&qlt=80 400w,
    https://i1.adis.ws/i/${hub}/${image}?w=800&fmt=webp&qlt=80 800w
  `"
  sizes="(max-width: 640px) 400px, 800px"
  loading="lazy"
  decoding="async"
  :alt="product.altText"
/>
```
> **Key point**: Amplience images are already on a CDN — you just manipulate the URL. No upload step needed from Vue.

---

## 4. Content Modelling Concepts

Amplience editors build **Content Types** (schemas) in their UI. As a FE dev you receive JSON that reflects these schemas. Key concepts to know:

| Term | Meaning |
|---|---|
| **Content Type** | A structured schema (like a "Product Banner" or "Hero Slot") |
| **Content Item** | An instance of a Content Type, with actual data |
| **Slot** | A container on a page that holds one or more Content Items |
| **Hierarchy** | Content Items can be linked/nested (fetch with `depth=all` to avoid N+1) |
| **Visualisation** | Live preview of Vue component inside Amplience authoring UI |

---

## 5. Amplience SDK (Optional — Know It Exists)

Amplience provides an official JS SDK:
```ts
import { ContentClient } from 'dc-delivery-sdk-js'

const client = new ContentClient({ hubName: 'your-hub-name' })
const content = await client.getContentItemById('content-id')
```
> **Interview framing**: "I'd use the SDK in a Nuxt server route as a BFF to avoid exposing hub credentials to the client, then serve the parsed, validated response to the Vue frontend."

---

## 6. Your Velou Bridge — How to Frame It

**Reality**: At Velou you did NOT use Amplience — you used internal Koa.js APIs for product attribute data.
**Frame it honestly and confidently**:

> *"I haven't worked directly with Amplience's authoring UI, but I've integrated against headless content APIs in production — fetching typed product catalogue data, validating payloads at the API boundary with Zod, and mapping CMS-shaped objects to frontend types using a dedicated mapper layer. At Velou, our product attribute data came from high-throughput internal APIs rather than a CMS, but the integration pattern is identical: fetch → validate schema → map to frontend type → surface reactively in Vue. Amplience's delivery API is REST + JSON — I'd apply the same approach."*

**Why this works**: You're demonstrating the underlying engineering skill (API boundary validation, mapper layer, reactive consumption) which transfers directly. Amplience itself is a 2-hour learning curve once you understand the pattern.

---

## 7. Interview Questions to Expect

| Question | Key points in your answer |
|---|---|
| "Have you used Amplience before?" | Be honest — "not directly, but here's the adjacent experience…" (use bridge above) |
| "How would you handle a CMS content type change in production?" | Zod `.safeParse()` at fetch boundary, fallback to safe defaults, log schema drift to monitoring |
| "How do you preview unpublished Amplience content?" | `?stagingEnvironment=` param + Nuxt preview mode (`usePreviewMode()`) |
| "How do you handle Amplience image performance?" | Dynamic Media CDN URL params + `srcset` + `loading="lazy"` + WebP format |
