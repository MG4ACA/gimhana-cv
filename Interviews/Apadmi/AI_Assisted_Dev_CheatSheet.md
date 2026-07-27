# AI-Assisted Development — Interview Cheat Sheet

> **JD Requirement**: *"Experience with AI assisted software development, utilising the tooling
> to build secure, high quality solutions."*
> **Note the security caveat** — Apadmi cares HOW you use AI, not just that you use it.

---

## 1. The Position to Take in Interview

Apadmi is asking this because they've seen developers ship insecure or low-quality AI-generated code
without review. Your answer must signal **disciplined, security-aware AI usage** — not "I use Copilot
to write everything faster."

**Your headline**: *"AI is a senior pair-programmer, not an auto-pilot. I use it to accelerate
scaffolding and pattern application, but every output goes through the same review process as
human-written code — and I'm particularly vigilant about security-sensitive areas."*

---

## 2. The Tools You Use (and What You Use Each For)

| Tool | Your Use Case |
|---|---|
| **GitHub Copilot** | In-editor autocomplete — boilerplate, test scaffolding, repetitive type definitions |
| **Claude / ChatGPT** | Architecture discussion, explaining unfamiliar APIs, generating first-pass composables |
| **Cursor** | Multi-file refactoring, codebase-aware edits (understands your types across files) |
| **Copilot Chat / Inline Chat** | Explaining existing code, writing docstrings, generating unit test skeletons |

---

## 3. Your Workflow — How You Use AI Securely

### Step 1: Brief the AI correctly

```
❌ Bad prompt: "Write me a Vue component to fetch products"

✅ Good prompt:
  "Write a Vue 3 Composition API composable in TypeScript that:
   - Fetches from /api/products with AbortController
   - Uses shallowRef for the result array (5000+ items)
   - Implements 3 retries with exponential back-off (500ms, 1000ms, 2000ms)
   - Returns { products, isLoading, error } typed with these interfaces: [paste types]
   - Cleans up the AbortController in onUnmounted
   Do NOT use any external libraries beyond Vue 3 core."
```

Specificity forces the AI to match your architecture. Vague prompts produce generic output
that won't fit your type system or patterns.

---

### Step 2: The Security Review Checklist

Before committing any AI-generated code, run through this mentally:

```
AUTHENTICATION & AUTHORISATION
  [ ] No hardcoded secrets, API keys, or tokens in generated code
  [ ] Auth headers handled server-side (Nuxt server route / BFF) not client-exposed
  [ ] No JWT stored in localStorage (use httpOnly cookies or Pinia session state)

INPUT HANDLING
  [ ] All external data (API responses, URL params, user input) goes through Zod .safeParse()
  [ ] No direct HTML injection — check for v-html usage (XSS vector)
  [ ] URL params sanitised before use in API calls (query injection)

DEPENDENCY RISK
  [ ] Did the AI suggest installing a new npm package?
      → Check: weekly downloads, last publish date, GitHub stars, known CVEs (npm audit)
  [ ] Prefer solutions using existing deps before accepting new ones

NETWORK REQUESTS
  [ ] AbortController cleanup present (memory + orphaned request risk)
  [ ] No credentials: 'include' on cross-origin requests without explicit CORS review
  [ ] No sensitive data in URL query params (appears in server logs)

PERFORMANCE REGRESSION
  [ ] Check for deep reactive patterns on large datasets (use shallowRef, not ref)
  [ ] No synchronous operations inside scroll handlers
  [ ] No memory leaks (event listeners, observers, intervals — verify onUnmounted)
```

---

### Step 3: What You Accept vs Rewrite

| AI Output Quality | Your Action |
|---|---|
| Correct logic, matches your type system, passes security checklist | Accept with minor naming cleanup |
| Correct logic, wrong typing (e.g., `any` used) | Retype — keep logic, fix types |
| Uses a library you don't have or don't need | Rewrite to use existing patterns |
| Security-sensitive code (auth, input handling, token management) | **Always rewrite from scratch** — never accept AI output for auth flows |
| Passes security checklist but has a questionable pattern | Add a comment explaining why you kept it or what you changed |

---

## 4. Concrete Examples from Your Real Work

Use these as the evidence in your answer:

### Example 1 — Accelerating Boilerplate at Recurved
> *"At Recurved Digital Solutions, I used GitHub Copilot to scaffold repetitive API route handlers
> across multiple client backends. Each client had isolated database instances, so I'd use Copilot
> to generate the initial CRUD structure, then manually review every route for: correct auth
> middleware applied, correct rate-limit rules on sensitive endpoints, and no shared state
> between client environments. Copilot saved roughly 40% of the scaffolding time, but the
> security review was non-negotiable on every generated file."*

### Example 2 — TypeScript Type Generation at Velou
> *"At Velou, we worked with complex product attribute schemas from the backend. I used Claude
> to generate initial TypeScript interface definitions from raw JSON examples, then validated
> them against Zod schemas I wrote manually. The AI-generated types gave me a fast starting
> point; the Zod schemas gave me the runtime guarantee. This two-layer pattern meant schema
> changes in the Koa.js API were caught immediately at the API boundary rather than silently
> producing undefined values in the UI."*

---

## 5. AI in Code Review — What You Do as a Senior Dev

When reviewing a PR where a junior has used AI to write code, you check for:

1. **The "confident hallucination"** — AI sometimes generates plausible-looking but wrong API calls (e.g., a Vue method that doesn't exist, or a deprecated Nuxt 2 pattern in a Nuxt 3 project). Juniors may not recognise this.

2. **Over-complexity** — AI tends to generate more code than needed. Ask: "is there a simpler version?"

3. **Missing error handling** — AI often skips `.catch()` or error states. Always check.

4. **Untested edge cases** — AI writes happy-path code. Check: what happens on empty response? 500? Offline?

---

## 6. Interview Answers — Rehearse These

**"Do you use AI in your development workflow?"**
> *"Yes — daily. I use GitHub Copilot for in-editor completion and Claude for architecture
> discussions and first-pass composables. My rule is: AI accelerates the scaffolding phase,
> but everything it produces goes through the same security review checklist I'd apply to
> any code. I'm particularly careful with auth flows, input handling, and anything that
> touches user data — those I write from scratch. The biggest value is consistency: AI helps
> junior developers follow established patterns, which reduces PR review time."*

**"How do you ensure AI-generated code is secure?"**
> *"I have a mental checklist I run on every AI output before committing: no hardcoded
> credentials, all external data validated with Zod at the API boundary, no v-html usage
> without sanitisation, and any new npm package suggestion gets a quick audit for CVEs and
> maintenance activity. I'd also note that security-sensitive code — auth middleware, token
> handling, rate limiting — I always write manually. The risk/reward calculation doesn't
> justify trusting AI for those."*

**"How does AI change your code review process?"**
> *"I look for confident hallucinations — AI produces plausible-looking code that may call
> a Vue method that doesn't exist or use a deprecated Nuxt 2 pattern. I also check for
> missing error handling and untested edge cases, which AI consistently skips. If I see
> AI-generated code that passed the happy path but has no empty state or error state, I
> send it back."*
