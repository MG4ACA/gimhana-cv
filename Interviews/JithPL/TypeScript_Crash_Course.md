# TypeScript Crash Course for Interviews

Since you don't have much TypeScript knowledge yet, this guide gives you the absolute essentials to survive a Node.js/React technical interview.

## 1. What is TypeScript?
It's just JavaScript with **static typing**. 
In regular JS, a variable can be a number, then a string, then an array. In TS, you define the "shape" of data upfront. If you try to break that shape, your code editors throw a red error *before* you even run the code.

**Why enterprises love it:** It prevents runtime crashes (like the infamous `Cannot read properties of undefined`) and makes large codebases much easier to maintain and refactor.

## 2. Core Concepts You Must Know

### A. Types & Interfaces (The "Shapes")
An `Interface` describes the shape of an object. You use it to define what a database model or a React Prop should look like.

```typescript
// 1. Define the shape
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean; // The '?' means this property is optional
}

// 2. Use the shape
const newUser: User = {
  id: 1,
  name: "Gimhana",
  email: "mg4.aca@gmail.com"
  // If I spell 'email' wrong, or forget 'name', TypeScript throws an error!
};
```

### B. Function Signatures
In TS, you define what a function *takes in* (parameters) and what it *spits out* (return type).

```typescript
// (a: number, b: number) -> parameters
// : number -> return type
function calculateTotal(price: number, tax: number): number {
    return price + tax;
}

// If someone calls calculateTotal("100", 5), TS blocks it.
```

### C. Generics (`<T>`) — The "Fill in the Blank" Type
This is the hardest concept but very common in enterprise code. A Generic is a type variable. It allows you to write a function or class that works with ANY type, but stays strictly typed once you choose the type.

**Example: A generic API response**
```typescript
interface ApiResponse<T> {
  status: number;
  data: T; // 'T' is a placeholder. It will be whatever we pass in!
}

// When fetching users, we plug 'User[]' into T
const userResponse: ApiResponse<User[]> = {
  status: 200,
  data: [{ id: 1, name: "Gimhana", email: "g@test.com" }]
};

// When fetching a single product, we plug 'Product' into T
const productResponse: ApiResponse<Product> = {
  status: 200,
  data: { id: 99, title: "Laptop", price: 1000 }
};
```

## 3. How to talk about it in the interview
If they ask: *"What is your experience with TypeScript?"*

**Your Answer:**
> *"I have used it on personal projects and understand the core mechanics—defining Interfaces for data models, typing function signatures, and using Generics for reusable components like API wrappers. Coming from a C#/.NET background, statically typed languages are my natural habitat, so picking up advanced TypeScript patterns for Node.js is very straightforward for me. I prefer it over vanilla JS because catching type errors at compile time saves hours of debugging in production."*
