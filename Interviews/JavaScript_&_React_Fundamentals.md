# JavaScript & React Fundamentals — Interview Prep

> **How to use this file:** These are the core front-end interview questions that focus on *how* JavaScript and React work under the hood. For each concept, read the code example, understand what it prints and *why*, and practice the interview answer.

---

## 1. Hoisting (`var` vs `let` vs `const`)

### What it is
JavaScript moves variable and function **declarations** to the top of their scope before code execution. It does **not** move the initialization (the value assignment).

### The Classic Interview Question
```javascript
console.log(x); // Output: undefined
var x = 5;
console.log(x); // Output: 5
```

**Why does this happen?**
Because of hoisting, JavaScript interprets the code like this:
```javascript
var x;          // The declaration is hoisted to the top. It has no value yet.
console.log(x); // 'x' exists, but is undefined.
x = 5;          // The assignment stays where it was.
console.log(x); // 5
```

### The Fix (`let` and `const`)
Variables declared with `let` and `const` are *also* hoisted, but they are placed in a "Temporal Dead Zone" (TDZ). You cannot access them before the line where they are declared.

```javascript
console.log(y); // Output: ReferenceError: Cannot access 'y' before initialization
let y = 10;
```

### Interview Answer
> *"Hoisting is JavaScript's default behavior of moving declarations to the top of the current scope before execution. For variables declared with `var`, the declaration is hoisted and initialized with `undefined`, which is why logging them before assignment doesn't throw an error. Variables declared with `let` and `const` are also hoisted, but they remain in a 'temporal dead zone' until their line of code is executed, so trying to access them early throws a ReferenceError. This makes `let` and `const` much safer to use."*

---

## 2. Preventing React Re-renders (`React.memo` vs `useMemo` vs `useCallback`)

### What it is
By default, when a parent component re-renders, **all** of its child components re-render. You use memoization to tell React: "Skip rendering this if the inputs haven't changed."

### The Three Tools

| Tool | What it memoizes (caches) | Where you use it |
|:---|:---|:---|
| **`React.memo`** | A whole **Component** | Wrap the child component function |
| **`useMemo`** | A **Computed Value** (like an array or result of a calculation) | Inside a component |
| **`useCallback`** | A **Function** | Inside a component |

### The Classic Interview Question
*"When passing props from a parent to a child, what happens? How do we avoid unnecessary re-renders?"*

```jsx
// ❌ WITHOUT MEMOIZATION
// If Parent state changes, Child re-renders, even if 'name' didn't change!
function Parent() {
  const [count, setCount] = useState(0); // changing this causes Child to render
  const name = "Alice"; 
  return <Child name={name} />
}

// ✅ WITH React.memo
// Child ONLY re-renders if 'name' actually changes
const Child = React.memo(function Child({ name }) {
  console.log("Child rendered");
  return <div>{name}</div>;
});
```

### The Function Prop Trap (`useCallback`)
If you pass a function to a memoized child, the child will **still** re-render every time unless you use `useCallback`.
Why? Because every time the parent renders, it creates a *brand new function in memory*. React compares the old function to the new function, sees they are different references, and forces the child to render.

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // ✅ Wrap the function in useCallback so it keeps the same memory address across renders
  const handleClick = useCallback(() => {
    console.log("Clicked");
  }, []); // [] = never recreate this function

  // Now React.memo on the Child will actually work!
  return <Child onClick={handleClick} />
}
```

### Interview Answer
> *"By default, when a parent component re-renders, all of its children re-render. To prevent this, we can wrap the child component in `React.memo`, which tells React to skip rendering if the props haven't changed. However, if we are passing an object, array, or function as a prop, we also need to memoize those values in the parent using `useMemo` for data or `useCallback` for functions. Otherwise, the parent will create a new reference in memory on every render, and the child's `React.memo` will think the prop changed."*

---

## 3. `==` vs `===` (Equality)

### What it is
- `==` (Loose Equality): Compares values **after** attempting to convert them to the same type (Type Coercion).
- `===` (Strict Equality): Compares values **and** types. No conversion happens.

### Examples
```javascript
5 == "5"   // true  (JavaScript converts the string "5" to a number first)
5 === "5"  // false (Number vs String — types don't match)

0 == false // true
0 === false // false

null == undefined // true
null === undefined // false
```

### Interview Answer
> *"The double equals (`==`) performs loose equality comparison, meaning it will attempt type coercion if the types are different — for example, it will convert a string '5' to a number before comparing it to the number 5, returning true. The triple equals (`===`) performs strict equality comparison, meaning it checks both the value and the type without any coercion. In modern JavaScript, we almost always use triple equals to avoid unexpected bugs caused by type coercion."*

---

## 4. Closures

### What it is
A closure is a function that "remembers" the variables from the scope where it was created, even after that outer function has finished running.

### The Code
```javascript
function createCounter() {
  let count = 0; // This variable is "trapped" by the inner function

  return function() {
    count++;
    return count;
  };
}

const counterA = createCounter();
console.log(counterA()); // 1
console.log(counterA()); // 2

// Even though createCounter() finished running, counterA still has access to 'count'.
```

### Why it matters in React
React Hooks (like `useEffect`) rely heavily on closures. The "Stale Closure Trap" happens when a `useEffect` captures an old version of a state variable and doesn't get updated because the dependency array was empty.

### Interview Answer
> *"A closure is created when a function is defined inside another function, allowing the inner function to retain access to the outer function's variables even after the outer function has returned. It's essentially a function bundled together with its lexical environment. In React, we see closures all the time inside `useEffect` or event handlers; if we don't manage our dependency arrays correctly, we can encounter 'stale closures' where the function is holding onto an outdated snapshot of state."*

---

## 5. The `this` Keyword

### What it is
In JavaScript, `this` refers to the object that is currently executing the function. But *how* the function is called determines what `this` is.

### The Rules
1. **Method Call:** If called on an object (`user.greet()`), `this` is the object.
2. **Global/Simple Call:** If called normally (`greet()`), `this` is the global window object (or `undefined` in strict mode).
3. **Arrow Functions:** Arrow functions **do not have their own `this`**. They inherit `this` from the surrounding code where they were defined.

### The Code
```javascript
const user = {
  name: "Alice",
  greet: function() {
    console.log("Hello, " + this.name);
  },
  greetArrow: () => {
    // ❌ Fails: Arrow functions don't bind 'this' to the user object
    console.log("Hello, " + this.name); 
  }
};

user.greet();      // "Hello, Alice" (this = user)
user.greetArrow(); // "Hello, undefined" (this = window/global)
```

### Interview Answer
> *"The value of `this` in JavaScript depends on how a function is called, not where it's written. If a function is called as a method of an object, `this` refers to that object. However, arrow functions behave differently; they do not have their own `this` binding. Instead, they inherit `this` lexically from their surrounding scope at the time they are defined. This makes arrow functions perfect for callbacks, like array map methods or React event handlers, where you want to preserve the context of the surrounding class or component."*

---

## 6. Array Methods: `.map`, `.filter`, `.reduce`

### What they are
They are non-mutating (immutable) array methods. They return a **new** array without changing the original array. This is critical for React state updates.

### Examples

**1. `.map()` — Transform every item**
Use it when you want to convert an array of X into an array of Y (same length).
```javascript
const numbers = [1, 2, 3];
const doubled = numbers.map(num => num * 2);
// doubled: [2, 4, 6]
```
*React Use Case:* Rendering a list of items (`items.map(item => <li key={item.id}>{item.name}</li>)`)

**2. `.filter()` — Keep only matching items**
Use it when you want a smaller array based on a condition.
```javascript
const tasks = [{ done: true }, { done: false }];
const pending = tasks.filter(task => task.done === false);
// pending: [{ done: false }]
```
*React Use Case:* Deleting an item from state (`setTasks(tasks.filter(t => t.id !== idToRemove))`)

**3. `.reduce()` — Boil an array down to a single value**
Use it when you need to calculate a total, find a max, or group items.
```javascript
const prices = [10, 20, 30];
// accumulator (acc) keeps a running total. Starts at 0.
const total = prices.reduce((acc, current) => acc + current, 0); 
// total: 60
```

### Interview Answer
> *"`map`, `filter`, and `reduce` are higher-order array methods that are essential for declarative programming and working with React state, because they do not mutate the original array — they return a new one. `map` transforms each element and returns an array of the same length, perfect for rendering JSX lists. `filter` returns a new, shorter array containing only elements that pass a condition, useful for deleting items from state. `reduce` iterates over the array to accumulate a single resulting value, like calculating a total sum or grouping an array of objects."*

---

## 7. Event Loop and Async/Await

### What it is
JavaScript is **single-threaded**, meaning it can only do one thing at a time. The Event Loop is how JavaScript handles asynchronous tasks (like fetching data or timers) without freezing the entire page.

### How it works
1. **Call Stack:** Where your normal, synchronous code runs.
2. **Web APIs:** When you call `setTimeout` or `fetch()`, JavaScript hands the work off to the browser (Web APIs) and keeps running the next line of code.
3. **Task Queue / Microtask Queue:** When the timer finishes or the data arrives, the callback function is pushed to a queue.
4. **Event Loop:** The Event Loop constantly checks: *"Is the Call Stack empty?"* If yes, it grabs the first task from the queue and pushes it onto the Call Stack to run.

### The Code
```javascript
console.log("1");

setTimeout(() => {
  console.log("2"); // Web API timer. Goes to Task Queue.
}, 0);

Promise.resolve().then(() => {
  console.log("3"); // Promise. Goes to Microtask Queue (higher priority).
});

console.log("4");

// Output: 1, 4, 3, 2
```

### Interview Answer
> *"Because JavaScript is single-threaded, it uses the Event Loop for non-blocking asynchronous operations. When an async operation like a network request or timer is initiated, it's handed off to the browser's Web APIs. Once finished, the callback is placed in a queue — either the microtask queue for Promises, or the macrotask queue for things like `setTimeout`. The Event Loop continuously monitors the main call stack, and when the stack is completely empty, it takes the next callback from the queue and pushes it onto the stack to execute. Microtasks always have priority over macrotasks."*
