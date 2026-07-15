# 7-Day Granular Master Schedule: Course & FlowForge

This intensive 7-day sprint removes the job hunt to focus entirely on learning and building. Each day requires roughly **6 hours of dedication**, broken down into **30-minute sub-tasks** to keep you focused and moving fast.

Check these off daily as you complete each 30-minute block!

---

## 📅 Day 1 (6 Hours)

**Course: Intro & EF Core Setup (2.5 hrs)**
- [ ] 30m: Intro to ORMs reading & video concepts.
- [ ] 30m: Create a new sample ASP.NET Core project for the course.
- [ ] 30m: Install Entity Framework Core Nuget packages.
- [ ] 30m: Define your first simple model classes.
- [ ] 30m: Create the DbContext class and configure the connection string.

**FlowForge: MassTransit Setup (3.5 hrs)**
- [ ] 30m: Review `PROGRESS.md` & add MassTransit packages to OrchestrationEngine.
- [ ] 30m: Configure RabbitMQ connection in `Program.cs`.
- [ ] 30m: Define basic Event/Command message contracts.
- [ ] 30m: Create the initial `WorkflowStateMachine` class structure.
- [ ] 30m: Define the state machine states (e.g., Pending, Running, Completed).
- [ ] 30m: Setup Saga repository/persistence configuration for EF Core.
- [ ] 30m: Run DB migrations to create the Saga persistence tables.

---

## 📅 Day 2 (6 Hours)

**Course: Basic CRUD & DI Lifetimes (2.5 hrs)**
- [ ] 30m: Implement DB Create (Insert) operation.
- [ ] 30m: Implement DB Read (Select) operations.
- [ ] 30m: Implement DB Update & Delete operations.
- [ ] 30m: Watch Dependency Injection (DI) Lifetimes videos.
- [ ] 30m: Write code comparing Transient vs Scoped vs Singleton behavior.

**FlowForge: Step Execution Pipeline (3.5 hrs)**
- [ ] 30m: Setup a `System.Threading.Channels` infrastructure class.
- [ ] 30m: Create a generic `StepExecutionMessage` to pass into the channel.
- [ ] 30m: Implement the Channel Publisher (Producer).
- [ ] 30m: Implement the BackgroundService (Consumer) that reads from the channel.
- [ ] 30m: Wire up the consumer to trigger dummy execution logic.
- [ ] 30m: Connect `WorkflowStateMachine` to push messages to the Channel.
- [ ] 30m: Write a quick unit/integration test to verify channel throughput.

---

## 📅 Day 3 (6 Hours)

**Course: Services & Options Pattern (2 hrs)**
- [ ] 30m: Practice registering custom services in the DI container.
- [ ] 30m: Implement interface-based loose coupling in a controller.
- [ ] 30m: Create a strongly-typed configuration class (Options pattern).
- [ ] 30m: Bind `appsettings.json` section to your strongly-typed class.

**FlowForge: API CRUD & Execution Endpoints (4 hrs)**
- [ ] 30m: Setup controllers/Minimal APIs in `DefinitionService`.
- [ ] 30m: Implement POST endpoint to create a Workflow Definition.
- [ ] 30m: Implement GET endpoints (Get all, Get by ID).
- [ ] 30m: Implement PUT/DELETE endpoints for Definitions.
- [ ] 30m: Setup controllers/Minimal APIs in `OrchestrationEngine`.
- [ ] 30m: Implement POST endpoint to trigger a workflow execution.
- [ ] 30m: Connect the trigger endpoint to start the MassTransit state machine.
- [ ] 30m: Test all endpoints end-to-end using Postman/Swagger.

---

## 📅 Day 4 (6 Hours)

**Course: Config Sources & Middleware (2 hrs)**
- [ ] 30m: Practice overriding config with Environment Variables.
- [ ] 30m: Read/watch introduction to the ASP.NET Core Middleware pipeline.
- [ ] 30m: Experiment with re-ordering built-in middleware.
- [ ] 30m: Write a basic inline `app.Use()` custom middleware.

**FlowForge: Frontend API Integration (4 hrs)**
- [ ] 30m: Spin up the React frontend & verify Vite runs.
- [ ] 30m: Install `axios` or configure `fetch` for API calls.
- [ ] 30m: Create an API service file for Workflow Definitions.
- [ ] 30m: Fetch mock/real definitions and render a basic list in the UI.
- [ ] 30m: Create a detailed view for a single Workflow Definition.
- [ ] 30m: Initialize the React Flow canvas inside the detailed view.
- [ ] 30m: Write a parser to map backend node JSON to React Flow format.
- [ ] 30m: Dynamically render nodes and edges on the React Flow canvas.

---

## 📅 Day 5 (6 Hours)

**Course: Custom Middleware & Minimal APIs (2.5 hrs)**
- [ ] 30m: Build a dedicated custom middleware class for Request Logging.
- [ ] 30m: Inject services (like ILogger) into your custom middleware.
- [ ] 30m: Watch introduction to Minimal APIs vs Controllers.
- [ ] 30m: Build 2 GET endpoints using Minimal APIs.
- [ ] 30m: Build a POST endpoint mapping to a DTO using Minimal APIs.

**FlowForge: State Saving & HTTP Executor (3.5 hrs)**
- [ ] 30m: Implement a "Save" button in the React Flow UI.
- [ ] 30m: Write a parser to map React Flow state back to backend JSON.
- [ ] 30m: Call the PUT endpoint to save the modified workflow to the DB.
- [ ] 30m: Backend: Scaffold a `HttpNodeExecutor` class.
- [ ] 30m: Setup `HttpClientFactory` in the `OrchestrationEngine`.
- [ ] 30m: Implement logic to parse URL, Method, and Headers from node config.
- [ ] 30m: Execute real HTTP requests from the `HttpNodeExecutor`.

---

## 📅 Day 6 (6 Hours)

**Course: Error Handling & Final Practice (2.5 hrs)**
- [ ] 30m: Watch/Read about global exception handling.
- [ ] 30m: Implement `UseExceptionHandler` or a custom exception middleware.
- [ ] 30m: Format standardized JSON error responses.
- [ ] 30m: Start the final module practice project/quiz.
- [ ] 30m: Complete the final module practice project/quiz.

**FlowForge: Complex Nodes & UI Panels (3.5 hrs)**
- [ ] 30m: Backend: Scaffold a `ConditionalNodeExecutor`.
- [ ] 30m: Implement logic to evaluate basic IF/ELSE conditions on payloads.
- [ ] 30m: Update the Pipeline to route flow based on Conditional outputs.
- [ ] 30m: Frontend: Build a sliding property panel (sidebar) for nodes.
- [ ] 30m: Wire up the panel to open when a node is clicked.
- [ ] 30m: Add form inputs to the panel to edit node-specific settings (e.g., URL for HTTP node).
- [ ] 30m: Sync property panel changes back to the React Flow node state.

---

## 📅 Day 7 (6 Hours)

**Course: Wrap-Up (1 hr)**
- [ ] 30m: Final review of all course materials.
- [ ] 30m: Claim the Coursera certificate! 🎉

**FlowForge: End-to-End Test & Polish (5 hrs)**
- [ ] 30m: Launch the full stack (Gateway, Definition, Orchestration, Frontend, DB, RabbitMQ).
- [ ] 30m: Create a brand new workflow from the UI (HTTP Node -> Conditional).
- [ ] 30m: Save the workflow and trigger execution.
- [ ] 30m: Monitor logs to verify the HTTP Node executed.
- [ ] 30m: Monitor logs to verify the Conditional Node evaluated correctly.
- [ ] 30m: Fix any bugs discovered during End-to-End testing.
- [ ] 30m: Refine Docker Compose file (ensure correct start order/healthchecks).
- [ ] 30m: Clean up unused code and console logs.
- [ ] 30m: Update `PROGRESS.md` to mark all Phases as 100% complete.
- [ ] 30m: Final GitHub commit and push. Project Complete! 🚀
