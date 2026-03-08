# facil.js

**facil.js** is a lightweight, developer-centric JavaScript library designed to simplify common web development tasks. It eliminates boilerplate code for DOM manipulation, state management, routing, form validation, and UI interactions, allowing you to focus on building features.

## 🚀 Features

- **DOM Manipulation**: jQuery-like syntax for selecting and modifying elements.
- **Event Bus**: Simple Pub/Sub system for global communication between components.
- **UI Utilities**: Built-in Skeleton Loading and Global Progress Bar.
- **HTTP Client**: Wrapper around `fetch` with automatic loading indicators.
- **Form Validation**: Declarative validation rules (e.g., `required|email|min:3`).
- **Reactivity**: Simple two-way data binding (`f-model`, `f-text`) using Proxies.
- **SPA Router**: Client-side routing with support for HTML templates and dynamic fetching.
- **Dark Mode**: One-line dark mode toggle with persistence.

## 📦 Installation

Simply import the library into your project.

```javascript
import { Facil } from './dist/facil.min.js';
```

## 📚 Documentation & Usage

### 1. DOM Manipulation
Chainable methods to manipulate DOM elements easily.

```javascript
// Select, change HTML, add classes, and listen to events
Facil.dom('#my-button').on('click', () => {
    Facil.dom('#content')
        .html('Hello World!')
        .addClass('active')
        .css({ color: 'red' });
});
```

### 2. Global Events (Pub/Sub)
Decouple your components using the global event bus.

```javascript
// Listen for an event
Facil.events.on('user-login', (data) => {
    console.log('User logged in:', data);
});

// Emit an event
Facil.events.emit('user-login', { id: 1, name: 'John' });
```

### 3. UI Utilities

#### Skeleton Loading
Automatically apply a shimmer effect to text and images within a container to indicate loading.

```javascript
// Turn on skeleton loading
Facil.ui.skeleton('#card-container', true);

// Turn off skeleton loading
Facil.ui.skeleton('#card-container', false);
```

#### Global Loader
Manually control the top progress bar (automatically used by the HTTP module).

```javascript
Facil.ui.loading.show();
Facil.ui.loading.hide();
```

### 4. HTTP Requests
A `fetch` wrapper that integrates with the Global Loader automatically.

```javascript
// GET request (loader appears automatically)
const users = await Facil.http.get('https://api.example.com/users');

// POST request
await Facil.http.post('https://api.example.com/users', { name: 'Jane' });

// Custom request without loader (pass false as last argument)
await Facil.http.request('https://api.example.com/data', 'GET', null, false);
```

### 5. Form Validation
Validate forms using a string-based rule syntax.

**Available Rules:** `required`, `email`, `min:n`, `max:n`, `number`, `url`, `match:field`.

```javascript
Facil.dom('#my-form').on('submit', (e) => {
    e.preventDefault();

    const result = Facil.form.validate('#my-form', {
        username: 'required|min:3',
        email: 'required|email',
        password: 'required|min:6',
        confirm_password: 'required|match:password'
    });

    if (!result.isValid) {
        console.log(result.errors); // { username: "The username field must be..." }
    } else {
        console.log(result.data); // JSON object of form data
    }
});
```

### 6. Reactivity (State Management)
Create a reactive state that updates the DOM automatically.

**HTML:**
```html
<div id="app">
    <h1 f-text="title"></h1>
    <input type="text" f-model="name">
    <p>Hello, <span f-text="name"></span></p>
</div>
```

**JavaScript:**
```javascript
const state = Facil.reactive('#app', {
    title: 'Welcome',
    name: 'John Doe'
});

// Updates DOM immediately when property changes
state.title = 'New Title';
```

### 7. SPA Router
Simple client-side routing for Single Page Applications.

```javascript
Facil.router.init({
    outlet: '#router-outlet',
    routes: [
        { path: '/', template: '<h1>Home</h1>' },
        { 
            path: '/about', 
            templateUrl: '/views/about.html', // Fetches HTML file
            onLoad: () => console.log('About page loaded')
        },
        { path: '*', template: '<h1>404 - Not Found</h1>' }
    ]
});
```

### 8. Dark Mode
Initialize and toggle dark mode with local storage persistence.

```javascript
// Initialize (checks system preference or localStorage)
Facil.darkMode.init();

// Toggle theme
Facil.dom('#theme-btn').on('click', () => {
    Facil.darkMode.toggle();
});
```

## 📄 License

MIT