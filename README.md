# Product Catalog - Frontend

## Description
This project is the frontend for a product catalog application. It is built using modern tooling to ensure high performance, type safety, and strict code quality standards. The application leverages Vite for fast development and bundling, and TypeScript for robust type checking.

## Tech Stack
- **Bundler:** [Vite 6](https://vite.dev/) - Next generation frontend tooling.
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript.
- **Linting:** [ESLint](https://eslint.org/) with [TypeScript ESLint](https://typescript-eslint.io/) - For identifying and reporting on patterns in code.
- **CSS Engine:** [Lightning CSS](https://lightningcss.dev/) - An extremely fast CSS parser, transformer, and minifier.

## Live Demo

[View the live application](https://pcwa-front.vercel.app/)

## Prototype

You can view the interactive Figma prototype of this application here:
[Figma Prototype Site](https://voice-punch-44623607.figma.site/)

## Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: `^20.19.0`, `^22.13.0`, or `>=24`.
- **Package Manager**: `npm`, `pnpm`, or `yarn`.

## Installation Guide

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd pcwa-front
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible by default at `http://localhost:5173`.

## Available Scripts

- `npm run dev`: Starts the Vite development server with Hot Module Replacement (HMR).
- `npm run build`: Compiles and minifies the application for production.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs ESLint to check for code consistency and errors.
- `npm run test`: Runs the Vitest suite (services, validation, error formatting, components).

## Architecture (atomic design)

```
src/
  components/
    atoms/       Button, Modal, Toast (+ toastContext)
    molecules/   FormField, FilterBar, ProductCardSkeleton
    organisms/   ProductCard, ProductModal, ProductDetailModal, ProductTable,
                 StatsBar, BulkActionBar, CategoryManager, ImportModal,
                 TrashModal, LoginModal, ApiConnectionStatus
    templates/   ProductCatalogTemplate (layout slots only, no data)
  pages/         ProductCatalogPage (all catalog state and handlers)
  services/      ProductServices, CategoryServices, StatsServices,
                 AuthServices, UploadServices, realtime
  lib/           validation, apiError, authToken, productForm
  types/         catalog types (Category, Product, Stats, ...)
api.ts           HTTP client for products/categories (root, re-exports types)
```

Data flow: page -> services -> `api.ts`/fetch -> FastAPI. Components never
fetch directly (except the `ApiConnectionStatus` health probe). Reads are
public; writes need a staff login (Supabase Auth via the backend `POST
/auth/login`) and send `Authorization: Bearer <token>`.

## Environment

```env
VITE_BACKEND_API_BASE_URL="http://127.0.0.1:8000"
# Optional, enables realtime sync (T3.2). Without these, use Refresh.
VITE_SUPABASE_URL="https://<project>.supabase.co"
VITE_SUPABASE_ANON_KEY="<anon key>"
```

## Features

Search by name, category filter + price-range/in-stock filters, sorting,
grid/table views, product detail, rich fields (description, SKU, stock,
image URL or upload), category management, bulk delete/re-categorize, CSV
export/import, dashboard stats, soft-delete trash with restore and audit
trail, toast feedback, and login-gated editing.

## Configuration Inferred
- **Environment Variables:** The application supports environment variables through `.env` files. Variables prefixed with `VITE_` are exposed to your client-side code.
  ```
  # Example .env file
  VITE_API_URL=http://localhost:8080/api
  VITE_ANALYTICS_KEY=your_analytics_key
  ```
  For more details on how Vite handles environment variables, refer to the Vite documentation.

- **Vite:** Configured with TypeScript support and optimized dependency pre-bundling.
- **ESLint:** Uses flat configuration (`eslint.config.js`) and member-ordering rules for cleaner class structures.
- **TypeScript:** Strict type-checking enabled via `tsconfig.json`.

---
*Product catalog frontend built with React and TypeScript.*
