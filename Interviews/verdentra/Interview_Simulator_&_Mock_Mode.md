# File 4: Interview Simulator & Mock Mode

> **How to use this file:** Read each scenario. Close the file. Say the expert answer out loud — as if you're at a whiteboard. Then re-open and compare. Verbal practice is the only preparation that works for verbal interviews.

---

## React Scenarios

---

### Scenario R1: Race Condition in Concurrent `useEffect` Data Fetching

**The interviewer's setup:**
> "A user is on your app and rapidly switches between tabs — clicking 'Profile 1', then 'Profile 2'. You're fetching user data in `useEffect` based on the selected userId. Sometimes Profile 1's data appears under Profile 2's header. Walk me through what's happening and how you'd fix it."

**What's happening (the mechanics):**
Two fetch requests are in-flight simultaneously. Request for Profile 2 completes first, sets state correctly. Request for Profile 1 completes second and overwrites state — the last `setState` wins, regardless of request order.

**The Expert Answer — Three approaches in order of sophistication:**

**Approach 1: Ignore Flag (Cleanup Function)**
In the `useEffect` cleanup, set a boolean `let cancelled = false`. After the await resolves, only call `setState` if `!cancelled`. The cleanup fires when the component re-renders with a new `userId`, setting `cancelled = true` for the previous effect — so the stale response is silently discarded.

**Approach 2: `AbortController`**
Create an `AbortController` inside `useEffect`. Pass its `signal` to `fetch()`. In the cleanup, call `controller.abort()`. The in-flight request is cancelled at the network level. More aggressive than the ignore flag — actually cancels the HTTP request.

**Approach 3: TanStack Query (React Query) — Production Standard**
TanStack Query manages caching, deduplication, and cancellation automatically. Queries are keyed by `['user', userId]` — switching between users instantly shows cached data if available, cancels stale requests, and prevents race conditions by design. This is the answer that signals senior-level production experience.

**Your FlowForge angle:** The same race condition logic appears in your orchestrator's concurrent step resolution — you use a cancellation token pattern in the .NET backend when a workflow is aborted mid-execution.

---

### Scenario R2: Prop Drilling — Component Architecture Problem

**The interviewer's setup:**
> "Your application has a user authentication object that 7 components at different nesting levels need access to. A junior developer on your team passed the `user` prop down through every level. What's wrong with this, and how would you architect it?"

**The Problem — "Prop Drilling":**
Intermediate components receive and forward props they don't use — creating tight coupling. If the auth object's shape changes, every intermediate component must be updated. Components become fragile and non-reusable because they're always tied to this prop chain.

**The Expert Answer — Match the tool to the scale:**

**For auth/theme/locale (low-frequency, global):** React Context is appropriate. Create an `AuthContext` at the application root. Components consume it with `useContext(AuthContext)` — no prop passing required. The key caveat: Context re-renders all consumers when value changes, so keep context values stable or split into multiple fine-grained contexts.

**For complex app state (high-frequency updates):** Zustand provides selector-based subscriptions. `const user = useAuthStore(state => state.user)` — the component only re-renders when `user` changes, not when other store state changes.

**For structural prop drilling (layout issues):** Component Composition — "children as props." Rather than drilling `user` through `Layout → Sidebar → UserWidget`, restructure so `App` renders `<Sidebar><UserWidget user={user}/></Sidebar>`. The `Sidebar` component doesn't know about `user` at all.

---

### Scenario R3: Performance — Preventing Unnecessary Re-renders

**The interviewer's setup:**
> "Your React dashboard has a parent component managing a task list. Each task card has an 'Update Status' button. Every time any single task's status changes, all 50 task cards re-render. How do you diagnose and fix this?"

**Diagnosis:**
React DevTools Profiler is the first tool. It shows component render times and which components re-rendered on each state update.

**Root cause:** The parent re-renders on state change, which re-renders all 50 `TaskCard` children. The `onStatusChange` callback prop is a new function reference on every render (JavaScript closures recreate functions on each call).

**The Expert Fix — Two-step:**

**Step 1**: Wrap `TaskCard` in `React.memo`. This tells React: "only re-render this child if its props changed by reference."

**Step 2**: Wrap the `onStatusChange` callback in `useCallback([...deps])`. This preserves the function reference across parent re-renders, so `React.memo` isn't defeated by a new function reference on every render.

**The architectural alternative:** For large lists, consider virtualisation (react-window, TanStack Virtual) — only render the task cards visible in the viewport. 10,000 tasks render with the same performance as 10.

---

### Scenario R4: Stale Closure in a Timer

**The interviewer's setup:**
> "A developer writes a `useEffect` that sets up a `setInterval` to auto-save a form every 5 seconds. After filing a bug report, they notice the auto-save always sends the initial empty form data, ignoring the user's typed content. What's wrong?"

**The Mechanics — Stale Closure:**
The `setInterval` callback is a closure created at the time `useEffect` ran. If `formData` was `{}` at that time and the dependency array was `[]`, the closure permanently captures the stale `{}` reference. Even as the user types and `formData` state updates, the interval callback references the old, empty object.

**The Expert Fixes:**

**Fix 1**: Add `formData` to the dependency array. The interval restarts whenever the form changes — correct but may be excessive.

**Fix 2 (Preferred)**: Use a `useRef` to store form data. `useRef` is a mutable container that persists across renders without triggering re-renders. Sync state into the ref on every render: `formRef.current = formData`. The interval reads from `formRef.current`, which is always up-to-date — no stale closure.

**Fix 3**: Use a debounced `useEffect` on `formData` instead of a timer. When `formData` changes, the effect fires after a 5-second debounce and auto-saves. Clean, no interval required.

---

### Scenario R5: Multi-Step Async Loading State Machine

**The interviewer's setup:**
> "Your component needs to: first fetch a user, then fetch that user's permissions, then fetch their dashboard data — each depending on the previous result. How do you model the loading states to avoid a broken UI?"

**The Anti-Pattern:** Three separate `isLoading` booleans lead to impossible states — `isLoadingUser: false, isLoadingPermissions: true, isLoadingDashboard: false` after the user has left but before permissions loaded. Boolean flags create 2^N possible states, many of which are invalid.

**The Expert Answer — State Machine Thinking:**

Model loading as an explicit, finite state enum:
```
'idle' → 'loading-user' → 'loading-permissions' → 'loading-dashboard' → 'success' | 'error'
```

Each state transition is intentional. The UI renders based on the current state:
- `loading-user` → show skeleton for user section
- `loading-permissions` → show user info, skeleton for dashboard
- `error` → show which step failed with a retry button

**Implementation options:**
- Simple: A `status` string in `useState` + sequential `await` chain in `useEffect`.
- Advanced: `useReducer` for complex state transitions — the reducer handles each transition explicitly and rejects invalid ones.
- Production: TanStack Query with dependent queries — `useQuery(['permissions', userId], ..., { enabled: !!userId })` — the query only fires when `userId` is available.

---

## .NET Core / Architecture Scenarios

---

### Scenario N1: The `Task.Wait()` / `.Result` Deadlock

**The interviewer's setup:**
> "A junior developer added a synchronous method to an ASP.NET Core controller that calls an async repository method using `.Result`. The feature works fine in development but occasionally deadlocks under load in staging. Explain what's happening."

**The Expert Answer:**

`.Result` and `.Wait()` are **synchronous blocking calls** on a Task. They block the calling thread until the async operation completes.

In classic ASP.NET (not Core), there is a synchronization context. When the blocked thread calls `.Result`, it holds the synchronization context. The async continuation needs that same context to resume — but it's blocked. Both are waiting for each other. **Deadlock**.

ASP.NET Core removed the synchronization context, so `.Result` doesn't deadlock in the same way — but it still causes **thread pool starvation** under load. If 100 requests each block their thread with `.Result`, 100 threads sit doing nothing. The thread pool exhausts. New requests queue. Latency spikes.

**The architectural principle**: "Async all the way down." A single synchronous block in an async chain defeats the entire benefit of async. Controller action must be `async Task<IActionResult>`, the service method must be `async Task<T>`, the repository call must be `await db.Tasks.ToListAsync()`.

**Interview vocabulary**: "Capturing the synchronization context", "thread pool starvation", "async all the way".

---

### Scenario N2: N+1 Query Problem with EF Core

**The interviewer's setup:**
> "Your `GET /api/reports` endpoint is extremely slow. Profiling shows it's making 101 database queries for a list of 100 reports. You're using EF Core. What happened, and how do you fix it?"

**The Mechanics — N+1:**
The developer queried `reports = await db.Reports.ToListAsync()` (1 query). Then in a loop, accessed `report.Author.Name` (N queries — one per report, EF Core lazily loads the navigation property on demand).

**Diagnosis tools**: SQL Server Profiler, Application Insights, EF Core query logging (`EnableSensitiveDataLogging()` in Development), or `MiniProfiler`.

**Fix 1 — Eager Loading (Preferred):**
`db.Reports.Include(r => r.Author).ToListAsync()` — generates a single SQL `LEFT JOIN` query, fetching everything in one round trip.

**Fix 2 — Projection (Best Performance):**
`db.Reports.Select(r => new { r.Title, r.Author.Name }).ToListAsync()` — Only fetches the columns you actually need. No change tracker overhead. Fastest option for read-heavy endpoints.

**Fix 3 — Explicit Loading:**
For complex scenarios where you conditionally need related data, `db.Entry(report).Reference(r => r.Author).LoadAsync()` — manually load when needed.

**Interview vocabulary**: "Eager loading", "lazy loading", "projection", "query plan", "round trips".

---

### Scenario N3: EF Core Optimistic Concurrency

**The interviewer's setup:**
> "Two product managers simultaneously open the same Order in your admin panel. Manager A changes the status to 'Shipped' and saves. 200ms later, Manager B (who loaded the original 'Processing' status) saves the status as 'Cancelled'. Manager A's change was silently lost. How would you design a system that prevents this?"

**The Problem — Lost Update Anomaly:**
Both reads saw `status: Processing`. Last write wins. Manager A's update is silently overwritten.

**The Solution — Optimistic Concurrency with Row Versioning:**

Add a `RowVersion` (byte array) column to the entity. The database automatically increments it on every update. It's a timestamp of the data's last modification.

**The flow:**
1. Manager A and B both read the row — both receive `RowVersion: 0x0001`.
2. Manager A saves. EF Core generates: `UPDATE Orders SET Status='Shipped' WHERE Id=5 AND RowVersion=0x0001`. The `WHERE` clause is the key.
3. Database updates the row and increments `RowVersion` to `0x0002`.
4. Manager B saves. EF Core generates: `UPDATE Orders SET Status='Cancelled' WHERE Id=5 AND RowVersion=0x0001`.
5. The `WHERE RowVersion=0x0001` no longer matches (it's now `0x0002`). **0 rows affected**.
6. EF Core detects 0 rows affected and throws `DbUpdateConcurrencyException`.
7. Your code catches this exception and returns `409 Conflict` to Manager B with a message: "This record was modified by another user. Please reload and try again."

**Interview vocabulary**: "Lost update anomaly", "optimistic concurrency", "row versioning", "pessimistic locking" (the alternative — database `SELECT FOR UPDATE` lock — blocks concurrent reads entirely, suitable for very high-conflict scenarios).

---

### Scenario N4: Captive Dependency / Background Service DbContext

**The interviewer's setup:**
> "A developer injected `AppDbContext` directly into the constructor of a `BackgroundService`. It compiled and ran fine in development. In production, after a few days, the service starts returning stale data and eventually throws `ObjectDisposedException`. Explain this."

**The Expert Answer:**

`BackgroundService` is registered as a **Singleton** — created once at app startup, lives forever.

`AppDbContext` is registered as **Scoped** — designed to live for one HTTP request, then be disposed.

**What happens**: At startup, the Singleton `BackgroundService` is constructed. The DI container resolves `AppDbContext` for the constructor — it creates a Scoped instance and injects it. But because no HTTP request is active, this context is never disposed. It lives inside the Singleton forever — a "captive dependency."

**The consequences:**
- The DbContext's change tracker accumulates every entity ever loaded — memory grows indefinitely.
- The change tracker serves stale cached data — bypassing database changes made by other processes.
- Eventually, the underlying database connection times out, causing `ObjectDisposedException`.

**The Correct Pattern:**
Inject `IServiceScopeFactory` (a Singleton itself, safe to capture) into the `BackgroundService`. In the `ExecuteAsync` loop, for each job, manually create a DI scope, resolve a fresh `DbContext` from it, use it, then dispose the scope. Each background job gets a short-lived, correctly managed `DbContext`.

**Interview vocabulary**: "Captive dependency", "IServiceScopeFactory", "Unit of Work pattern", "change tracker".

---

### Scenario N5: Designing the Async Reporting Endpoint

**The interviewer's setup:**
> "A client needs to generate a financial report that joins 12 database tables, applies complex business rules, and produces a 200-page PDF. This takes 3–4 minutes. Design the API endpoint architecture."

**The Expert Answer — Asynchronous Request-Reply Pattern:**

Synchronous processing is not viable — API gateways and load balancers typically have 30–60 second timeouts.

**Design:**

1. `POST /api/reports/financial` → API validates the request parameters, generates a `jobId` (GUID), persists a `ReportJob` record with `status: Pending` to the database, writes the job to a `Channel<ReportJob>` (or Azure Service Bus queue for multi-server resilience), and immediately returns `202 Accepted` with `{ jobId: "...", statusUrl: "/api/reports/jobs/{jobId}" }`.

2. A `BackgroundService` (or dedicated Azure Worker Service for production) listens on the channel. It picks up the job, runs the 4-minute operation, and when complete, updates the `ReportJob` record to `status: Complete` with a `downloadUrl`.

3. `GET /api/reports/jobs/{jobId}` → the client polls this. Returns the current `ReportJob` status from the database. When status is `Complete`, includes `downloadUrl`.

4. **Enhancements for production**: SignalR push notification when complete (eliminates polling). Pre-signed Azure Blob Storage URL for the PDF download (time-limited, bypasses the API for large file delivery). Dead-letter handling for failures.

**Scalability consideration**: If report generation needs to scale beyond a single server, replace `Channel<T>` with **Azure Service Bus**. Multiple `Worker Service` deployments can compete on the same queue — processing scales linearly with worker count.

**Your FlowForge connection**: This is architecturally identical to FlowForge's workflow execution model. Validate this pattern by reference in the interview.

---

## The Mock Interview Prompt

*Copy everything inside the triple-dashes below and paste it into a new Claude conversation when you are ready to practice. The interview will be conducted in real time, one question at a time.*

---

```
SYSTEM: You are the Lead Software Architect and Hiring Manager at Verdentra — a cloud, data, and AI technology consultancy that builds enterprise solutions using React and .NET for US ISV partners. You are conducting a 1-hour technical interview.

The candidate is Gimhana Mithuranga — a full-stack engineer with approximately 4 years of experience. His background is in:
- Vue 3 (Composition API, Pinia) — strong
- React — recently bridging from Vue knowledge
- ASP.NET Core, C#, EF Core — solid practical experience
- Azure, CI/CD (GitHub Actions), Bicep — developing
- A distributed workflow orchestration project called FlowForge (MassTransit Sagas, RabbitMQ, System.Threading.Channels, React Flow canvas)
- A task tracker project (React + .NET Minimal API + SQLite + Azure deployment + Bicep IaC + GitHub Actions)

YOUR PERSONA AND RULES:
1. You are professional, technically rigorous, and expect architectural-level answers — not just syntax recall. You value engineering vocabulary, reasoning about trade-offs, and awareness of production consequences.
2. Ask ONE question at a time. Wait for the candidate's response before asking the next.
3. After each response, give brief constructive feedback: what was strong, what was missing, what vocabulary to improve. Then move to the next question.
4. If an answer is vague or junior-level, probe deeper: "Why?", "What happens at scale?", "What are the trade-offs?", "How would you debug that?"
5. Cover these topic areas across the interview (mix React, .NET, SQL, and process questions — don't cluster all of one type):
   - React: useEffect dependency array, stale closures, re-render optimisation, state management choice
   - .NET: DI lifetimes (Scoped/Singleton trap), async all the way, EF Core N+1, optimistic concurrency
   - Architecture: Producer-Consumer / Async Request-Reply for heavy workloads
   - Auth: JWT validation chain, token rotation strategy, OAuth 2.0 flows
   - SQL: Slow query diagnosis, index types, N+1 in SQL context, execution plans
   - DevOps/IaC: CI/CD pipeline design, Bicep/IaC concepts, environment management
   - Agile: Scrum ceremonies, handling scope creep mid-sprint, Definition of Done
   - Candidate's own projects: FlowForge architecture, task tracker Bicep+GitHub Actions pipeline
6. Evaluate on: technical accuracy, use of correct vocabulary, awareness of production constraints, and ability to discuss trade-offs.
7. Around the midpoint of the interview, ask at least one Agile process question to assess how Gimhana works in a team — not just how he codes.

BEGIN: Welcome Gimhana to the interview. Introduce yourself as the Lead Architect at Verdentra. Then ask your first technical question about React state management — specifically, ask him to explain the difference between how Vue 3 and React handle reactivity, and what implications that has for a developer switching between the two frameworks.
```

---

## Quick-Reference Vocabulary Sheet

Study these terms so they come naturally in conversation:

| Term | One-Line Definition |
|:---|:---|
| **Stale closure** | A function capturing an old variable reference that never updates |
| **Thread pool starvation** | All threads blocked on sync I/O, new requests can't be served |
| **Captive dependency** | A longer-lived service holding a shorter-lived service past its intended lifetime |
| **Optimistic concurrency** | Detect write conflicts by comparing version tokens rather than locking rows |
| **Async Request-Reply** | Accept work immediately (202), process out-of-band, expose status endpoint |
| **Producer-Consumer** | Decoupled pattern: one component enqueues work, another independently dequeues and processes |
| **Dead-letter queue** | Queue for messages that failed processing — captured for investigation, not silently dropped |
| **Backpressure** | Bounded channel/queue deliberately slows producers when consumers can't keep up |
| **Eager loading** | Fetching related data in a single JOIN query (EF: `.Include()`) |
| **Lazy loading** | Related data fetched on-demand — can cause N+1 queries |
| **PKCE** | Proof Key for Code Exchange — prevents auth code interception in public clients |
| **Token rotation** | Issue a new refresh token on every use; detect theft when a used token is presented again |
| **Idempotent** | An operation that produces the same result regardless of how many times it's called |
| **Resource server** | The protected API that validates tokens and serves data |
| **Authorization server** | The IdP (Azure AD, Auth0) that authenticates users and issues tokens |
| **Clustered index** | Defines the physical sort order of the table — one per table, usually primary key |
| **Non-clustered index** | Separate B-tree structure pointing to rows — multiple allowed, used for query columns |
| **Covering index** | Index that includes all columns a query needs, avoiding a table lookup |
| **Table scan** | Full sequential read of every row — indicates a missing index |
| **Index seek** | Direct jump to matching rows via index — ideal for WHERE/JOIN columns |
| **Execution plan** | Visual map of how SQL Server executes a query — shows scans, seeks, joins, costs |
| **CTE** | Common Table Expression — named subquery for readability and reuse within a single query |
| **Window function** | SQL function operating across a set of rows related to current row (RANK, SUM OVER) |
| **Velocity** | Average story points completed per sprint — used to forecast future sprint capacity |
| **Definition of Done** | Shared agreement on what "complete" means: reviewed, tested, deployed |
| **WIP limit** | Maximum items allowed in a Kanban column — prevents overloading and reveals bottlenecks |
| **Sprint backlog** | The subset of product backlog items committed for the current sprint |
| **Service connection** | ADO's authenticated link to an Azure subscription for deployment pipelines |
| **Variable group** | Shared pipeline variables/secrets in ADO, optionally backed by Azure Key Vault |
| **IaC** | Infrastructure as Code — cloud resources defined in version-controlled code (Bicep, Terraform) |
| **Lead time** | Total time from item creation to done — the customer's perspective |
| **Cycle time** | Time from work started to done — the team's delivery pace |
