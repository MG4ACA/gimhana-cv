# Vue Reactivity & Memory Management — Plain English Guide

> **Apadmi Interview Prep · Day 1**
> Written to be understood first, memorised second.
> Every technical term is explained in plain English before it is named.

---

## Before We Start — The One Big Idea

Vue's "reactivity" means one thing:

> **When your data changes, the screen automatically updates.**

You don't manually tell the HTML to refresh. Vue watches your data for you, and whenever something changes, it re-renders only the parts of the page that care about that change.

The whole of Section 1 and 2 is just explaining *how* Vue watches your data.

---

## 1. `ref` vs `shallowRef` — Explained Simply

### The Security Guard Analogy

Imagine your data is a building.

- **`ref`** hires a security guard for **every room in the building** — the lobby, every office, every drawer inside every desk. Any change anywhere is noticed immediately.
- **`shallowRef`** only puts a guard **at the front door**. If you swap the whole building for a new one, the guard notices. But changes happening inside the rooms? The guard doesn't know.

That's the entire difference.

---

### `ref` — The "Watch Everything" version

```ts
import { ref } from 'vue'

const user = ref({ name: 'Gimhana', scores: [10, 20, 30] })

// ✅ Vue notices this — a score was added deep inside
user.value.scores.push(40)

// ✅ Vue also notices this — the whole object was replaced
user.value = { name: 'New', scores: [] }
```

**What happens inside Vue (plain English):**

1. You call `ref({ name: 'Gimhana', scores: [...] })`.
2. Vue wraps your object in a special **middleman layer** (this is called a `Proxy` — more on that below).
3. Every time your code *reads* any property (`user.value.name`), the middleman makes a note: *"this part of the page is interested in `name`"*.
4. Every time your code *changes* any property (`user.value.name = 'New'`), the middleman shouts: *"Hey! `name` changed — everyone who was watching it, please re-render!"*

**What is a Proxy?**

A `Proxy` is JavaScript's built-in way to create a middleman. When you access or change a value, instead of going directly to the data, you go through the Proxy first. The Proxy can run extra code before passing it along.

Think of it like calling customer support instead of going directly to the engineer. The support line (Proxy) logs your call, then forwards it.

---

### `shallowRef` — The "Watch the Front Door Only" version

```ts
import { shallowRef } from 'vue'

const items = shallowRef<Product[]>([])

// ✅ Vue notices this — you replaced the whole array
items.value = newProductList

// ❌ Vue does NOT notice this — you changed something inside the array
items.value.push(newProduct) // The screen will NOT update
```

**What happens inside Vue (plain English):**

With `shallowRef`, Vue only watches whether `.value` itself gets replaced. It does NOT put the middleman (Proxy) on anything inside the value.

So if you have 5,000 products in the array, Vue is NOT watching each product. It just watches the array reference itself. This is much faster.

---

### Why does this matter for performance?

`ref` on a 5,000 item array means Vue creates 5,000+ middleman layers (Proxies) — one for every product, and one for every property on every product. Every time you scroll through the list, every single read goes through those layers.

`shallowRef` on a 5,000 item array means Vue creates **one** middleman layer — just the `.value` itself. Dramatically cheaper.

**The rule:** If you fetch a big list from an API and then *replace* it on the next fetch (never mutate individual items), use `shallowRef`.

---

### When to use which

| Situation | Use |
|---|---|
| Storing a number or string | `ref` |
| Storing a small object you update properties on | `ref` |
| Storing a big array from an API (you replace the whole array) | `shallowRef` |
| Storing a list of 1000+ items | `shallowRef` |
| Storing a DOM element reference (`ref="el"`) | `ref` |

---

## 2. How Vue Tracks What Needs to Update

### The "Subscription List" Analogy

Think of a newspaper. You subscribe to it. When a new edition comes out, the newspaper company knows to deliver it to you.

Vue's reactivity works the same way:
- When a component reads your data, it **subscribes** to that data.
- When that data changes, Vue **delivers an update** (re-renders) to every subscriber.

The technical names for this are:
- **track** = "add this component to the subscription list for this piece of data"
- **trigger** = "notify all subscribers that this data changed"

---

### Walking Through a Real Example

```ts
const count = ref(0)

// Somewhere in your template:
// <p>{{ count }}</p>
```

Here is what happens step by step:

**Step 1 — Component renders for the first time**

Vue runs your template. It hits `{{ count }}`, which reads `count.value`.

**Step 2 — The middleman (Proxy) intercepts the read**

Vue's middleman says: *"Someone just read `count.value`. I'll make a note that this component is interested in `count`."*

This is called **tracking**. Vue stores: *"Component X is watching `count`"* in an internal list.

**Step 3 — User does something that changes count**

```ts
count.value = 5
```

**Step 4 — The middleman intercepts the write**

Vue's middleman says: *"Someone just changed `count.value`. Let me check my list of subscribers... Component X is watching this. I'll tell Component X to re-render."*

This is called **triggering**.

---

### The "get trap" and "set trap" explained

You may see these terms in Vue's documentation:

- **"get trap"** = the middleman code that runs when you **read** a value. "Trap" just means "intercept" — it catches the read before it reaches the raw data.
- **"set trap"** = the middleman code that runs when you **write/change** a value. It catches the write and runs the trigger notification.

So when you see:
> "Every nested property access is intercepted by the get trap → calls track()"

It just means:
> "Every time your code reads a property, the middleman catches it and adds the component to the subscriber list."

And:
> "Every nested property mutation triggers the set trap → calls trigger()"

Just means:
> "Every time your code changes a property, the middleman catches it and notifies all the subscribers."

---

### The Internal Storage (WeakMap) — Plain English

Vue stores its subscription lists like this:

```
For each piece of data (the object) →
  For each property on that object (the key) →
    Store a list of all the components watching it (the subscribers)
```

Vue uses a special kind of storage called a `WeakMap` for this. The key reason: if your component gets destroyed (user navigates away), the `WeakMap` automatically removes it from the subscription list. You don't have to do anything manually — it cleans itself up.

This is important for memory. If Vue used a normal object/array to store subscriptions, destroyed components would stay in that list forever, leaking memory. `WeakMap` prevents this.

---

### `trackRefValue` and `triggerRefValue` — What are these?

These are just **internal function names inside Vue's source code**. You will never call them yourself.

- `trackRefValue` = the function Vue calls internally when you *read* `.value` on a `ref` or `shallowRef`
- `triggerRefValue` = the function Vue calls internally when you *write* `.value` on a `ref` or `shallowRef`

For `shallowRef`, these are the **only** functions called. Vue tracks the `.value` reference itself, nothing inside it.

For `ref`, Vue calls these AND also applies a full Proxy to the inner object, which runs track/trigger on every nested property too.

**You don't need to remember the function names.** You just need to understand the behaviour:

| | When does Vue notice a change? |
|---|---|
| `ref` | Any change, anywhere inside the value |
| `shallowRef` | Only when `.value` itself is replaced |

---

### `RefImpl class` — What is this?

A `class` in JavaScript is just a template for creating an object with some built-in behaviour.

When you call `ref(42)`, Vue creates a small internal object (from the `RefImpl` class blueprint) that:
- Stores your value internally
- Runs `trackRefValue` when you read `.value`
- Runs `triggerRefValue` when you write `.value`

When you call `shallowRef(42)`, Vue creates the same kind of object, but without attaching a deep Proxy to the inner value.

**You never interact with `RefImpl` directly.** You only ever interact with `.value`. It's just Vue's internal machinery.

**Interview tip**: You don't need to say "RefImpl" in an interview. You can just say: *"Internally, `ref` creates a wrapper object that intercepts reads and writes to `.value` and notifies any watching components."*

---

### `baseHandlers` — What is this?

`baseHandlers` is a piece of code inside Vue's source that **defines what the Proxy middleman does** — specifically what happens on a read (get) and what happens on a write (set).

You will never see or touch `baseHandlers` in your own code. It's an internal implementation detail of Vue's reactivity library.

**Interview tip**: Don't mention `baseHandlers` at all. Just say *"Vue applies a Proxy to the object that intercepts reads and writes."*

---

## 3. `computed` — Plain English

```ts
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
```

**What does it do?**

`computed` creates a value that is automatically **calculated from other reactive values**.

**Two important behaviours:**

**1. Lazy** — It doesn't run the calculation until something actually reads `fullName.value`. If nothing needs it, it doesn't run.

**2. Cached** — Once it runs, Vue caches (stores) the result. If you read `fullName.value` 100 times without `firstName` or `lastName` changing, Vue just returns the cached result — it doesn't re-run the function 100 times.

When `firstName` or `lastName` changes, Vue marks the cache as stale (using an internal flag called `_dirty`). Next time something reads `fullName.value`, it re-runs the function and caches the new result.

---

## 4. `watch` vs `watchEffect` — Plain English

Both let you **run side effects when data changes** (e.g., make an API call, log something).

### `watchEffect` — "Run this, and watch whatever it reads"

```ts
watchEffect(() => {
  console.log(user.value.name) // automatically watches user.value.name
})
```

Vue runs the function immediately. While it runs, Vue notes down every piece of reactive data that was read. Whenever any of that data changes, Vue re-runs the function.

You don't have to tell Vue what to watch — it figures it out automatically.

### `watch` — "Watch this specific thing, then run code"

```ts
watch(
  () => user.value.name,      // ← you explicitly say WHAT to watch
  (newName, oldName) => {     // ← runs when it changes, gives you old AND new value
    console.log(`Changed from ${oldName} to ${newName}`)
  }
)
```

You tell Vue exactly what to watch. Vue only runs the callback when that specific thing changes. Bonus: you get the old value and the new value, which `watchEffect` doesn't give you.

### Which to use?

| | `watchEffect` | `watch` |
|---|---|---|
| You know exactly what to watch | ❌ (auto-tracks) | ✅ explicit source |
| You need the old value | ❌ | ✅ |
| You want it to run immediately | ✅ (always does) | Only with `{ immediate: true }` |
| Best for | Logging, syncing, simple reactions | API calls triggered by a specific value changing |

---

## 5. Memory Leaks — Explained Simply

### What is a memory leak?

**Memory leak** = your code keeps a reference to something it no longer needs, so the browser can't throw it away and reclaim that RAM.

In a regular website, every time you navigate to a new page, the browser throws away the old page's JavaScript completely. Clean slate.

In a **Single Page App (SPA)** like a Vue app, you never do a full page reload. You stay on the same JavaScript environment. Old components are "unmounted" (removed from screen) but if your code still holds references to them, they can't be garbage collected. The memory builds up over time — especially bad on mobile phones with limited RAM.

---

### Why Event Listeners Are the Biggest Culprit

```ts
// ❌ LEAKS MEMORY

onMounted(() => {
  window.addEventListener('resize', () => {
    // This function can access the component's data
    console.log(someReactiveData.value)
  })
  // Problem: when the component is destroyed, window still holds a reference
  // to this function. The function holds a reference to the component's data.
  // Result: the component cannot be garbage collected. Ever.
})
```

**The chain that causes the leak:**

```
window → holds the listener function
listener function → holds a reference to the component's data (via closure)
component's data → keeps the whole component alive
Result → Component stays in memory even though it's off-screen
```

```ts
// ✅ FIXED — no leak

const handleResize = () => {
  console.log(someReactiveData.value)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // When the component is destroyed, we remove the listener.
  // window no longer holds a reference. Component can be garbage collected.
  window.removeEventListener('resize', handleResize)
})
```

---

### The 5 Things You Must Always Clean Up

| What you create in `onMounted` | What you must do in `onUnmounted` |
|---|---|
| `window.addEventListener('resize', fn)` | `window.removeEventListener('resize', fn)` |
| `setInterval(fn, 1000)` | `clearInterval(intervalId)` |
| `fetch(url, { signal: controller.signal })` | `controller.abort()` |
| `new IntersectionObserver(cb).observe(el)` | `observer.disconnect()` |
| `store.$subscribe(callback)` | Call the returned `unsubscribe()` function |

---

### Why `onUnmounted` Is the Right Place

`onUnmounted` is a Vue lifecycle hook — a function Vue automatically calls when a component is removed from the screen. It's the guaranteed moment where you know the component is done and will never be shown again. It's the correct place to do all cleanup.

**The golden rule**: If you create something in `onMounted`, destroy it in `onUnmounted`.

---

### The Reusable Composable Pattern (Best Practice)

Instead of writing `addEventListener` + `removeEventListener` in every component, you can write a composable that handles the lifecycle automatically:

```ts
// composables/useEventListener.ts

import { onMounted, onUnmounted } from 'vue'

export function useEventListener(target, event, handler) {
  // Automatically adds the listener when the component mounts
  onMounted(() => target.addEventListener(event, handler))

  // Automatically removes it when the component is destroyed
  onUnmounted(() => target.removeEventListener(event, handler))
}

// Usage — one line, no manual cleanup needed:
useEventListener(window, 'resize', handleResize)
```

This works because `onMounted` and `onUnmounted` are **lifecycle-aware** — when you call them inside a composable that is called from inside a component's `setup()`, they attach to **that component's lifecycle**. So cleanup happens automatically when that component is destroyed.

---

## 6. Interview Soundbites — Say These, Word For Word

**On `ref` vs `shallowRef`:**
> *"With `ref`, Vue puts a middleman on every property of your object — any change anywhere triggers an update. With `shallowRef`, Vue only watches the `.value` reference itself. If I'm storing a large array from an API that I replace wholesale on every fetch, `shallowRef` is significantly cheaper because Vue isn't deep-watching 5,000 objects."*

**On how Vue tracks reactivity:**
> *"Vue wraps your reactive data in a Proxy — a JavaScript middleman. When your component reads a reactive value, the Proxy notes down that the component is interested. When the value changes, the Proxy notifies all the components that were watching. Vue stores this subscription list in a `WeakMap`, which means when a component is destroyed, it's automatically removed from the list — no manual cleanup needed for the reactivity system itself."*

**On memory leaks:**
> *"The most common memory leak I've seen in Vue SPAs is an event listener added in `onMounted` without a matching `removeEventListener` in `onUnmounted`. In a SPA, `window` lives forever — if a component adds a listener and is then destroyed without removing it, the listener keeps the entire component in memory. I always write cleanup in `onUnmounted` as my first step, before writing the `onMounted` logic."*
