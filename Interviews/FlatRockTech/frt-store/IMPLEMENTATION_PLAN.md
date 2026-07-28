# FRT Store — Implementation Plan
## E-Commerce Frontend Assignment — Flat Rock Technology

---

## Overview

A front-end e-commerce application built with Vue 3 and TypeScript.
The application consumes a provided REST API (Node.js backend running on port 3010)
and implements a product listing page, product detail page, cart functionality, and checkout.

---

## Goals

- Build a clean, maintainable, production-quality Vue 3 frontend
- Demonstrate TypeScript proficiency and type safety throughout
- Follow standard software development practices (SDLC, SOLID, DRY, separation of concerns)
- Deliver Stage I and Stage II as fully working and bug-free
- Deliver Stage III if time permits

---

## Tech Decisions

**Framework: Vue 3 with Composition API**
Chosen because it is the specified framework in the brief.
Composition API selected over Options API for better logic organisation, easier reuse via composables,
and cleaner TypeScript integration.

**Build Tool: Vite**
Standard, fast build tool for Vue 3 projects. Chosen for development speed and official support.

**Language: TypeScript**
Types copied directly from the provided backend repository types/ directory to ensure alignment
between frontend and backend data contracts.

**State Management: Pinia**
Officially recommended state manager for Vue 3. Used for cart state and product data,
as both need to be shared across multiple components.

**Styling: SCSS**
SCSS selected over plain CSS for better organisation across multiple components.
Variables, mixins and partials keep styling consistent and maintainable.

**HTTP: Native fetch**
No external HTTP library used — native fetch is sufficient for the scope of this project.

**AI Tooling**
Antigravity (Google DeepMind AI coding assistant) was used during planning and setup phases
as a development tool — similar to using GitHub Copilot.

---

## Architecture Decisions

**Services Layer**
All API calls are centralised in src/services/api.ts.
No component directly calls fetch(). This keeps components focused on presentation
and makes the API contract easy to change in one place.

**Composables for Business Logic**
Filter and sort logic is extracted into src/composables/useFilters.ts.
This is a computed transformation over the products store — the source data is never mutated.

**Cart Key Strategy**
Each cart item is uniquely identified by productId + selectedOptionValue.
This means the same product with different options appears as separate cart entries,
which matches the brief requirement.

**Client-Side Filtering**
All filtering (category, brand, price range, sort) is done client-side on the already-fetched product list.
The full product list is fetched once on page load.

**Product Images**
The backend API does not include image URLs in any product field.
A placeholder image service (https://placehold.co) is used as a stand-in.
This was a deliberate decision noted at the planning stage — the architecture supports
swapping in real image URLs from a CDN or CMS field with a one-line change.

**Parallel Data Fetching**
On page load, products, brands, and categories are fetched simultaneously using Promise.all.
This avoids sequential waterfall requests and reduces total load time to the slowest single request.

---

## Feature Breakdown

### Stage I — Core E-Commerce Flow
- Product listing page with 4-column product grid
- Category tab filter (All, Shoes, Shirts)
- Brand multi-select filter dropdown
- Sort by dropdown (Release Date Desc/Asc, Price Asc)
- Product detail page with option selector
- Stock availability display (in stock / out of stock)
- Add to cart with mandatory option validation
- Cart dropdown (no qty management)
- Toast notifications for cart actions

### Stage II — Enhanced Functionality
- Price range filter (range slider)
- Quantity management in cart dropdown
- Quick add to cart icon on product cards
- Option selection modal for quick add (when product has options)

### Stage III — Checkout
- Checkout form (Name, Surname, Phone, Email, Zip Code)
- Client-side form validation
- POST to /checkout endpoint
- Error handling for API failures (20% random failure rate per brief)
- Success confirmation and cart clear

---

## Git Workflow

Branches used:
- main — stable, production-ready code
- develop — integration branch
- feature/* — individual feature branches, merged into develop

Commits follow conventional commit format:
feat: / fix: / chore: / style: / refactor:

---

## What Was Not Implemented (if applicable)

This section will be updated on submission to list any stages not completed,
with a brief honest reason for each.

Example format:
- Stage III Checkout: Not completed due to time constraints.
  Core e-commerce flow (Stage I + II) was prioritised as the primary deliverable.
