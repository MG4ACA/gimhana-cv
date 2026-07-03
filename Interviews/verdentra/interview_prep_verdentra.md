# Interview Prep — Verdentra (React + .NET Role)
> Interview: Tuesday | Prep time: ~1.5 days | Tailored to your actual level

---

## How to use this guide

- Work through it **in order** — each section builds on the previous
- For each code exercise: **type it yourself**, don't copy-paste. Typing builds muscle memory
- For each Q&A: say the answer **out loud**. Silent reading doesn't prepare you for speaking

---

# TODAY — Session 1 (2–3 hours)

## Focus: React Fundamentals You Must Be Able to Explain

---

### CONCEPT 1: What is a React Hook?

**What to know:**
React Hooks are functions that let you use state and lifecycle features inside function components. Before hooks, you needed class components for this.

The three you MUST know:

| Hook | Purpose | Simple memory trigger |
|---|---|---|
| `useState` | Store data that changes | "remember a value" |
| `useEffect` | Do something when data changes | "watch and react" |
| `useCallback` | Memoize a function so it doesn't recreate every render | "don't remake this function" |

---

### PRACTICE 1A — useState (10 mins)

Open VS Code. Create a file `practice.html`. Type this out:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">

    function Counter() {
      // useState returns [currentValue, functionToChangeIt]
      const [count, setCount] = React.useState(0);

      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={() => setCount(count + 1)}>Add</button>
          <button onClick={() => setCount(0)}>Reset</button>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<Counter />);
  </script>
</body>
</html>
```

Open in browser. Make it work. Understand: **every time setCount is called, the component re-renders.**

---

### PRACTICE 1B — useEffect (10 mins)

Add this to the same file, replacing Counter:

```jsx
function UserLoader() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // useEffect runs AFTER the component renders
  // The [] means "run once when component first appears"
  React.useEffect(() => {
    // Simulate an API call with a timeout
    setTimeout(() => {
      setUser({ name: 'Gimhana', role: 'Developer' });
      setLoading(false);
    }, 1500);
  }, []); // <-- empty array = run once

  if (loading) return <p>Loading...</p>;
  return <p>Hello, {user.name}! Role: {user.role}</p>;
}
```

**What to notice:** The component shows "Loading..." first, then updates when the data arrives. This is exactly how you'd connect to a real API.

---

### Q&A 1 — React (Say these answers out loud)

**Q: What is the difference between props and state?**
> "Props are values passed into a component from its parent — they're read-only from the child's perspective. State is internal data the component manages itself and can change over time. When state changes, React re-renders the component."

**Q: What does useEffect do and when does it run?**
> "useEffect lets you perform side effects — like API calls, timers, or subscriptions — after a component renders. The dependency array controls when it re-runs: empty array means once on mount, no array means every render, and with values means whenever those values change."

**Q: Why shouldn't you call an API directly inside the render function?**
> "Because the render function runs every time the component updates. Calling an API there would trigger infinite loops or redundant requests. useEffect with the correct dependency array controls when the call actually happens."

**Q: What is component re-rendering?**
> "When state or props change, React calls the component function again to produce an updated UI. React then compares the new output with the previous one and only updates the actual DOM where things changed — this is the virtual DOM."

---

### CONCEPT 2: Async/Await — The Foundation

**Why this matters:** Almost everything in real apps is async — API calls, database reads, file operations. You need to understand this clearly.

**The core idea:** JavaScript (and C#) are single-threaded. When you wait for something slow (like an API), you don't want to freeze the whole app. `async/await` lets you write code that *looks* synchronous but doesn't block.

---

### PRACTICE 1C — Async in JavaScript (15 mins)

```javascript
// WRONG — this blocks everything
function getUser() {
  const result = fetch('https://api.example.com/user'); // This returns a Promise!
  console.log(result); // You get a Promise object, not the data
}

// RIGHT — async/await
async function getUser() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
    const data = await response.json();
    console.log(data.name); // Leanne Graham
  } catch (error) {
    console.log('Something went wrong:', error.message);
  }
}

getUser();
```

Open your browser console (F12) and run this. **See it work.**

Key rules:
- A function must be marked `async` before you can use `await` inside it
- `await` pauses ONLY that function — not the whole browser
- Always wrap in `try/catch` — APIs can fail

---

### Q&A 2 — Async/Await (Say these out loud)

**Q: What is the difference between synchronous and asynchronous code?**
> "Synchronous code runs line by line — each line waits for the previous one to finish. Asynchronous code can start a slow operation, move on to other work, and come back when that operation completes. This prevents the UI or server from freezing while waiting for things like API responses or database reads."

**Q: What is a Promise?**
> "A Promise represents the eventual result of an asynchronous operation. It can be in one of three states: pending, fulfilled with a value, or rejected with an error. async/await is syntactic sugar over Promises — it makes them easier to read and write."

**Q: What happens if you forget the await keyword?**
> "You get a Promise object instead of the actual resolved value. Your code will continue executing with the wrong value, which usually causes bugs that are hard to trace."

---

# TOMORROW — Full Day

## Morning Session (9am–12pm): .NET API Fundamentals

---

### CONCEPT 3: How a .NET Minimal API Works

**What to understand first:**
A .NET Minimal API is a lightweight way to define HTTP endpoints in C#. No controllers, no heavy ceremony — just map a route to a function.

**The flow of a request:**
```
Browser/Client
     ↓  HTTP Request (GET /api/users)
  .NET Kestrel (web server)
     ↓
  Middleware pipeline (auth check, logging, etc.)
     ↓
  Route handler (your code)
     ↓
  Response sent back
```

---

### PRACTICE 2A — Your First .NET Minimal API (30 mins)

**Setup (one time):**
```bash
# In VS Code terminal
dotnet new web -n PracticeApi
cd PracticeApi
code .
```

Replace the contents of `Program.cs` with this. **Type it, don't paste:**

```csharp
var builder = WebApplication.CreateBuilder(args);

// This registers services — things your app needs
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// --- Simple in-memory "database" ---
var users = new List<User>
{
    new User(1, "Gimhana", "gimhana@email.com"),
    new User(2, "Alice", "alice@email.com")
};

// --- ROUTES ---

// GET all users
app.MapGet("/api/users", () =>
{
    return Results.Ok(users);
});

// GET one user by ID
app.MapGet("/api/users/{id}", (int id) =>
{
    var user = users.FirstOrDefault(u => u.Id == id);
    if (user is null) return Results.NotFound("User not found");
    return Results.Ok(user);
});

// POST — create a new user
app.MapPost("/api/users", (CreateUserRequest request) =>
{
    var newUser = new User(users.Count + 1, request.Name, request.Email);
    users.Add(newUser);
    return Results.Created($"/api/users/{newUser.Id}", newUser);
});

// DELETE a user
app.MapDelete("/api/users/{id}", (int id) =>
{
    var user = users.FirstOrDefault(u => u.Id == id);
    if (user is null) return Results.NotFound();
    users.Remove(user);
    return Results.NoContent();
});

app.Run();

// --- Models ---
record User(int Id, string Name, string Email);
record CreateUserRequest(string Name, string Email);
```

**Run it:**
```bash
dotnet run
```

**Test it** — open your browser or use the VS Code Thunder Client extension:
- `GET http://localhost:5000/api/users`
- `GET http://localhost:5000/api/users/1`
- `POST http://localhost:5000/api/users` with body `{"name":"Bob","email":"bob@test.com"}`

**Understand every line before moving on.**

---

### Q&A 3 — .NET APIs (Say these out loud)

**Q: What is dependency injection and why does .NET use it?**
> "Dependency injection is a pattern where a class receives its dependencies from outside rather than creating them itself. .NET has a built-in DI container — you register services with `builder.Services.AddSomething()` and the framework injects them into your endpoints or classes automatically. It makes code more testable and loosely coupled — you can swap implementations without changing the consuming code."

**Q: What is middleware in ASP.NET Core?**
> "Middleware is code that sits in the HTTP request pipeline between when a request arrives and when the response is sent. Each middleware can inspect, modify, or short-circuit the request. Common examples are authentication middleware that checks JWT tokens, logging middleware that records requests, and CORS middleware. They're added with `app.Use...()` calls and run in order."

**Q: What HTTP status codes should you know?**
> "200 OK — success. 201 Created — resource was created. 400 Bad Request — client sent invalid data. 401 Unauthorized — not authenticated. 403 Forbidden — authenticated but no permission. 404 Not Found — resource doesn't exist. 500 Internal Server Error — something failed on the server."

**Q: What is the difference between PUT and PATCH?**
> "PUT replaces the entire resource with what you send — if you omit fields, they get overwritten. PATCH applies a partial update — only the fields you include are changed. For most CRUD apps, PATCH is safer for updates."

---

### PRACTICE 2B — Add Async to Your API (20 mins)

Real APIs don't use in-memory lists — they wait for databases. Add this to your `Program.cs` to simulate async database calls:

```csharp
// Simulate async DB call — replace your GET all route with this
app.MapGet("/api/users", async () =>
{
    // Simulating a database read delay
    await Task.Delay(100); // pretend this is a DB query
    return Results.Ok(users);
});

// GET one user — async version
app.MapGet("/api/users/{id}", async (int id) =>
{
    await Task.Delay(50);
    var user = users.FirstOrDefault(u => u.Id == id);
    return user is null ? Results.NotFound() : Results.Ok(user);
});
```

**What changed:** The handler is now `async`, and we `await` the slow operation. The thread is freed up while waiting, so other requests can be handled.

---

## Afternoon Session (1pm–4pm): Concurrency & Async Patterns

---

### CONCEPT 4: Concurrent Users — What It Actually Means

**The problem:**
When 1000 users hit your API at the same time, what happens?

- **Blocking (bad):** Each request holds a thread while waiting for DB. 1000 requests = 1000 threads = server runs out of memory
- **Async (good):** Each request releases its thread while waiting. Those threads can handle other requests. Same server handles 10x more load

**In .NET, the rule is simple:**
> Any time you call something slow (DB, HTTP, file), use `await`. That's it.

---

### PRACTICE 3A — Multiple Async Operations (20 mins)

```csharp
// Add this route to your Program.cs
app.MapGet("/api/dashboard", async (int userId) =>
{
    // BAD way — sequential, takes 300ms total
    // var user = await GetUserAsync(userId);       // 100ms
    // var orders = await GetOrdersAsync(userId);   // 100ms
    // var notifications = await GetNotifAsync();   // 100ms

    // GOOD way — parallel, takes ~100ms total
    var userTask = GetUserAsync(userId);
    var ordersTask = GetOrdersAsync(userId);
    var notificationsTask = GetNotificationsAsync();

    // Wait for ALL of them at the same time
    await Task.WhenAll(userTask, ordersTask, notificationsTask);

    return Results.Ok(new
    {
        User = userTask.Result,
        Orders = ordersTask.Result,
        Notifications = notificationsTask.Result
    });
});

// Simulated async services
static async Task<object> GetUserAsync(int id)
{
    await Task.Delay(100);
    return new { Id = id, Name = "Gimhana" };
}

static async Task<object> GetOrdersAsync(int userId)
{
    await Task.Delay(100);
    return new[] { new { Id = 1, Item = "Laptop" }, new { Id = 2, Item = "Mouse" } };
}

static async Task<object> GetNotificationsAsync()
{
    await Task.Delay(100);
    return new[] { "Your order shipped", "New message" };
}
```

Test: `GET http://localhost:5000/api/dashboard?userId=1`

**The key lesson:** `Task.WhenAll` runs multiple async operations in parallel and waits for all of them. This is how you build fast APIs.

---

### PRACTICE 3B — Basic Error Handling (15 mins)

```csharp
app.MapPost("/api/users", async (CreateUserRequest request) =>
{
    // Input validation
    if (string.IsNullOrWhiteSpace(request.Name))
        return Results.BadRequest("Name is required");

    if (!request.Email.Contains('@'))
        return Results.BadRequest("Invalid email format");

    try
    {
        // Simulate a DB save that might fail
        await Task.Delay(50);

        // Simulate occasional failure
        if (new Random().Next(10) == 0)
            throw new Exception("Database connection lost");

        var newUser = new User(users.Count + 1, request.Name, request.Email);
        users.Add(newUser);
        return Results.Created($"/api/users/{newUser.Id}", newUser);
    }
    catch (Exception ex)
    {
        // Never expose the raw exception to the client in production
        Console.WriteLine($"Error creating user: {ex.Message}");
        return Results.Problem("An error occurred while creating the user");
    }
});
```

---

### Q&A 4 — Concurrency & Async (Say these out loud)

**Q: What is the difference between async and multi-threading?**
> "Async is about not blocking a thread while waiting for I/O — like database reads or API calls. The same thread can be reused for other work during the wait. Multi-threading is about running CPU-intensive work across multiple CPU cores simultaneously. For web APIs, you mostly need async for I/O — not multi-threading — because the bottleneck is usually waiting for databases, not CPU computation."

**Q: What does Task.WhenAll do?**
> "Task.WhenAll takes multiple Tasks and runs them concurrently, waiting until all of them complete. It's like saying 'start all these operations at the same time and tell me when they're all done.' This is much faster than awaiting them one by one when the operations are independent of each other."

**Q: What is a race condition? (You may be asked this)**
> "A race condition is when two concurrent operations access and modify shared data at the same time, producing unpredictable results. For example, two requests both read a counter value of 5, both add 1, and both write 6 back — but the expected result was 7. In web APIs, this is typically handled by database transactions and row-level locking rather than in-memory locks."

**Q: Why should you never use Thread.Sleep in an async method?**
> "Thread.Sleep blocks the thread completely — it can't be used for other requests during that time. The async equivalent is await Task.Delay() which releases the thread while waiting, allowing it to serve other requests."

---

## Late Afternoon (4pm–6pm): SQL + Design Principles

---

### Q&A 5 — SQL (Know these cold)

**Q: What is an index and why does it matter?**
> "An index is a data structure the database maintains to speed up queries on a column. Without an index, the database scans every row — called a full table scan. With an index on the searched column, it jumps directly to matching rows. The trade-off is that indexes slow down writes slightly because the index must be updated too."

**Q: What is the difference between INNER JOIN and LEFT JOIN?**
> "INNER JOIN returns only rows where there's a match in both tables. LEFT JOIN returns all rows from the left table, and matching rows from the right — if there's no match, the right side columns are NULL. Use LEFT JOIN when you want to keep records even if the related data doesn't exist."

**Q: What is a N+1 query problem?**
> "The N+1 problem is when you run 1 query to get a list of records, then run 1 additional query for each record to get related data — so for 100 users, you run 101 queries instead of 1 JOIN. EF Core can cause this if you're not careful with `.Include()` for eager loading related entities."

**Quick SQL to practice:**
```sql
-- Get all users and their order count
SELECT u.Name, COUNT(o.Id) AS OrderCount
FROM Users u
LEFT JOIN Orders o ON o.UserId = u.Id
GROUP BY u.Name
ORDER BY OrderCount DESC;

-- Get users who placed more than 5 orders
SELECT u.Name, COUNT(o.Id) AS OrderCount
FROM Users u
INNER JOIN Orders o ON o.UserId = u.Id
GROUP BY u.Name
HAVING COUNT(o.Id) > 5;
```

---

### Q&A 6 — Design Principles (Keep these short and clear)

**Q: What is Clean Architecture / separation of concerns?**
> "It's the practice of keeping different responsibilities in different layers. For example: the API layer only handles HTTP — it doesn't contain business logic. The service layer contains business rules. The repository layer handles data access. Each layer depends only on abstractions, not concrete implementations. This makes the code easier to test and maintain."

**Q: What is REST? What makes a good REST API?**
> "REST is an architectural style for APIs that uses standard HTTP methods and treats data as resources. A good REST API: uses nouns for URLs not verbs (`/users` not `/getUsers`), uses the correct HTTP verb for the operation, returns appropriate status codes, is stateless — each request contains all information needed, and has consistent, predictable URL patterns."

**Q: What is the difference between authentication and authorization?**
> "Authentication verifies who you are — like logging in with a username and password, receiving a JWT token. Authorization verifies what you're allowed to do — like checking if your token has the Admin role before letting you delete a user. You authenticate once; authorization is checked on every protected action."

---

## Evening (7pm–9pm): Interview Soft Skills

---

### FlowForge — How to talk about it

**If they ask: "Tell me about a project you built"**

> *"I designed and am currently building a distributed workflow orchestration system called FlowForge. The idea is that instead of hardcoding multi-step business processes in code, users visually drag and drop workflow steps onto a canvas — built with React Flow — and the .NET backend executes those as concurrent state machine instances using MassTransit Saga.*
>
> *The interesting engineering challenge was concurrent execution — handling thousands of workflow steps in parallel without blocking threads. I solved that with System.Threading.Channels, which gives you a bounded producer/consumer pipeline with natural backpressure.*
>
> *I'm actively building it — the architecture and core state machine logic are in place, and I'm working through the frontend canvas integration now."*

**If they ask: "How far along is it?"**
> *"The architecture design is complete and documented. I've been implementing it alongside my other preparation — the backend state machine is coded, and I'm integrating the React Flow canvas now."*

---

### Behavioural Questions — Have these ready

**Q: "Tell me about a time you had a tight deadline."**
> Recurved — agency environment, multiple client projects simultaneously. Pick one specific example.

**Q: "How do you handle feedback from code reviews?"**
> *"I actively seek it. At Recurved I both gave and received code reviews — I see them as the fastest way to level up. When I get feedback I ask 'why' if it's not clear, so I understand the principle not just the fix."*

**Q: "Why do you want to work at Verdentra?"**
> *"Verdentra sits at the intersection of cloud, AI, and real product delivery for US ISV partners. That's exactly the kind of environment I want to grow in — working on problems that are technically interesting AND commercially impactful. The React + .NET stack is also where I'm actively deepening my skills."*

**Q: "You mention AI tools in your CV — can you elaborate?"**
> *"At Recurved I worked with OpenAI and Gemini APIs for client integrations. I also wrote custom prompt templates to guide AI outputs within our team workflows — essentially prompt engineering for developer productivity. I see AI as a force multiplier, not a replacement for understanding what you're building."*

---

## The Azure / ADO Gap — Handle It Honestly

**Q: "We use Azure DevOps. Do you have experience with it?"**
> *"My CI/CD experience has been with GitHub Actions in production — same pipeline concepts: trigger on PR, run tests, build artifacts, deploy. Azure DevOps uses the same mental model with a different UI and YAML structure. I'm confident I can get productive in ADO quickly. I've also been studying Azure services given its prominence in cloud-forward teams like yours."*

---

## Morning of Interview — 30 min review

Read through these once:
- useState / useEffect one-liner explanations
- async/await: what it is, why it matters
- HTTP status codes: 200, 201, 400, 401, 403, 404, 500
- Your FlowForge paragraph (rehearse it twice out loud)
- Your "Why Verdentra" answer

**Sleep well the night before. Tired brain = poor answers.**

---

> [!TIP]
> You don't need to know everything. You need to know what you know — clearly and confidently. Interviewers respect honesty about gaps far more than bluffing. If you don't know something, say: *"I haven't worked with that directly, but here's how I'd approach learning it..."*
