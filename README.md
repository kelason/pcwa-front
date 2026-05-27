# Cognizant Assessment - Frontend

## 🌐 Live API

The production API is accessible at: [https://pcwa-front.vercel.app/](https://pcwa-front.vercel.app/)

## Description
This project is a frontend application developed for the Cognizant assessment. It is built using modern tooling to ensure high performance, type safety, and strict code quality standards. The application leverages Vite for fast development and bundling, and TypeScript for robust type checking.

## Tech Stack
- **Bundler:** [Vite 6](https://vite.dev/) - Next generation frontend tooling.
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript.
- **Linting:** [ESLint](https://eslint.org/) with [TypeScript ESLint](https://typescript-eslint.io/) - For identifying and reporting on patterns in code.
- **CSS Engine:** [Lightning CSS](https://lightningcss.dev/) - An extremely fast CSS parser, transformer, and minifier.

## Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: `^20.19.0`, `^22.13.0`, or `>=24`.
- **Package Manager**: `npm`, `pnpm`, or `yarn`.

## Installation Guide

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd cognizant-assesment-front
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

## Configuration Inferred
- **Environment Variables:** The application supports environment variables through `.env` files. Variables prefixed with `VITE_` are exposed to your client-side code.

  Create a `.env` file in the root directory:
  ```env
  # Example .env file
  VITE_BACKEND_API_BASE_URL="http://127.0.0.1:8000"
  ```
  For more details on how Vite handles environment variables, refer to the Vite documentation.

- **Vite:** Configured with TypeScript support and optimized dependency pre-bundling.
- **ESLint:** Uses flat configuration (`eslint.config.js`) and member-ordering rules for cleaner class structures.
- **TypeScript:** Strict type-checking enabled via `tsconfig.json`.

---
*Developed as part of a technical assessment.*
