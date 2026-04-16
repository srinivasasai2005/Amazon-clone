# Amazon.in Clone - Project Details (Living Document)

Last updated: 2026-04-16

This document is now maintained as a source-of-truth status report based on direct code analysis across frontend and backend.

## 1. Project Snapshot

- Type: Full-stack Amazon.in-style e-commerce application
- Frontend: React (Vite), React Router, Context API, Axios, Stripe Elements
- Backend: Node.js, Express.js, PostgreSQL (`pg`), JWT auth, Stripe SDK
- Database: Neon PostgreSQL (via `DATABASE_URL`)

## 2. Architecture (Verified)

### Frontend (`amazon-clone-frontend`)

- Routing and protection handled in `src/App.jsx`.
- Global state implemented using Context API:
  - `AuthContext`: login/register/logout, token persistence
  - `CartContext`: cart CRUD and totals
  - `WishlistContext`: wishlist CRUD
  - `NotificationContext`: in-app notifications
- API layer centralized in `src/services/api.js` using Axios interceptors for JWT.

### Backend (`backend`)

- Server bootstrapped in `server.js` with CORS, JSON parsing, health check, and route mounting.
- Database schema initialized in `db/database.js`.
- Domain routes:
  - `routes/auth.js`
  - `routes/products.js`
  - `routes/cart.js`
  - `routes/wishlist.js`
  - `routes/orders.js`
  - `routes/payments.js`
- Auth middleware in `middleware/auth.js` validates Bearer JWT.

## 3. Feature Status Matrix

### Fully Working / Present

- JWT auth flow (signup/login/me) with persisted token
- Protected frontend routes (cart/checkout/orders/wishlist)
- Product listing and product details API
- Cart add/update/remove/clear
- Wishlist add/remove/list
- Checkout with COD option
- Stripe payment intent integration
- Order creation with DB transaction and stock deduction
- Free-shipping threshold logic (>= 499)

### Implemented But Needs Hardening

- Stripe fallback behavior currently allows dummy client secret in some error paths
- Order listing has N+1 query pattern
- Payload validation is minimal (missing request schema validation)
- CORS currently tuned mainly for localhost usage

### UX/Quality Areas Partially Complete

- Amazon-like UI fidelity is strong but not strictly pixel-perfect
- Product list filtering exists; pagination UX can be expanded
- Mobile responsiveness and accessibility need a structured pass

## 4. Assignment Requirement Coverage (From PDF)

### Must Have Requirements

- Product Listing Page:
  - Grid listing, search, category filtering, and add-to-cart flow are implemented.
- Product Detail Page:
  - Image carousel, description/spec-like content, price/stock signals, add-to-cart, and buy-now flow are present.
- Shopping Cart:
  - View cart, update quantity, remove items, and summary totals are implemented.
- Order Placement:
  - Checkout form, order summary flow, place-order backend transaction, and confirmation page with order ID are implemented.

### Good to Have (Bonus) Coverage

- Responsive design: partially complete, needs final pass.
- User authentication: implemented (beyond assignment baseline requirement).
- Order history: implemented.
- Wishlist functionality: implemented.
- Email notification on order placement: not implemented yet.

## 5. Data & Seed Notes

- Categories are seeded across major shopping verticals (electronics, books, clothing, home & kitchen, sports, beauty, toys).
- Products are seeded with pricing, stock, ratings, images, and JSON specs.
- Order/cart/wishlist relational flow is established and functional.

## 6. Current Risks / Tech Debt

1. N+1 query in order history retrieval can hurt performance at scale.
2. Payment fallback path should fail safely instead of appearing successful with mock secret.
3. JWT secret fallback should be removed for production safety.
4. Validation and rate limiting should be introduced for auth/cart/order/payment endpoints.
5. Shipping logic is duplicated in multiple backend routes and should be centralized.

## 7. Assignment Goal Alignment

- Assignment goal confirmed from PDF: Amazon-like e-commerce experience with product browsing, cart, checkout, and order placement.
- Your implementation covers all four core must-have flows and exceeds baseline by including auth + wishlist + order history.
- Remaining improvement areas to maximize evaluation score: responsive polish, validation/security hardening, and production-ready deployment configuration.

## 8. Ongoing Execution Tracker (From Now On)

Use this as the running plan/checklist for all next iterations.

### Now

- [ ] Refactor orders list endpoint to remove N+1 query pattern
- [ ] Add request validation schemas for auth/cart/orders/payments
- [ ] Remove insecure JWT secret fallback behavior

### Next

- [ ] Improve Stripe error handling UX (clear failure feedback)
- [ ] Unify shipping-cost calculation into one shared backend utility
- [ ] Expand CORS/env configuration for non-local deployment

### Later

- [ ] Add pagination UX and performance optimization for product listing
- [ ] Accessibility pass (keyboard nav, labels, semantics)
- [ ] Mobile responsiveness pass across navbar/listing/checkout pages
- [ ] Add admin-grade order status workflow

### Optional Bonus

- [ ] Add order confirmation email workflow

## 9. Current Status

The application is a functional full-stack e-commerce MVP with strong core flows implemented. The immediate focus should be production hardening, validation/security, and performance improvements.
