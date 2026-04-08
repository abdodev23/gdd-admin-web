# GDD Admin Web

Internal admin dashboard for **Gala de Danza 2026**. The CodeCult / GDD ops
team manages the entire booking platform from here: catalog (tickets,
hotels, activities, transfers, packages, promos, FAQs, testimonials, VIP
allocations), bookings, seats, users, requests (special requests,
cancellations, modifications, contact, waitlist), settings, marketing,
financial center, and analytics.

> This app needs the backend ([gdd-backend](https://github.com/abdodev23/gdd-backend))
> running. There's no mock-data fallback anymore.
>
> You also need a Firebase user with an admin-level role on their User
> document — see [First admin login](#first-admin-login) below.

## Stack

- **React 19** + **Vite 7** (no TypeScript, plain JSX)
- **React Router v7** — admin layout wraps every authenticated route
- **Zustand** — UI state (`useAdminStore`), auth state (`useAuthStore`), toast (`useToastStore`)
- **React Query (`@tanstack/react-query`)** — server state, paginated lists, optimistic updates
- **Firebase Auth** — same Firebase project as the user web app; role gating happens server-side
- **Tailwind CSS 4** — same design system as the user app
- **Recharts** — dashboard charts
- **react-hook-form + Zod** — admin forms
- **Framer Motion** — page transitions, modals
- **lucide-react** — icons

## Prerequisites

1. **Node.js 20+** — `node --version` should print `v20.x`+
2. **The backend running** locally (see [gdd-backend](https://github.com/abdodev23/gdd-backend)
   README) or a deployed backend you can hit
3. **A Firebase user with an admin role** — you sign up via the user web app
   first, then a super-admin runs the `seed:admin` script in the backend to
   promote you. See [First admin login](#first-admin-login).

## Setup

```bash
git clone https://github.com/abdodev23/gdd-admin-web.git
cd gdd-admin-web
npm install
cp .env.example .env
```

Edit `.env`:

| Var | Notes |
|---|---|
| `VITE_API_URL` | backend base URL, e.g. `http://localhost:5000/api` |
| `VITE_FIREBASE_API_KEY` | from Firebase web app config — **same Firebase project as user-web** |
| `VITE_FIREBASE_AUTH_DOMAIN` | from Firebase web app config |
| `VITE_FIREBASE_PROJECT_ID` | from Firebase web app config |
| `VITE_FIREBASE_STORAGE_BUCKET` | from Firebase web app config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | from Firebase web app config |
| `VITE_FIREBASE_APP_ID` | from Firebase web app config |
| `VITE_FIREBASE_MEASUREMENT_ID` | optional |

> **Important:** Do NOT create a separate Firebase project for admin. The
> admin and user apps share the same Firebase project — role-based access
> is enforced by the backend, not by Firebase.

## Run

```bash
npm run dev          # development server with HMR (port 5174)
npm run build        # production bundle in dist/
npm run preview      # preview the prod build
npm run start        # alias for `vite preview --port 3001 --host`
npm run lint         # ESLint
```

Visit `http://localhost:5174` after `npm run dev`.

## First admin login

The very first time you set up this app you need to create a super-admin
account. The flow:

1. **Open the user web app** at `http://localhost:5173/auth` and sign up
   with the email you want to be your super-admin
2. **Verify the email** if Firebase prompts for it
3. **Run the seed script in the backend repo:**
   ```bash
   cd ../gdd-backend
   npm run seed:admin -- --email YOUR_EMAIL_HERE
   ```
   This flips `role: 'user'` → `role: 'super-admin'` on the matching User
   document
4. **Open the admin web app** at `http://localhost:5174/login` and sign in
   with the same email/password — you should land on the dashboard

After that, super-admins can invite more admins via the **Users → Invite**
button (no script needed).

## Roles

| Role | What they can do |
|---|---|
| `super-admin` | Everything — settings, audit log, invite/delete admins, all writes |
| `admin` | Manage catalog, bookings, requests, marketing — cannot edit settings or other admins |
| `manager` | Manage bookings + requests; read-only on catalog and analytics |
| `viewer` | Read-only across the whole dashboard |
| `user` | **No access** — sign-in is rejected |

The role gates are enforced both client-side (`<RoleGate roles={[...]}>`
wrapping routes) and server-side (the backend's `requireRole` middleware).
Don't trust either alone.

## Pages

```
src/pages/
  LoginPage.jsx              /login
  ForbiddenPage.jsx          /forbidden (when role is insufficient)
  DashboardPage.jsx          / (stat cards + charts)
  BookingsPage.jsx           /bookings (paginated, full booking detail modal)
  SeatingPage.jsx            /seats (visual chart + admin override)
  TicketsPage.jsx            /tickets
  PackagesPage.jsx           /packages
  HotelsPage.jsx             /hotels (with embedded rooms + addons)
  ActivitiesPage.jsx         /activities
  TransfersPage.jsx          /transfers (with per-route price map)
  RequestedTransfersPage.jsx /requested-transfers (read-only aggregation)
  PromosPage.jsx             /promos
  RequestsPage.jsx           /requests (tabbed: special, modifications, cancellations, contact, waitlist)
  UsersPage.jsx              /users (super-admin only writes)
  GuestReportPage.jsx        /guests (read-only hotel occupancy)
  MarketingPage.jsx          /marketing (Phase 5)
  FinancialCenterPage.jsx    /financial (Phase 5)
  VipPage.jsx                /vip
  EventsPage.jsx             /events
  SettingsPage.jsx           /settings (super-admin only)
```

## Architecture

```
src/
  api/
    client.js              Axios instance with Firebase ID token interceptor
    hooks/                 React Query hooks, one file per resource
      createCrudHooks.js   Factory for catalog CRUD (used by hotels, activities, etc.)
      useTickets.js
      useHotels.js
      useActivities.js
      useTransfers.js
      useBookings.js
      useSeats.js
      useUsers.js
      useSpecialRequests.js
      …
  components/
    auth/                  RoleGate
    bookings/              BookingDetailModal
    charts/                Recharts wrappers
    layout/                AdminLayout, Sidebar, TopBar
    requests/              SpecialRequestModal, CancellationModal, BookingModificationModal
    ui/                    DataTable, Modal, PageHeader, SearchInput, Select, StatusBadge, StatsCard, ImageUpload, …
  config/
    firebase.js            Firebase init
  pages/                   One file per route (see above)
  store/
    useAdminStore.js       UI state (sidebar collapsed, etc.)
    useAuthStore.js        Firebase user + dbUser + role
    useToastStore.js       Global toast queue
  utils/
    cn.js                  className merger
    formatCurrency.js
  router.jsx               React Router v7 config (RoleGate-wrapped)
  main.jsx                 App bootstrap (QueryClientProvider, RouterProvider, Toaster)
```

### Key files

- **`src/api/client.js`** — axios instance with a Firebase token interceptor
  that calls `auth.currentUser.getIdToken()` on every request. No tokens
  cached in localStorage.
- **`src/api/hooks/createCrudHooks.js`** — factory that returns
  `useList / useOne / useCreate / useUpdate / useDeactivate / useReactivate / useDelete`
  for any catalog entity. Used by 11+ resources.
- **`src/store/useAuthStore.js`** — subscribes to Firebase `onAuthStateChanged`,
  fetches `/users/me`, rejects accounts without an admin-level role.
- **`src/components/auth/RoleGate.jsx`** — wraps routes; redirects to
  `/login` if unauthenticated, `/forbidden` if role insufficient.
- **`src/components/ui/DataTable.jsx`** — generic paginated table used by
  every list page. Accepts `columns`, `data`, `loading`, `page`, `limit`,
  `total`, `onPageChange`, `onRowClick`.

## Conventions

- **Path alias `@/...` → `src/...`** (configured in `vite.config.js`)
- **No TypeScript** — JSX + JSDoc where helpful
- **All admin list pages** — use `createCrudHooks` if it's a catalog entity,
  or hand-roll a hook if there's something special about the read shape
- **Toast feedback for every mutation** — success and error. The
  `useToastStore` exports `toast.success(msg)` and `toast.error(msg)`
- **Error states** — every list page surfaces a Retry button on `isError`,
  not a stack trace
- **Modals over routes** — for detail views (booking, request, etc.) we
  use a modal component, not a separate route. State stays in URL search
  params for shareability when it matters
- **Role checks in JSX** — `useAuthStore((s) => s.role) === 'super-admin'`
  to conditionally render write buttons; the backend will reject anyway

## Common operations

### Add a new admin
1. Have the person sign up via user-web at `/auth`
2. **From the dashboard**: Users → "Invite Admin" button (super-admin only).
   Backend creates the Firebase user, sends a stub invite email with a
   password-reset link, and stamps the role onto the Mongo User row.
3. **Or from CLI**: `npm run seed:admin -- --email their@email.com` in the
   backend repo (rare — only for the very first super-admin)

### Add a new catalog entity type
1. Add the Mongoose model + routes in the backend
2. Create `src/api/hooks/useFoo.js` using `createCrudHooks({...})`
3. Create `src/pages/FoosPage.jsx` — copy an existing page like
   `PromosPage.jsx` as a starting point
4. Register the route in `src/router.jsx` with the right `RoleGate`
5. Add a sidebar item in `src/components/layout/Sidebar.jsx`

### Fix "the table won't refresh after I edited a row"
This usually means a missing query invalidation. Check that the mutation
hook calls `queryClient.invalidateQueries({ queryKey: [yourKey] })` in
`onSuccess`.

## Troubleshooting

**`Failed to fetch` on every page** — `VITE_API_URL` wrong or backend not
running. Hit `<VITE_API_URL>/health` in your browser to verify.

**"This account does not have admin access"** — your Firebase user exists,
but their Mongo `role` is still `user`. Run `npm run seed:admin --` in the
backend, or have a super-admin invite you.

**Stuck on a blank screen after sign-in** — check the browser console.
Most likely the `/users/me` call is failing because `VITE_API_URL` is wrong
or CORS isn't configured on the backend. The backend's `CORS_ORIGINS` env
var must include `http://localhost:5174`.

**"Missing or invalid authorization header"** in the network tab — Firebase
hasn't finished initializing when the request fired. The auth store's
`loading` flag handles this; pages should not fire queries until
`useAuthStore((s) => s.loading)` is false.

**Image uploads fail** — check that the backend's Cloudinary creds are set
and the backend's `/api/upload` endpoint is mounted. ImageUpload posts to
`/upload` (multipart form data).

## Related repos

- [gdd-backend](https://github.com/abdodev23/gdd-backend) — Express + MongoDB API
- [gdd-user-web](https://github.com/abdodev23/gdd-user-web) — public booking site
