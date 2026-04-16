# API Endpoints (Current + Real-World Aliases)

This backend now supports two endpoint styles:

- Legacy style (already used by frontend): `/api/...`
- Real-world versioned style: `/api/v1/...`

Both are active and return the same behavior.

## Health

- `GET /api/health`

## Authentication

Legacy:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

v1 aliases:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

## Catalog

Legacy:
- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/:id`

v1 aliases:
- `GET /api/v1/catalog/categories`
- `GET /api/v1/catalog/products`
- `GET /api/v1/catalog/products/:id`

## Cart (Authenticated)

Legacy:
- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:productId`
- `DELETE /api/cart/:productId`
- `DELETE /api/cart`

v1 aliases:
- `GET /api/v1/me/cart`
- `POST /api/v1/me/cart`
- `PUT /api/v1/me/cart/:productId`
- `DELETE /api/v1/me/cart/:productId`
- `DELETE /api/v1/me/cart`

## Orders (Authenticated)

Legacy:
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`

v1 aliases:
- `GET /api/v1/me/orders`
- `GET /api/v1/me/orders/:id`
- `POST /api/v1/me/orders`

## Wishlist (Authenticated)

Legacy:
- `GET /api/wishlist`
- `POST /api/wishlist`
- `DELETE /api/wishlist/:productId`

v1 aliases:
- `GET /api/v1/me/wishlist`
- `POST /api/v1/me/wishlist`
- `DELETE /api/v1/me/wishlist/:productId`

## Payments (Authenticated)

Legacy:
- `POST /api/payments/create-payment-intent`

v1 aliases:
- `POST /api/v1/checkout/payments/create-payment-intent`

## Prime Membership (Authenticated)

Legacy:
- `POST /api/prime/create-payment-intent`
- `GET /api/prime/status`
- `POST /api/prime/subscribe`

v1 aliases:
- `POST /api/v1/me/prime/create-payment-intent`
- `GET /api/v1/me/prime/status`
- `POST /api/v1/me/prime/subscribe`

## Customer Support

Legacy:
- `GET /api/support/faqs`

v1 aliases:
- `GET /api/v1/support/faqs`

## Notes

- Existing frontend continues to use legacy endpoints.
- New integrations can use v1 paths for cleaner, production-style API naming.
- Authenticated endpoints require header:
  - `Authorization: Bearer <token>`
