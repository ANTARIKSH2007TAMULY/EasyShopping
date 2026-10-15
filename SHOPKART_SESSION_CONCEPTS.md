# ShopKart Session Concepts

This guide explains the actual code that exists in the ShopKart project and the syntax, architecture, and patterns used during the implementation and styling session.

## 1. Project structure and request flow

### Concept: Backend server bootstrap
- Where it appears: `backend/index.js` -> `startServer`
- Syntax: `const app = express();`, `app.use(...)`, `await mongoose.connect(...)`, `app.listen(PORT)`
- Explanation: Express creates the HTTP server. Middleware is applied before routes, and the database connection is opened before the server starts accepting requests.
- Why it is used: This keeps the API modular and lets the server start only after MongoDB is reachable.
- Example: `app.use('/customers', customerRoutes);` means requests like `/customers/login` are forwarded to the customer router.
- Viva question: Why does the backend call `mongoose.connect()` before listening for requests? Because the app depends on MongoDB for authentication, products, carts, and orders.

### Concept: Request flow from browser to database
- Where it appears: `frontend/src/services/api.js` -> `api`, `frontend/src/context/CartContext.jsx` -> `fetchCart`, `backend/controllers/cart.controller.js` -> `getCart`
- Syntax: `api.get('/cart')` -> Express route -> controller -> `Customer.findById(...).populate(...)`
- Explanation: The frontend sends an HTTP request to the backend. The route matches the URL, middleware runs, controller reads data, MongoDB returns documents, and the response is sent back to the browser.
- Why it is used: The app separates UI, API logic, and database logic.
- Example: The navbar calls `/customers/me`, then the `authMiddleware` reads the cookie and attaches the authenticated customer to `req.user`.
- Viva question: What is the difference between frontend data and server data? The frontend shows UI state; the backend is the trusted source for user accounts, carts, and orders.

### Concept: Route grouping by feature
- Where it appears: `backend/routes/customer.routes.js`, `backend/routes/cart.routes.js`, `backend/routes/order.routes.js`
- Syntax: `router.post('/login', loginCustomer)`, `router.get('/me', authMiddleware, getCurrentCustomer)`
- Explanation: Each route file handles one domain of the API. This keeps request handling readable and easier to maintain.
- Why it is used: It separates concerns and makes it easy to add more API endpoints later.
- Example: `/orders/create-payment-order` is handled by `createPaymentOrder`, while `/customers/register` belongs to registration logic.
- Viva question: Why are routes split into separate files? Because a large application is easier to manage when related endpoints are grouped together.

## 2. JavaScript syntax used in the project

### Concept: `const` and `let`
- Where it appears: `frontend/src/pages/Checkout.jsx` -> `const initialForm = {...}`, `const [shipping, setShipping] = useState(initialForm)`
- Syntax: `const value = ...;`, `let something = ...;`
- Explanation: `const` means the variable cannot be reassigned to a new reference. `let` allows reassignment. In this project, `const` is used for stable configuration values and `let` is used less often because the app prefers `const` plus state setters.
- Why it is used: It makes the code easier to reason about and reduces accidental mutation.
- Example: `const totalItems = useMemo(() => ..., [cartItems]);` stores the computed value.
- Viva question: When should you use `const` instead of `let`? Use `const` for values that should not change after declaration.

### Concept: Arrow functions
- Where it appears: `frontend/src/context/CartContext.jsx` -> `fetchCart = useCallback(async () => {...})`, `backend/controllers/customer.controller.js` -> `const isValidEmail = (email) => ...`
- Syntax: `const fn = (param) => { ... }`
- Explanation: Arrow functions are shorter syntax for function expressions. They also keep lexical `this` behavior, though this app mainly uses them for callbacks and handlers.
- Why it is used: They are common in React and Express code for concise event handlers and async logic.
- Example: `const handlePlaceOrder = async () => { ... }` in `Checkout.jsx`.
- Viva question: Why are arrow functions useful in event handlers? They make the function definition short and easy to pass directly to `onClick` or `onChange`.

### Concept: Function parameters and return values
- Where it appears: `backend/utils/generateToken.js` -> `generateToken = (id) => { ... }`, `frontend/src/components/Navbar.jsx` -> `isActive = (path) => { ... }`
- Syntax: `function name(param) { return value; }` or `const fn = (param) => value`
- Explanation: Parameters are inputs to the function. A return value is what the function sends back to the caller.
- Why it is used: The app uses helpers to keep logic reusable and clean.
- Example: `generateToken(id)` returns a signed JWT string.
- Viva question: What is the purpose of a return statement? It gives the caller a result from the function.

### Concept: Template literals and `${}`
- Where it appears: `frontend/src/pages/Checkout.jsx` -> form-error strings, `frontend/src/components/Navbar.jsx` -> `aria-label` strings, `backend/controllers/order.controller.js` -> `success_url: ...`
- Syntax: `` `text ${expression}` ``
- Explanation: Template literals allow JavaScript expressions inside strings. They are easier to read than string concatenation.
- Why it is used: They are useful for generating dynamic messages and URL strings.
- Example: `` `${baseUrl}/order-success/${order._id}?session_id={CHECKOUT_SESSION_ID}` ``
- Viva question: Why are template literals preferred for dynamic text? They keep the string and variables together and reduce manual concatenation.

### Concept: Object and array destructuring
- Where it appears: `backend/controllers/cart.controller.js` -> `const { productId } = req.params;`, `backend/controllers/order.controller.js` -> `const { shopKartOrderId, sessionId } = req.body;`, `frontend/src/pages/Checkout.jsx` -> `const { cartItems, loading, error: cartError, fetchCart } = useCart();`
- Syntax: `const { prop } = object;` and `const [a, b] = array;`
- Explanation: Destructuring extracts values from objects or arrays into named variables. It reduces repeated property access and makes code read cleanly.
- Why it is used: Many requests and React hooks return objects with multiple fields.
- Example: `const { fullName, email } = req.user;`
- Viva question: What does `const { productId } = req.params;` do? It takes only the `productId` property from the `req.params` object.

### Concept: Spread syntax `...`
- Where it appears: `frontend/src/pages/Checkout.jsx` -> `setShipping((current) => ({ ...current, [field]: value }));`
- Syntax: `...object` or `...array`
- Explanation: Spread copies items from an existing object or array into a new one. This prevents overwriting unrelated fields when updating state.
- Why it is used: State updates in React often need to keep previous values and change only one property.
- Example: `{ ...current, [field]: value }` keeps all previous form values and replaces one field.
- Viva question: Why is spread useful in React state updates? It prevents the old state from being lost when a single field is changed.

### Concept: Rest parameters
- Where it appears: Not heavily used in this project; but `new URLSearchParams(searchParams)` and `Object.entries(shipping)` are common patterns.
- Syntax: `function fn(...args) {}`
- Explanation: Rest collects remaining arguments into an array.
- Why it is used: This is useful when a function should accept any number of values.
- Example: A function with rest parameters is not a central pattern in ShopKart, so the project mostly relies on standard parameter objects and arrays.
- Viva question: If rest is not present here, what is used instead? The project mostly uses arrays and objects directly rather than variable-length parameter lists.

### Concept: Array and object methods
- Where it appears: `frontend/src/context/CartContext.jsx` -> `reduce()`, `backend/controllers/cart.controller.js` -> `find()`, `filter()`, `some()`, `backend/controllers/order.controller.js` -> `map()`, `filter()`
- Syntax: `array.map(...)`, `array.filter(...)`, `array.find(...)`, `array.reduce(...)`
- Explanation: These methods transform or inspect arrays without writing manual loops.
- Why it is used: They simplify common ecommerce logic like total calculations, filtering carts, and checking stock.
- Example: `customer.cart.filter((item) => item.product.toString() !== productId)` removes an item from the user's cart.
- Viva question: How does `filter()` differ from `find()`? `find()` returns the first matching element; `filter()` returns all matches.

### Concept: Optional chaining and nullish coalescing
- Where it appears: `frontend/src/context/CartContext.jsx` -> `err.response?.status === 401`, `frontend/src/pages/Checkout.jsx` -> `product?.price`, `backend/controllers/order.controller.js` -> `session?.metadata?.orderId`
- Syntax: `obj?.prop`, `value ?? fallback`
- Explanation: Optional chaining prevents crashes when a nested property does not exist. Nullish coalescing keeps `0` and empty strings while replacing `null` or `undefined` with a fallback value.
- Why it is used: This makes API response handling safer and avoids surprising runtime errors.
- Example: `err.response?.data?.message` safely reads a nested server message without throwing if the backend response shape is different.
- Viva question: What happens if `response.data` is missing? Optional chaining prevents the code from crashing.

### Concept: Logical operators and ternary operators
- Where it appears: `frontend/src/components/Navbar.jsx` -> `className={... ? 'active' : ''}`; `backend/index.js` -> `.filter(Boolean)`; `frontend/src/components/ProductCard.jsx` -> `product.stock > 0 ? ... : ...`
- Syntax: `&&`, `||`, `!`, `condition ? value1 : value2`
- Explanation: Logical operators help combine conditions; ternary operators choose one of two values based on a boolean check.
- Why it is used: React decides which CSS class to apply; backend code decides whether a request should continue or return an error.
- Example: `product.stock > 0 ? 'In Stock' : 'Out of Stock'`
- Viva question: How is `&&` different from `||`? `&&` means both sides must be truthy; `||` chooses the first truthy value or the final one.

### Concept: Async/await and Promise handling
- Where it appears: `frontend/src/context/CartContext.jsx` -> `await api.get('/cart')`, `backend/controllers/customer.controller.js` -> `await bcrypt.compare(...)`
- Syntax: `async function fn() { const result = await promise; }`
- Explanation: `async` makes a function return a Promise automatically, and `await` pauses execution until the Promise resolves.
- Why it is used: It makes asynchronous tasks like API calls and DB operations read like normal sequential code.
- Example: `const customer = await Customer.findOne({ email });` in login logic.
- Viva question: What would happen without `await` here? The code would get a Promise instead of the final data object.

### Concept: `try`, `catch`, and `finally`
- Where it appears: `backend/controllers/customer.controller.js`, `backend/controllers/order.controller.js`, `frontend/src/context/CartContext.jsx`
- Syntax: `try { ... } catch (error) { ... } finally { ... }`
- Explanation: `try` contains code that may fail, `catch` handles the error, and `finally` runs no matter what.
- Why it is used: This ensures the app does not crash and gives user-friendly messages.
- Example: `fetchCart` sets loading false in `finally` even if the request fails.
- Viva question: Why is `finally` useful? It allows cleanup logic like stopping loaders or resetting flags.

### Concept: ES modules: `import` and `export`
- Where it appears: `backend/index.js`, `frontend/src/App.jsx`, `backend/controllers/customer.controller.js`
- Syntax: `import X from 'y';`, `export const fn = ...`, `export default Component`
- Explanation: JavaScript modules share code between files. Named exports are imported with `{ name }`; default exports can be imported without braces.
- Why it is used: This project is split across many files and modules.
- Example: `import api from '../services/api';` and `export default api;`
- Viva question: Why are modules used in a real project? They keep code organised and reusable.

## 3. React components, JSX, state, and hooks

### Concept: Functional components
- Where it appears: `frontend/src/App.jsx` -> `App`, `frontend/src/components/Navbar.jsx` -> `Navbar`, `frontend/src/pages/Checkout.jsx` -> `Checkout`
- Syntax: `function ComponentName() { return <div />; }`
- Explanation: A functional component is a JavaScript function that returns JSX.
- Why it is used: It is the standard React pattern in modern React applications.
- Example: `function Navbar() { ... return (...) }`
- Viva question: Why are components useful? They let you split UI into reusable, testable sections.

### Concept: JSX and embedded expressions
- Where it appears: `frontend/src/components/ProductCard.jsx`, `frontend/src/pages/Products.jsx`
- Syntax: `<h1>{product.name}</h1>`
- Explanation: JSX looks like HTML, but inside `{}` you can write JavaScript. This is how React renders dynamic values.
- Why it is used: The user interface needs to show changing data, like product names, prices, and state.
- Example: `<span className={category === cat ? 'active' : ''}>` toggles a CSS class conditionally.
- Viva question: What does `{}` mean in JSX? It opens JavaScript evaluation inside the HTML-like syntax.

### Concept: Props
- Where it appears: `frontend/src/components/ProductCard.jsx` -> `function ProductCard({ product })` and uses `product` inside the component
- Syntax: `<ProductCard product={product} />`
- Explanation: Props are inputs passed from a parent component to a child.
- Why it is used: Data like a product object is shared across components without global state.
- Example: The products page renders a list of `ProductCard` components.
- Viva question: Why are props helpful? They allow reusable components to receive different data at different times.

### Concept: `useState`
- Where it appears: `frontend/src/pages/Login.jsx`, `frontend/src/components/Navbar.jsx`, `frontend/src/context/CartContext.jsx`
- Syntax: `const [value, setValue] = useState(initialValue);`
- Explanation: State stores data that can change during component lifetime. The setter schedules a re-render.
- Why it is used: Forms, errors, and cart data are all UI state.
- Example: `const [searchQuery, setSearchQuery] = useState('');` in the navbar.
- Viva question: What does the setter function do? It updates state and triggers React to re-render the component.

### Concept: `useEffect`
- Where it appears: `frontend/src/components/Navbar.jsx` -> fetch current customer, `frontend/src/pages/Products.jsx` -> fetch product list, `frontend/src/context/CartContext.jsx` -> load cart on mount
- Syntax: `useEffect(() => { ... }, [dependencies])`
- Explanation: `useEffect` runs after render. The dependency array decides when the effect reruns.
- Why it is used: It handles side effects like API calls, DOM updates, and timers.
- Example: `useEffect(() => { fetchProducts(); }, [search, category, sort]);`
- Viva question: What does the dependency array do? It tells React when to run the effect again.

### Concept: Controlled inputs
- Where it appears: `frontend/src/pages/Checkout.jsx` -> `value={shipping.fullName}` and `onChange={(e) => updateField('fullName', e.target.value)}`
- Syntax: `value={state}` and `onChange={...}`
- Explanation: The input value is driven by React state, so the React state is the source of truth.
- Why it is used: This makes form validation and submission easier.
- Example: The shipping form stores each field in a single object state.
- Viva question: Why are controlled inputs preferred for validation? They keep the UI and application state aligned.

### Concept: Rendering lists with `.map()` and `key`
- Where it appears: `frontend/src/pages/Products.jsx` -> list of category chips and product cards, `frontend/src/components/ProductCard.jsx` -> cards in catalog
- Syntax: `{items.map((item) => <Element key={item.id} />)}`
- Explanation: `.map()` loops through an array and returns JSX for each element. `key` gives React a stable identity. 
- Why it is used: It renders dynamic collections like products, categories, or order items.
- Example: `{categoryOptions.map((cat) => <button key={cat} ... />)}`
- Viva question: What happens if `key` is missing or unstable? React may re-use incorrect DOM nodes and produce weird UI behavior.

### Concept: Conditional rendering
- Where it appears: `frontend/src/components/ProductCard.jsx` -> if `product.stock === 0`, show sold-out overlay; `frontend/src/pages/Checkout.jsx` -> if `loading` or `cartError`, show other UI
- Syntax: `{condition && <Component />}` or `{condition ? <A /> : <B />}`
- Explanation: React can show or hide UI based on state and data.
- Why it is used: It handles loading, empty states, and authenticated vs guest states.
- Example: `{cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}`.
- Viva question: Why is conditional rendering important in ecommerce? It prevents empty states, invalid data, and inconsistent UI during async operations.

## 4. React Router and protected routes

### Concept: BrowserRouter and route definitions
- Where it appears: `frontend/src/App.jsx` -> `<BrowserRouter>`, `<Routes>`, `<Route>`
- Syntax: `path="/products/:id" element={<ProductDetails />}`
- Explanation: React Router keeps the app in sync with browser URLs and renders the right component for each route.
- Why it is used: It lets the storefront navigate between pages without page reloads.
- Example: `/orders/:id` loads the order details view for a specific order.
- Viva question: What is the purpose of `:id` in a route path? It creates a dynamic URL parameter that the component can read with `useParams()`.

### Concept: Navigation helpers
- Where it appears: `frontend/src/components/Navbar.jsx` -> `useNavigate()`, `navigate('/login')`, `frontend/src/pages/Login.jsx` -> `useNavigate()`
- Syntax: `const navigate = useNavigate(); navigate('/products');`
- Explanation: `navigate` lets the app programmatically move to another page.
- Why it is used: After login, logout, or successful checkout, the app navigates the user to the correct page.
- Example: `navigate('/login')` after a failed auth check.
- Viva question: When is programmatic navigation better than a link? When the redirect depends on logic, such as form submission or payment result.

### Concept: Protected / auth-dependent pages
- Where it appears: `frontend/src/pages/Products.jsx` -> `api.get('/customers/me')`, `frontend/src/pages/Checkout.jsx` -> verifyAccess effect
- Syntax: `try { await api.get('/customers/me'); } catch { navigate('/login'); }`
- Explanation: The page first checks whether the user is authenticated. If the JWT cookie is invalid or missing, the app redirects to `/login`.
- Why it is used: It prevents guests from entering protected pages.
- Example: `Checkout` loads only if the user is logged in.
- Viva question: What is the difference between frontend redirect and server-side auth check? The backend is the trusted authority; the frontend redirect is only a UX improvement.

## 5. Frontend API calls and asynchronous code

### Concept: Axios instance and credentials
- Where it appears: `frontend/src/services/api.js` -> `axios.create(...)`
- Syntax: `baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', withCredentials: true`
- Explanation: Axios creates a reusable client. `withCredentials` ensures cookies, including JWT auth cookies, are sent with cross-site or same-origin requests.
- Why it is used: The backend reads the cookie for auth and the browser must include it.
- Example: `api.get('/cart')` loads the authenticated user's cart.
- Viva question: Why is `withCredentials: true` important? Without it, the browser may omit auth cookies and the backend would treat the user as unauthenticated.

### Concept: API calls in components
- Where it appears: `frontend/src/pages/Products.jsx` -> `getProducts(params)`, `frontend/src/pages/Checkout.jsx` -> `api.post('/orders/create-payment-order', ...)`
- Syntax: `await api.get('/orders')`, `await api.post('/orders/create-payment-order', payload)`
- Explanation: Each component interacts with the backend through API functions and then updates local state based on the response.
- Why it is used: This keeps frontend logic separate from backend logic and allows dynamic UI updates.
- Example: After a checkout session is created, the browser redirects to Stripe.
- Viva question: Why do we `await` API calls? Because we need the response before updating state or navigating the user.

## 6. Express routes, middleware, and controllers

### Concept: Middleware execution order
- Where it appears: `backend/index.js` -> `app.use(cors(...))`, `app.use(express.json())`, `app.use(cookieParser())`
- Syntax: `app.use(middleware)`
- Explanation: Middleware runs in order for each request. It can inspect, mutate, or reject a request before it reaches the route handler.
- Why it is used: The backend needs CORS, JSON parsing, and cookie parsing before route logic.
- Example: Without `express.json()`, `req.body` would be undefined for JSON requests.
- Viva question: What is middleware? A function that runs between the incoming request and the final controller.

### Concept: `req`, `res`, and `next`
- Where it appears: `backend/middlewares/auth.middleware.js` -> `authMiddleware` and `backend/controllers/cart.controller.js` -> route handlers
- Syntax: `(req, res, next) => { ... }`
- Explanation: `req` contains incoming request information, `res` sends the response, and `next` passes control to the next middleware or route handler.
- Why it is used: Authentication middleware reads the JWT cookie, validates it, attaches `req.user`, and passes control forward.
- Example: `next();` continues the request flow only after a valid authenticated user is found.
- Viva question: Why is `return` used before sending a response? It stops the function immediately so the request cannot continue to the next logic path.

### Concept: Controller functions and model-controller-route separation
- Where it appears: `backend/controllers/customer.controller.js`, `backend/controllers/cart.controller.js`, `backend/routes/customer.routes.js`
- Syntax: `router.post('/register', registerCustomer);`
- Explanation: Routes define URL endpoints; controllers perform business logic; models define database structure.
- Why it is used: This is a common Express pattern and makes each layer easier to debug.
- Example: `/customers/register` route points to `registerCustomer`, which uses `Customer.findOne()` and `Customer.create()`.
- Viva question: Why is route-controller-model separation important? It keeps the code easier to read and maintain as the app grows.

## 7. MongoDB and Mongoose

### Concept: Mongoose schema definition
- Where it appears: `backend/models/customer.model.js`, `backend/models/product.model.js`, `backend/models/order.model.js`
- Syntax: `new mongoose.Schema({ ... }, { timestamps: true })`
- Explanation: A schema defines the expected document structure and validation rules before data is stored.
- Why it is used: It ensures the database is not filled with invalid or inconsistent records.
- Example: `productSchema` validates `price` and `stock` before saving.
- Viva question: Why is validation useful? Because the backend must trust its own server-side checks, not frontend input.

### Concept: `ObjectId` and document references
- Where it appears: `backend/models/customer.model.js` -> `wishlist`, `cart.product`; `backend/models/order.model.js` -> `user`, `items.product`
- Syntax: `type: mongoose.Schema.Types.ObjectId, ref: 'Product'`
- Explanation: ObjectId is the MongoDB identifier for documents. `ref` tells Mongoose which collection the ID points to.
- Why it is used: It links related documents like customer-to-cart items and orders-to-customers.
- Example: `cart.product` points to a Product document.
- Viva question: Why use references instead of copying all product data into the cart? Because the product catalog can change while the cart and orders should remain consistent.

### Concept: Mongoose CRUD operations
- Where it appears: `backend/controllers/customer.controller.js` -> `Customer.findOne()`, `Customer.create()`, `backend/controllers/cart.controller.js` -> `Customer.findById()`, `customer.save()`, `backend/controllers/order.controller.js` -> `Order.create()`, `Order.findById()`
- Syntax: `await Customer.findOne({ email })`, `await Order.create({ ... })`
- Explanation: CRUD operations create, read, update, and delete database records. These methods usually return a Promise, so the code uses `await`.
- Why it is used: Data persistence is the core of the app.
- Example: `const customer = await Customer.findOne({ email });` loads the matching user by email.
- Viva question: What does `await` do in these calls? It waits until MongoDB returns the result before the code continues.

### Concept: `populate()`
- Where it appears: `backend/controllers/cart.controller.js` -> `Customer.findById(...).populate({ path: 'cart.product' ...})`, `backend/controllers/order.controller.js` -> `Customer.findById(req.user._id).populate(...)`
- Syntax: `.populate({ path: 'cart.product', select: '...' })`
- Explanation: `populate()` replaces ObjectId references with the actual referenced document fields.
- Why it is used: The backend needs product details like name, image, and price while building a cart or order.
- Example: The cart receives objects that include product data instead of bare IDs.
- Viva question: Why not just store the product name and price directly in the cart? Because product details may change later, and the real catalog should remain authoritative.

## 8. Authentication and authorization

### Concept: Password hashing with bcrypt
- Where it appears: `backend/controllers/customer.controller.js` -> `bcrypt.hash(...)`, `bcrypt.compare(...)`
- Syntax: `await bcrypt.hash(password, 10)` and `await bcrypt.compare(password, customer.password)`
- Explanation: Password hashing turns a readable password into an irreversible value. Comparison checks the input against the stored hash without exposing the actual password.
- Why it is used: This is the standard way to protect user passwords.
- Example: The registration controller hashes the password before saving.
- Viva question: Why not store the raw password? Because a database leak would expose user credentials directly.

### Concept: JWT creation and verification
- Where it appears: `backend/utils/generateToken.js`, `backend/middlewares/auth.middleware.js`
- Syntax: `jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' })` and `jwt.verify(token, process.env.JWT_SECRET)`
- Explanation: The server creates a signed token containing user identity information and verifies it on every protected request.
- Why it is used: The app needs a stateless way to know which user is making a request.
- Example: `req.cookies.token` stores the JWT, and `authMiddleware` verifies it and loads the customer.
- Viva question: What is the difference between encryption and signing? Signing verifies integrity and identity; it does not hide the payload in this project.

### Concept: Cookies and HttpOnly cookies
- Where it appears: `backend/controllers/customer.controller.js` -> `res.cookie('token', token, cookieOptions)` and `res.clearCookie(...)`
- Syntax: `httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production'`
- Explanation: HttpOnly cookies cannot be accessed by JavaScript in the browser, which reduces risk from XSS. The token is still automatically sent in future requests.
- Why it is used: The app uses cookies for auth instead of storing tokens in local storage.
- Example: `authMiddleware` reads `req.cookies.token` to find the user.
- Viva question: Why are JWTs stored in HttpOnly cookies instead of plain localStorage? Because it reduces theft risk from browser scripts.

### Concept: Authentication vs authorization
- Where it appears: `backend/middlewares/auth.middleware.js` -> `authMiddleware`, `backend/controllers/order.controller.js` -> `if (order.user.toString() !== req.user._id.toString())`
- Syntax: `if (!req.user) return res.status(401)...` and ownership checks.
- Explanation: Authentication answers “Who is this user?” Authorization answers “Is this user allowed to access this data?”
- Why it is used: A user may be logged in but still not allowed to view another user’s order.
- Example: `getOrderById` checks `order.user.toString() !== req.user._id.toString()` before returning the order.
- Viva question: What is the core difference? Authentication verifies identity; authorization checks permissions and ownership.

## 9. Cart and global state management

### Concept: Shared cart state with context
- Where it appears: `frontend/src/context/CartContext.jsx` -> `CartProvider`, `useCart` 
- Syntax: `const CartContext = createContext(null);`
- Explanation: Context provides a global state store that any component can access without prop drilling.
- Why it is used: Product cards, navbar, cart page, and checkout all need the same cart values.
- Example: `const { cartCount } = useCart();` in the navbar.
- Viva question: Why is context useful in a storefront? It keeps cart counts and items consistent across pages.

### Concept: Cart total calculation
- Where it appears: `frontend/src/context/CartContext.jsx` -> `cartCount`, `frontend/src/pages/Checkout.jsx` -> `subtotal` and `totalItems`
- Syntax: `reduce((total, item) => total + Number(item.quantity || 0), 0)`
- Explanation: The app reduces the cart array to a single total by summing quantity or price * quantity.
- Why it is used: The user sees a live badge count and checkout totals.
- Example: `subtotal` uses current cart item price and quantity.
- Viva question: Why is `reduce()` a good fit for totals? Because a total is an accumulation across many items.

### Concept: Cart operations in backend
- Where it appears: `backend/controllers/cart.controller.js` -> `addToCart`, `updateCartQuantity`, `removeFromCart`
- Syntax: `customer.cart.find(...)`, `customer.cart.push(...)`, `customer.cart = customer.cart.filter(...)`
- Explanation: The server mutates the nested cart array on the user document and saves it. These operations make the cart a part of user profile data.
- Why it is used: The cart is persisted in MongoDB, so it survives refreshes and login sessions.
- Example: `existingItem.quantity += 1` increases quantity when the same product is already in the cart.
- Viva question: What is the advantage of persisting the cart server-side? It is consistent for all devices and pages for the same authenticated user.

## 10. Checkout, Stripe, and order processing

### Concept: Shipping validation and checkout form
- Where it appears: `frontend/src/pages/Checkout.jsx` -> `validateForm`, `handlePlaceOrder`
- Syntax: `Object.entries(shipping).forEach(...)`, regex checks like `/^\d{6}$/`
- Explanation: The app validates required address fields before creating a payment order.
- Why it is used: This reduces invalid orders and prevents server-side errors later.
- Example: Pincode must contain exactly 6 digits.
- Viva question: Why validate before submitting a payment? Because backend validation is the trust boundary and it avoids bad checkout sessions.

### Concept: Stripe Checkout session creation
- Where it appears: `backend/controllers/order.controller.js` -> `createPaymentOrder`, `stripe.checkout.sessions.create(...)`
- Syntax: `mode: 'payment'`, `success_url`, `cancel_url`, `line_items`
- Explanation: The backend creates a Stripe payment session with order metadata and a price snapshot of the items. The frontend then redirects the browser to the hosted Stripe page.
- Why it is used: Stripe handles the secure payment flow while the app stores the order in MongoDB.
- Example: `line_items` contains product name, quantity, and INR amount.
- Viva question: Why does the app redirect to Stripe instead of processing payment directly in the browser? Because Stripe is responsible for secure card handling and backend verification.

### Concept: Payment verification and server trust
- Where it appears: `backend/controllers/order.controller.js` -> `verifyPayment`, `finalizePaidOrder`, `handleStripeWebhook`
- Syntax: `stripe.checkout.sessions.retrieve(...)`, `session.payment_status === 'paid'`
- Explanation: The server checks Stripe’s real payment status before marking the order as paid. The browser success page is not trusted as proof of a successful payment.
- Why it is used: A frontend redirect can be spoofed or happen before actual payment confirmation.
- Example: Only `session.payment_status === 'paid'` changes the order status to `PLACED`.
- Viva question: Why is service-side verification needed? Because the client cannot safely prove payment success.

### Concept: Order snapshot pattern
- Where it appears: `backend/models/order.model.js` -> `items` array, `backend/controllers/order.controller.js` -> `orderItems.push({ product, name, price, quantity, image })`
- Syntax: each order item stores name, price, quantity, and image at purchase time
- Explanation: Order data is copied into the order document so the order remains accurate even if the product price or stock later changes.
- Why it is used: This gives a reliable record of what was bought and how much it cost.
- Example: A product price can be changed tomorrow, but the order still shows the historical price.
- Viva question: Why is the order saved as a snapshot? Because the app needs a historical record of the transaction.

## 11. CSS/Tailwind and responsive design

### Concept: CSS variables and theme system
- Where it appears: `frontend/src/index.css` -> `:root` and `:root[data-theme='dark']`
- Syntax: `--primary-color: #2563eb;`, `:root[data-theme='dark'] { ... }`
- Explanation: CSS variables centralise colours, spacing, shadows, and typography. The theme toggle updates the HTML root attribute and the design system switches automatically.
- Why it is used: It keeps the styling consistent across components and enables dark mode with minimal code.
- Example: `ThemeToggle.jsx` sets `data-theme` on `document.documentElement`.
- Viva question: Why use CSS variables instead of repeating hex codes everywhere? Because theme updates and consistent branding become easier to maintain.

### Concept: Flexbox and Grid
- Where it appears: `frontend/src/index.css` -> common layout classes and component groups
- Syntax: `display: flex`, `display: grid`, `gap`, `justify-content`, `align-items`
- Explanation: Flexbox aligns items in rows and columns, while Grid is useful for structured layouts like cards and checkout sections.
- Why it is used: The app uses responsive layouts for product cards, checkout forms, and the navigation bar.
- Example: Many rows use `display: flex` for alignment and spacing.
- Viva question: When would you choose Flexbox instead of Grid? Flexbox is simpler for one-dimensional arrangement; Grid is stronger for 2D structures.

### Concept: Responsive design and media queries
- Where it appears: `frontend/src/index.css` and `frontend/src/pages/Products.jsx` responsive classes
- Syntax: `@media (max-width: 1024px) { ... }`
- Explanation: Media queries apply different rules depending on screen width so the interface stays usable on phones and tablets.
- Why it is used: Ecommerce interfaces must work across mobile and desktop screens.
- Example: The nav bar and product grid adapt to smaller screens.
- Viva question: What is the point of a media query? It allows a layout to change at a defined breakpoint without rewriting the whole component.

### Concept: Hover, focus, and disabled states
- Where it appears: `frontend/src/index.css` -> `:focus-visible`, `button:hover`, `button:disabled`
- Syntax: `:hover`, `:focus-visible`, `:disabled`
- Explanation: These pseudo-classes change appearance when the user hovers, tabs to an element, or interacts with a disabled button.
- Why it is used: They provide feedback and accessibility.
- Example: Focus rings and button transitions make navigation and forms easier to use.
- Viva question: Why is focus styling important? Keyboard users need a clear cue of where they are on the page.

## 12. Error handling and loading states

### Concept: Loading, error, and empty states
- Where it appears: `frontend/src/pages/Products.jsx`, `frontend/src/pages/Checkout.jsx`, `frontend/src/context/CartContext.jsx`
- Syntax: `const [loading, setLoading] = useState(true)`, `const [error, setError] = useState('')`
- Explanation: The app stores separate state for loading, error, and no-data conditions. Each page shows a different screen depending on that state.
- Why it is used: It makes the interface feel stable even when the network or database is slow.
- Example: `Checkout` renders a loading spinner while the cart is fetched.
- Viva question: Why not just show the page and let it fail silently? Because users need clear feedback when data is still loading or missing.

### Concept: Early returns and guard checks
- Where it appears: `backend/controllers/customer.controller.js`, `backend/controllers/order.controller.js`, `frontend/src/pages/Checkout.jsx`
- Syntax: `if (!customer) { return res.status(401)... }`, `if (cartItems.length === 0) { ... return; }`
- Explanation: The code exits early when a required condition fails. This keeps code readable and prevents later logic from running.
- Why it is used: It is especially important in validation, auth, and stock checks.
- Example: `createPaymentOrder` exits if the cart is empty or the user is not authorized.
- Viva question: What is an early return? A guard clause that stops the function before the rest of the logic executes.

## 13. Important syntax patterns with simple examples

### Example 1: Object destructuring
- Syntax: `const { productId } = req.params;`
- Meaning: pull `productId` from the params object
- Why: easier than `req.params.productId`

### Example 2: Array map + key
- Syntax: `{products.map((product) => <ProductCard key={product._id} product={product} />)}`
- Meaning: iterate and render each item
- Why: dynamic product lists are common in ecommerce

### Example 3: Async request
- Syntax: `const response = await api.get('/products');`
- Meaning: wait for the network call to finish and then use its data
- Why: UI updates depend on server response data

### Example 4: Conditional rendering
- Syntax: `{cartCount > 0 && <span>{cartCount}</span>}`
- Meaning: render the badge only when there are items in the cart
- Why: avoids showing empty counts

### Example 5: Form state update
- Syntax: `setShipping((current) => ({ ...current, [field]: value }));`
- Meaning: update only one field without destroying the rest of the object
- Why: forms are usually multi-field objects

## 14. Common mistakes and why they happen

### Mistake: Using `this` in an arrow function when expecting a component instance
- Why it happens: `this` is lexical in arrow functions, not dynamic like in class components.
- Fix: use regular functions or class fields when `this` is needed.

### Mistake: Forgetting `await` before a Promise-returning call
- Why it happens: the code continues before the actual result is ready.
- Fix: use `await` before `api.get`, `findOne`, `create`, or `save` when you need the resolved value.

### Mistake: Not checking `req.user` before using it
- Why it happens: auth middleware may not have run or the token may be invalid.
- Fix: always guard protected handlers and return 401 when required.

### Mistake: Trusting the frontend success page over Stripe response
- Why it happens: the browser is not a trusted payment authority.
- Fix: verify real Stripe payment status on the backend before marking the order as paid.

### Mistake: Storing raw password strings
- Why it happens: it is easy to assume a password is safe because it is in memory.
- Fix: hash it with `bcrypt` before saving.

### Mistake: Missing `key` in a `.map()` list
- Why it happens: React needs stable keys for rendering updates.
- Fix: use a unique field such as `product._id`, `option.value`, or `order._id`.

## 15. Viva questions with concise answers

### Q1: What is the role of `authMiddleware` in ShopKart?
Answer: It reads the JWT from the cookie, verifies it, loads the authenticated customer, and attaches `req.user` before the protected route runs.

### Q2: Why does the cart use context instead of passing props everywhere?
Answer: Because many components need the same cart data and context keeps the state shared and centralised.

### Q3: Why does the backend validate cart and stock before creating a payment order?
Answer: Because server-side validation is trusted and prevents invalid or out-of-stock purchases even if the frontend is manipulated.

### Q4: What is the purpose of `populate()` in the cart and order logic?
Answer: It resolves ObjectId references like `cart.product` into real product documents so the API can return name, price, and image data.

### Q5: Why is Stripe verification performed on the backend?
Answer: Because the frontend is not authoritative; the real payment status comes from Stripe's server.

### Q6: What is the difference between `useState` and `useEffect`?
Answer: `useState` stores data, while `useEffect` reacts to changes and runs side effects like API requests.

### Q7: What is a Mongoose schema?
Answer: It defines the structure, validation, and rules for documents stored in a MongoDB collection.

### Q8: Why are HTTP status codes used in controllers?
Answer: They communicate success, validation errors, unauthorized access, and server failures clearly to the client.

### Q9: Why is `res.status().json()` used instead of plain strings?
Answer: JSON responses are machine-readable and are easy for frontend code to parse and show to the user.

### Q10: What does `Object.entries(shipping).forEach(...)` do in the checkout form?
Answer: It iterates through each field in the shipping object and validates the required values before placing the order.

---

## Optional additional section: concepts used in the styling session

### Concept: Dark mode toggle
- Where it appears: `frontend/src/components/ThemeToggle.jsx` -> `ThemeToggle`
- Syntax: `localStorage.getItem('shopkart-theme')`, `document.documentElement.setAttribute('data-theme', theme)`
- Explanation: The selected theme is stored in browser storage and re-applied when the app loads.
- Why it is used: Users expect their UI preference to stay consistent when revisiting the site.
- Example: The `:root[data-theme='dark']` CSS variables in `index.css` are applied after a toggle.

### Concept: CSS transitions and shadows
- Where it appears: `frontend/src/index.css` -> CSS variables such as `--transition-base` and `--shadow-lg`
- Explanation: These design tokens create smoother hover effects, subtle depth, and consistent visual polish.
- Why it is used: They make the storefront feel more premium and modern without heavy animation.

This guide reflects the code actually present in the project as of this session and intentionally avoids adding patterns or libraries that do not exist in the repository.
