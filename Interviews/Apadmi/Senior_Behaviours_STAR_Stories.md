# Senior Behaviours & STAR Stories — Interview Cheat Sheet

> **JD Requirement**: Mentoring juniors, technical liaison with clients, agile advocacy,
> technical leadership, code reviews, proactive problem resolution.
> **Note**: Your CV title is "Full Stack Software Engineer" (4 years — seniority lock enforced).
> You demonstrate senior *behaviours* without overclaiming the title.

---

## Core Principle

Interviewers at Apadmi will probe past behaviour with "Tell me about a time when…" questions.
Your answers must be **specific, concrete, and grounded in your 4 years of real work**.
Generic answers ("I always try to mentor…") score poorly at senior level.

**STAR Format** (mandatory for behavioural questions):
- **S**ituation — context, team size, project type
- **T**ask — what was your specific responsibility
- **A**ction — what you personally did (use "I", not "we")
- **R**esult — measurable outcome or clear improvement

---

## Story Bank — 3 Prepared STAR Stories

---

### Story 1: Mentoring / Knowledge Transfer

**Question triggers**: "Tell me about a time you mentored a junior developer."
"How do you share knowledge in a team?"

---

**Situation:**
> At Recurved Digital Solutions I worked in a rapid-delivery agency environment building Vue.js/Nuxt.js
> applications for multiple client brands simultaneously. The team included developers with varying
> experience levels, and junior members were often given feature work before fully understanding
> the established patterns — particularly around API integration and state management.

**Task:**
> I identified that a recurring problem was juniors writing brittle API calls — no error handling,
> no loading states, data mutated directly in components rather than going through composables.
> This was producing PRs with the same problems repeatedly, slowing down the review cycle.

**Action:**
> I took two specific actions:
> 1. I created a documented composable template — a `useApiData.ts` starter file with comments
>    explaining every section: AbortController setup, retry logic, Zod validation at the boundary,
>    and the mandatory `onUnmounted` teardown. I added it to our shared utilities folder and walked
>    the team through it in a 30-minute knowledge share session.
> 2. I changed my code review approach — instead of just marking comments, I started asking
>    questions: "What happens to this fetch if the user navigates away?" and "Where is the
>    loading state surfaced to the user?" This pushed juniors to find the answers themselves
>    rather than passively receiving corrections.

**Result:**
> Within two sprints the composable template was being used consistently across client projects.
> PR review cycles for API-related features shortened because the common failure modes were
> pre-empted. Two junior developers specifically cited the template in their own work as the
> reason they felt confident handling async patterns independently.

---

### Story 2: Technical Liaison / Client Requirement Management

**Question triggers**: "Tell me about a time you worked directly with a client to define technical requirements."
"How do you handle a situation where a client's requirement is technically infeasible?"

---

**Situation:**
> At Recurved Digital Solutions, one of our client brands requested a feature: they wanted their
> website's product landing pages to be editable "in real-time" by their marketing team without
> involving development. They framed this as "like editing a Word document directly on the website."

**Task:**
> I was the technical contact for this client's project. My responsibility was to translate their
> business requirement into a scoped, deliverable technical specification — and to reset expectations
> where the original request wasn't feasible within budget or timeline.

**Action:**
> I first had a call with the client to understand the underlying business goal — they weren't
> asking for real-time editing specifically; they wanted to reduce their dependency on the dev
> team for marketing copy changes. Once I understood that, I proposed three options with trade-offs
> clearly explained: (1) integrate a headless CMS with a visual editor (most capability, longer
> timeline), (2) a structured admin panel with predefined editable fields (faster, lower cost),
> (3) a Markdown-based file edit flow via GitHub (cheapest, requires slight technical comfort
> from their team). I presented these in non-technical language with example screenshots of
> what each would look like to their editors.
>
> The client chose option 2. I then wrote the technical specification myself, breaking it into
> a phased delivery with the most business-critical fields in phase 1, and walked the dev team
> through it in sprint planning.

**Result:**
> Phase 1 delivered on schedule. The client's marketing manager could update hero text, CTAs,
> and promotional banners without raising a dev ticket. Client satisfaction on that project
> was cited as a success in our agency's internal retrospective. The pattern became a reusable
> approach I documented for future similar client requests.

---

### Story 3: Proactive Problem Resolution / Technical Challenge

**Question triggers**: "Tell me about a time you proactively identified and resolved a technical problem."
"Describe a situation where you had to make a difficult technical decision under pressure."

---

**Situation:**
> At Velou, I was building a Vue.js data validation tool for internal teams processing large
> product catalogues for retail partner brands. The tool allowed users to view, filter, and
> validate product attributes across tens of thousands of SKUs. As datasets grew, we started
> seeing performance degradation — the page would hang for 3–5 seconds when a user loaded a
> large dataset filter result.

**Task:**
> No one had explicitly assigned me to fix this — it had been reported as an annoyance but
> not prioritised as a bug. I identified it as a risk to user adoption and took ownership of
> diagnosing and fixing it between feature sprints.

**Action:**
> I used Chrome DevTools Performance panel to profile the issue. The root cause was that the
> results array (sometimes 8,000+ items) was being stored in a `reactive()` object, causing
> Vue to deep-proxy every item on every filter operation. When a user applied a new filter,
> Vue was re-traversing and re-proxying the entire result set.
>
> I refactored the data storage to use `shallowRef` — the array itself was reactive, but
> individual product objects were not deep-proxied. Filter operations now replaced the
> `.value` reference wholesale rather than mutating in place. I also added a debounce
> on the filter input (300ms) to prevent re-renders on every keystroke.

**Result:**
> The 3–5 second hang was eliminated. Filter operations returned in under 100ms on the
> same dataset sizes. I documented the pattern — "large datasets from APIs should use
> `shallowRef`, not `ref` or `reactive`" — in our team's internal Vue style guide.
> This became a standing rule applied to all subsequent features.

---

## Apadmi-Specific Behavioural Questions — Quick Answers

**"How do you advocate for agile best practices within a team?"**
> *"I focus on the outcomes agile is meant to produce rather than the ceremonies themselves.
> Concretely: I push for short PR cycles (nothing lives in a branch for more than two days),
> I advocate for definition-of-done that includes tests and documentation, and in retros
> I raise process friction rather than letting it silently accumulate. At Recurved I introduced
> the composable template documentation as a result of a retro discussion about repeated PR
> review comments — that's the kind of improvement that sticks."*

**"How do you handle code review — both giving and receiving?"**
> *"When giving reviews: I separate blocking comments from suggestions. Blocking = security risk,
> wrong behaviour, or no error handling. Suggestions = style, alternative approaches. I always
> explain the why, not just the what — especially for junior reviewees. When receiving reviews:
> I treat every comment as a question about intent. If I disagree, I explain my reasoning and
> reference documentation or a concrete example rather than just asserting I'm right."*

**"What does 'quality' mean to you in a front-end context?"**
> *"Four things: it works correctly for the user (tested behaviour, not just happy path),
> it performs on the devices and networks your users actually have (not my fast MacBook on WiFi),
> it's accessible to users with disabilities (WCAG AA as a floor, not a nice-to-have), and it's
> maintainable — someone who didn't write it can understand and modify it in six months without
> breaking something else. If any of those four are missing, it's not done."*

**"Where do you want to be in 3 years?"**
> *"I want to grow into technical leadership — not management, but the kind of senior developer
> who shapes architecture decisions, raises the quality bar for the whole team, and is the
> person juniors come to when they're stuck. Apadmi's model — embedded in cross-functional
> teams, working directly with clients — is exactly the environment where that growth happens
> practically rather than theoretically."*

---

## Interview Mindset Notes

- **Seniority without the title**: You've done senior work (client liaison, knowledge transfer,
  proactive problem-solving) even though your CV title is correctly "Full Stack Software Engineer."
  Let the stories speak — don't volunteer "I'm not officially a senior developer."

- **Apadmi is a digital product agency**: They care about client delivery, not just code quality.
  Always connect technical decisions to user experience and client outcomes.

- **"Mobile-first"** is their identity: Anchor performance answers in real-world mobile conditions —
  4G networks, smaller viewports, battery constraints — not theoretical benchmarks.
