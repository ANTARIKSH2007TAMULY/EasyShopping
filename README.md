# EasyShopping

EasyShopping is a full-stack e-commerce web app for browsing products, creating an account, managing a cart and wishlist, checking out, and viewing past orders. The project uses a Node.js/Express backend with MongoDB and a React + Vite frontend.

## Tech stack

### Frontend
- React 19
- Vite 8
- React Router
- Axios
- CSS for styling

### Backend
- Node.js
- Express 5
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- cookie-parser
- CORS
- Stripe for payment checkout and webhook verification

### Dev tooling
- npm workspaces
- concurrently for running frontend and backend together

### Database
- MongoDB Atlas or any MongoDB instance accessible via connection string

---

## Features

- User registration and login
- JWT-based auth stored in HTTP-only cookies
- Product catalog with category and search support
- Wishlist management
- Cart management with quantity updates
- Checkout flow using Stripe
- Order history and order details pages
- Responsive UI for shopping experience

---

## Project structure

```text
EasyShopping/
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env.example
│   ├── .env
│   ├── index.js
│   ├── package.json
│   └── seedProducts.js
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── package.json
├── README.md
└── .gitignore
```

---

## Prerequisites

Before running the app locally, make sure you have:

- Node.js 18+ installed
- npm installed
- MongoDB running locally or a MongoDB Atlas cluster
- A Stripe account with test keys
- Git installed

---

## Local setup

### 1) Clone the repository

```bash
git clone https://github.com/ANTARIKSH2007TAMULY/EasyShopping.git
cd EasyShopping
```

### 2) Install dependencies

From the root folder:

```bash
npm install
```

This project is configured with npm workspaces, so the root install will install the frontend and backend dependency sets.

If needed, you can also install them individually:

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 3) Create environment files

Create a backend environment file:

```bash
cp backend/.env.example backend/.env
```

Then fill in the values in `backend/.env`.

Example:

```env
MONGO_URI=mongodb://localhost:27017/easyshopping
JWT_SECRET=your_super_secure_jwt_secret
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 4) Frontend environment file

Create `frontend/.env` if you want to override the API URL explicitly:

```env
VITE_API_URL=http://localhost:5000
```

If this file is not present, the frontend will default to:

- `http://localhost:5000` in development
- the deployed backend URL in production

### 5) Start MongoDB

Make sure your MongoDB instance is up and running.

If you are using MongoDB Atlas, copy the connection string into `MONGO_URI`.

### 6) Seed demo products

The backend includes a sample product seed script. Run it once to populate products in MongoDB:

```bash
node backend/seedProducts.js
```

You can also run the script again if you want to reset the catalog.

### 7) Run the app

From the root:

```bash
npm run dev
```

This runs both services at the same time:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## Required secret keys and configuration

### MongoDB

Set `MONGO_URI` to your connection string.

Examples:

```env
MONGO_URI=mongodb://localhost:27017/easyshopping
```

or

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/easyshopping?retryWrites=true&w=majority
```

### JWT Secret

`JWT_SECRET` is used to sign login tokens.

Example:

```env
JWT_SECRET=change_this_to_a_long_random_string
```

Use a long random secret; do not reuse a public value.

### Stripe keys

The app uses Stripe for checkout.

Required keys:

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

You can get test keys from your Stripe Dashboard:

1. Log in to Stripe Dashboard
2. Go to Developers > API keys
3. Copy the test secret and publishable keys
4. Add them to `backend/.env`

For webhooks, configure a local endpoint while running Stripe CLI:

```bash
stripe listen --forward-to localhost:5000/orders/webhook
```

Then copy the webhook signing secret and store it as:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Client URL

`CLIENT_URL` is used by the backend to redirect users after checkout. For local development, set:

```env
CLIENT_URL=http://localhost:5173
```

---

## How the app works

### Product browsing
Users can view the product catalog, filter by category, and open a product details page.

### Authentication
The backend registers users and hashes passwords with `bcrypt`. When a user logs in, the server creates a JWT and sends it in an HTTP-only cookie.

### Cart and wishlist
Customer cart and wishlist data are attached to the user account in MongoDB. The frontend uses React context for shared cart state.

### Checkout
When a user proceeds to checkout:

1. The frontend sends cart data to the backend
2. The backend validates stock and shipping details
3. It creates a Stripe checkout session
4. The user completes payment in Stripe
5. The backend verifies the payment and updates order status

### Orders
The app stores order details such as shipping information, line items, payment status, and totals. Users can view their order history and order details.

---

## Common local development commands

### Start the full app

```bash
npm run dev
```

### Backend only

```bash
npm --prefix backend run dev
```

### Frontend only

```bash
npm --prefix frontend run dev
```

### Check backend health

```bash
curl http://localhost:5000/health
```

### Build frontend for production

```bash
npm --prefix frontend run build
```

---

## Typical user flow

1. Open http://localhost:5173
2. Register a new account or log in
3. Browse products
4. Add items to cart and wishlist
5. Go to checkout
6. Enter shipping details
7. Pay through Stripe test mode
8. View order success and order details

---

## Notes for production deployment

- Set `NODE_ENV=production`
- Use a secure production MongoDB URI
- Use real Stripe keys instead of test keys
- Configure CORS origins for your deployed frontend domain
- Set `CLIENT_URL` to your frontend production URL
- Store secrets in environment variables, not in source control

---

## Important security note

Never commit real secrets or `.env` files to GitHub. The repository contains an example file, but your actual secrets should stay local or be stored in your deployment environment securely.

---

## License

This project is provided as a learning/demo e-commerce application. You can use it as a starter for your own project with credit to the original repository.

