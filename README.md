# BinderBase

A full-stack Magic: The Gathering Commander deck builder and card library.

Search cards from Scryfall, build a local library, and organize them into Commander decks — all through a React frontend backed by Express and MongoDB.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 via Next.js 16 (App Router) |
| Styling | Bootstrap 5 — Bootswatch Vapor theme (CDN) + Bootstrap Icons |
| Backend | Node.js, Express 4, Express Router |
| Database | MongoDB (native driver — no Mongoose) |
| External APIs | Scryfall (cards), EDHREC (recommendations) — both proxied through the backend |
| HTTP | Browser `fetch` API with JSON |

---

## Prerequisites

- **Node.js v20 or higher** (`node -v` to check)
- **MongoDB** running locally on port `27017`, or a MongoDB Atlas URI
- **MongoDB Compass** (optional, recommended for viewing data)

---

## Installation

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd binderbase

# 2. Set up backend environment
cd backend
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# 3. Install backend dependencies
npm install

# 4. Install frontend dependencies
cd ../frontend
npm install
```

---

## Running the App

You need **two terminals** running at the same time.

**Terminal 1 — backend (port 4000)**
```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB  →  Binderbase
✅ Express API  →  http://localhost:4000
✅ Admin panel  →  http://localhost:4000/admin/new-deck
```

**Terminal 2 — frontend (port 3000)**
```bash
cd frontend
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Seeding the Database

Populates MongoDB with 10 iconic Commander staples and a sample deck:

```bash
cd backend
npm run seed
```

Fetches real card data from Scryfall so you need an internet connection. Safe to run multiple times — clears previous seed data before inserting. Seeded cards will appear in the Library page after logging in.

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

| Variable | Example Value | Description |
|---|---|---|
| `MONGODB_URI` | `YOUR_MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB_NAME` | `Binderbase` | Name of the database (case sensitive) |
| `PORT` | `YOUR_PORT` | Port the Express server listens on |

> **Note:** The database name is case sensitive. Whatever you set here must match what was used when seeding. The default is `Binderbase` with a capital B.

---

## Project Structure

```
binderbase/
├── backend/
│   ├── src/
│   │   ├── server.js                  # Express entry point — mounts all routers, Morgan logging
│   │   ├── models/
│   │   │   ├── Card.js                # Local card library collection + factory functions
│   │   │   ├── Deck.js                # Deck collection + factory functions
│   │   │   └── User.js                # User collection + factory functions
│   │   └── routes/
│   │       ├── cardsRouter.js         # GET/POST/DELETE /api/cards (local library)
│   │       ├── decksRouter.js         # Full CRUD /api/decks + cards inside decks
│   │       ├── externalApiRouter.js   # Scryfall + EDHREC proxy — browser never calls these directly
│   │       ├── usersRouter.js         # POST /users/login and /users/create
│   │       └── adminRouter.js         # Server-rendered HTML form (no React, no fetch)
│   ├── scripts/
│   │   └── seed.js                    # npm run seed — populates cards + sample deck
│   ├── .env.example
│   └── package.json
│
└── frontend/
    └── app/
        ├── layout.js                  # Root layout — loads Vapor Bootstrap + Bootstrap Icons via CDN
        ├── page.js                    # Root — redirects to /login
        ├── globals.css                # Minimal global styles + Bootstrap overrides
        ├── login/
        │   └── page.js                # Login and signup forms
        ├── library/
        │   └── page.js                # Card library — search Scryfall, import, list, detail view
        ├── deck/
        │   └── page.js                # Deck builder — create decks, add cards, set commander
        └── components/
            ├── CardDetailModal.js     # Fetches GET /api/cards/:id and shows full card details
            ├── CardGrid.js            # Responsive grid of search result cards
            ├── CommanderModal.js      # Search and select a commander
            ├── DeckPanel.js           # Deck sidebar — commander hover preview, card list, qty controls
            ├── DeckSelectorModal.js   # Pick or delete a deck
            ├── RecommendationsModal.js # EDHREC suggestions tabbed by card type
            └── SearchSidebar.js       # Card search input + color identity filter chips
```

---

## API Reference

### Auth — `/users`
| Method | Path | Description |
|---|---|---|
| POST | `/users/login` | Log in with username + password |
| POST | `/users/create` | Create a new account |

### Local Card Library — `/api/cards`
| Method | Path | Description |
|---|---|---|
| GET | `/api/cards` | Summary list of all locally saved cards |
| GET | `/api/cards/:id` | Full details for one card (used by detail modal) |
| POST | `/api/cards` | Import a card from Scryfall into the local library |
| DELETE | `/api/cards/:id` | Remove a card from the library |

### Decks — `/api/decks`
| Method | Path | Description |
|---|---|---|
| GET | `/api/decks` | List all decks (filter by `?username=`) |
| POST | `/api/decks` | Create a new deck |
| GET | `/api/decks/:id` | Get a deck with its full card list |
| DELETE | `/api/decks/:id` | Delete a deck |
| PUT | `/api/decks/:id/commander` | Set or clear the commander |
| POST | `/api/decks/:id/cards` | Add a card to a deck (fetches from Scryfall server-side) |
| PUT | `/api/decks/:id/cards/:cardId` | Update card quantity |
| DELETE | `/api/decks/:id/cards/:cardId` | Remove a card from a deck |

### External API Proxy — `/api/external`
| Method | Path | Description |
|---|---|---|
| GET | `/api/external/search?q=` | Search Scryfall by query |
| GET | `/api/external/named?name=` | Fetch one card by exact name |
| GET | `/api/external/recommendations/:name` | EDHREC commander recommendations |

### Admin (server-rendered HTML forms) — `/admin`
| Method | Path | Description |
|---|---|---|
| GET | `/admin/new-deck` | Serves a plain HTML `<form>` — no React, no fetch |
| POST | `/admin/new-deck` | Reads URL-encoded body, inserts deck to MongoDB, redirects |
| GET | `/admin/decks` | Plain HTML table listing all decks |

---

## Features

- **Login / Signup** — accounts stored in MongoDB with bcrypt-hashed passwords
- **Card Library** — search Scryfall, import cards into local MongoDB collection, view full card details in a modal
- **Deck Builder** — create multiple Commander decks, add/remove cards, adjust quantities
- **Commander support** — set a commander, auto-filter cards by color identity, hover to preview commander card image
- **EDHREC Recommendations** — get card suggestions by type (creatures, instants, lands, etc.) based on your commander
- **Admin panel** — server-rendered HTML form at `/admin/new-deck` with URL-encoded POST and redirect
- **Seed script** — `npm run seed` pre-populates the database with 10 real cards from Scryfall
- **Request logging** — Morgan `dev` format logs every request with method, path, status, and response time

---

## AI Use

Functions and components written with AI assistance are marked with an `// ai` comment.