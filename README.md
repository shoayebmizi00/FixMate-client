# FixMate

FixMate is a role-based repair and home appliance service platform built with Next.js, Express, MongoDB, BetterAuth, ImgBB, and Stripe.

## Purpose

Customers can discover approved repair services and send repair requests. Technicians manage their listings and job status. Admins approve listings and manage users and bookings. Customers pay only after a repair is completed.

## Main features

- BetterAuth email/password authentication
- BetterAuth JWT plugin tokens and Express Bearer-token role middleware
- Customer, technician, and admin dashboards
- Technician service CRUD and admin approval
- Server-side service search, filters, sorting, and pagination
- Requested → accepted → in-progress → completed booking pipeline
- Stripe Checkout and idempotent Stripe webhook/payment verification
- ImgBB profile and service image uploads
- Responsive public and dashboard interfaces

## Local setup

Client:

```bash
cd fixmate-client
npm install
npm run dev
```

Server:

```bash
cd fixMate-server
npm install
node index.js
```

## Required environment variables

Client:

- `MONGODB_URI`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_TRUSTED_ORIGINS`
- `BASE_API_URL`
- `IMAGEBB_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Express:

- `MONGODB_URI`
- `CLIENT_URL`
- `PORT`

## Data collections

The application uses four MongoDB collections: `user`, `services`, `bookings`, and `payments`. BetterAuth session, account, and verification collections are authentication collections and are not counted as application collections.

## Verification commands

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Stripe test card

Use `4242 4242 4242 4242`, a future expiry date, and any CVC.

## Currency

FixMate uses Bangladeshi Taka (`৳` / `bdt`) for displayed and Stripe Checkout prices.

## Submission details

Add these values before the live submission:

- Live site URL:
- Admin email/password:
- Technician email/password:
- Customer email/password:
- GitHub client repository:
- GitHub server repository:
