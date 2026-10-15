# EasyShopping

EasyShopping is a small e-commerce application built with a Node.js/Express backend and a React frontend. The project demonstrates a simplified online shopping flow: customers can register, log in, browse products, add items to a wishlist, and manage a cart before checkout.

## Project goals

- Keep the stack simple and beginner-friendly
- Model a realistic customer shopping experience without over-engineering the backend
- Separate responsibilities between API layer, data models, and frontend state management
- Use cookies for session state and context for cross-page cart state

## Tech stack

- Backend: Express, MongoDB with Mongoose, JWT, bcrypt, CORS, cookie-parser
- Frontend: React, Vite, React Router, Axios
- Data flow: frontend calls REST API; backend validates input and reads/writes to MongoDB

## Architecture decisions

### Backend-first design
The API is the source of truth for customer authentication and product data. This keeps business rules like stock validation, quantity checks, and user authorization in one place instead of duplicating them across the UI.

### Mongoose schemas as the data contract
Each Mongo collection is described through a schema. This gives us built-in validation for required fields, numeric constraints, and database relationships such as a customer's cart referencing product records.

### JWT in cookies
The app stores the auth token in an HTTP-only cookie instead of local storage. This protects the token from browser scripts and is a common pattern for session-like authentication in small full-stack apps.

### Global cart state in React context
The cart is shared across pages using a React Context provider. Instead of copying cart logic into every page, the provider centralizes fetching, updating, and counting items. This keeps the UI consistent and reduces duplicated state logic.

### REST API for clarity
The project uses straightforward REST routes such as `/products`, `/cart`, and `/customers`. This is easy to follow for learning, debugging, and integrating with a simple front-end.

## Main flows

### Product catalog
The product model stores core information such as name, description, category, image, stock, and price. The controller supports search and category filtering so the frontend can render a useful product list.

### Customer authentication
Registration hashes the password using bcrypt before saving it. Login verifies the password, issues a JWT, and stores it as a cookie. The auth middleware then decodes the token and checks the user before protected routes can proceed.

### Cart behavior
A customer's cart is stored as an array of product references with quantities. The backend checks stock limits before allowing updates, ensuring that quantity changes cannot exceed what is available.

### Wishlist and cart separation
Wishlist and cart are both attached to the customer record. This lets the app keep the data tied to the user, which is more consistent than storing cart data only in local component state.

## How to run

1. Install dependencies in the root and backend folders.
2. Configure the MongoDB connection string and JWT secret in your environment.
3. Start the backend server.
4. Start the Vite frontend.
5. Open the app and register/login to begin shopping.

## Why this project is structured this way

This app prioritizes clarity over complexity. The project is intentionally small, but the patterns it uses are the same ones found in larger production systems: validated schemas, authenticated routes, centralized state, and a clean separation of API responsibilities.

