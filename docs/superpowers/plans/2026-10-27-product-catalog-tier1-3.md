# Product Catalog — Tier 1 to Tier 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single-page Product Catalog Dashboard into a complete, production-credible catalog — searchable, category-managed, rich in product data, observable, and secured — in three independently shippable tiers.

**Architecture:** Keep the existing split: React 19 + Vite + Tailwind CSS 4 frontend (atomic design: atoms/molecules/organisms/services) calling a FastAPI + Supabase (PostgreSQL) backend over REST. Every feature is backend-first (migration → Pydantic model → endpoint → service → UI) so each tier works end-to-end on its own. No new framework; new dependencies are added only where a task names them.

**Tech Stack:** Frontend: React 19.2, TypeScript 6 (strict, `noUnusedLocals`), Vite 8, Tailwind CSS 4, `lucide-react`. Backend: Python 3.10+, FastAPI, Pydantic v2, `supabase` Python client, `python-dotenv`, deployed via Vercel (`vercel.json` → `main.py`). Database: Supabase PostgreSQL tables `products`, `categories`.

**Spec:** Tier 1–3 feature list agreed in chat on 2026-10-27 (search, category management, detail view, richer fields, toasts, polling fix; stats, advanced filters, view toggle, bulk actions, CSV, image upload; auth, realtime, soft-delete/audit, tests). This plan is the implementation breakdown of that list.

## Global Constraints

- Page size stays `10` everywhere: backend `page_size = 10` in `list_products`, frontend `itemsPerPage = 10` in `App.tsx`. Do not change one without the other.
- API base URL comes only from `VITE_BACKEND_API_BASE_URL` (frontend, default `http://127.0.0.1:8000`) and `FRONTEND_URL` for CORS (backend, default `http://localhost:5173`). No hardcoded URLs in new code.
- Product `price` is `Decimal >= 0` on the backend and rendered `$X.XX` on the frontend. Keep that contract.
- IDs are UUIDs (`category_id`, product `id`). Frontend treats them as `string`.
- Brand tokens already in use stay: dark green `#00241B`, accent `#65B891` / `#4E878C`, font `font-sans`. New UI reuses `Button` variants (`primary | secondary | danger | ghost`), `Modal`, `FormField` + `FORM_INPUT_CLASSES`.
- Frontend must pass `npm run build` (`tsc -b && vite build`) and `npm run lint` with zero new errors. Backend must import cleanly: `python -c "from main import app"`.
- Every task is TDD: failing test first, then minimal code, then green, then commit. Commit per task, in plan order; do not squash tiers together.
- Secrets (`SUPABASE_URL`, `SUPABASE_KEY`) stay in `.env` only. Never commit them; never log them.
- Do not break existing endpoints: `GET/POST /products/`, `GET/PUT/DELETE /products/{id}`, `GET /products/category/{category_id}`, `GET/POST /categories/`, `GET /categories/{id}` keep their current shapes unless a task says otherwise.

## Review Focus

- Empty search string, whitespace-only search, and search with SQL wildcards (`%`, `_`) — must return sane results, never a 500 or a full-table dump by accident. Pinned in Task T1.2.
- Deleting a category that still has products — must be blocked with a clear 409, never orphan products. Pinned in Task T1.3.
- Price at boundaries: `0`, negative, more than 8 characters, non-numeric — backend 422 and frontend inline error must agree. Pinned in Task T1.1.
- Deleting the last product on the last page, and bulk-deleting across pages — pagination must not strand the user on an empty page. Pinned in Tasks T1.5 and T2.4.
- Expired or missing auth token on a write after Tier 3 — must return 401 and show a login prompt, never silently fail or fall back to anonymous write. Pinned in Task T3.1.

## Current State (grounded in both repos)

Frontend (`cognizant-assesment-front`): one page, `ProductCatalog` in `src/App.tsx`. State: `products`, `categories`, `filterCategoryId`, `sortBy` (`name | price_low | price_high`), `currentPage`, modal/edit/delete state. Polls categories and products every 3 s with a `JSON.stringify` cache ref. Services: `src/components/services/ProductServices.tsx` (`fetchProducts(categoryId, page, sortBy)`, `saveProduct`), `CategoryServices.tsx` (fetch only). Types in root `api.ts`: `Product { id, name, description, price, category_id }` — `description` is declared but never sent, stored, or shown. Components: `atoms/Button.tsx`, `atoms/Modal.tsx`, `molecules/FilterBar.tsx`, `molecules/FormField.tsx`, `molecules/ProductCardSkeleton.tsx`, `organisms/ProductCard.tsx`, `organisms/ProductModal.tsx` (validates name 1–25 chars, price 1–8 chars and > 0), `ApiConnectionStatus.tsx` (one-shot health toast). No router, no tests, no toast system; save/delete failures only `console.error`.

Backend (`cognizant-assesment-back`): `main.py` builds FastAPI app, `setup_cors` from `middleware/cors.py`, global handlers for Supabase `APIError` (400) and `RequestValidationError` (422). `api/products.py`: `ProductBase { name: str, price: Decimal(ge=0), category_id: UUID }`, `POST /` (201), `GET /` paginated `PaginatedProductResponse { items, total, page, size }` with `category_id` filter and `sort_by`, `GET /category/{category_id}`, `GET /{product_id}` (404), `PUT /{product_id}` (partial, 400 on empty, 404), `DELETE /{product_id}` (204, 404). `api/categories.py`: `CategoryBase { name }`, `POST /` (201), `GET /`, `GET /{id}` (404) — no update or delete. `api/supabase_client.py` creates one shared client from env. No auth, no search, no migrations folder, no tests.

Assumptions (reversible defaults, flag if wrong): Supabase SQL migrations are run manually in the Supabase SQL editor and committed as files for reproducibility. Currency stays USD. Users are internal staff, not public shoppers, so no cart/checkout is in scope.

## Key Decisions

- Search is server-side (`ilike` on `name`) so pagination counts stay correct. Client-side filtering of the current page was rejected: it lies about totals.
- Category delete is blocked (409) when products reference it, instead of cascade or null-out. Safer for an assessment demo and easier to explain.
- Richer fields are nullable additions (`description`, `image_url`, `sku`) plus `stock int default 0`, so existing rows and the old create payload keep working. No breaking migration.
- Polling is removed in favour of fetch-on-change plus explicit invalidation after mutations, with an optional query-cache library only if Task T1.6 proves hand-rolled state insufficient. This avoids a new dependency by default.
- Auth uses the same Supabase project (Supabase Auth JWT verified on the backend). A separate auth service was rejected as out of proportion.
- Soft delete uses `deleted_at` and default-filtered queries, with hard delete kept behind the trash flow. Existing `DELETE` semantics change only in Tier 3 and are called out there.

## File Structure

Backend (`cognizant-assesment-back/`): modify `api/products.py`, `api/categories.py`, `main.py`, `requirements.txt`; create `api/stats.py` (T2.1), `api/uploads.py` (T2.6), `api/auth.py` (T3.1), `supabase/migrations/*.sql` (one per schema task), `tests/` (`test_products.py`, `test_categories.py`, `test_stats.py`, `test_auth.py`).

Frontend (`cognizant-assesment-front/`): modify `api.ts`, `src/App.tsx`, `src/components/services/ProductServices.tsx`, `CategoryServices.tsx`, `src/components/molecules/FilterBar.tsx`, `src/components/organisms/ProductCard.tsx`, `ProductModal.tsx`; create `src/components/atoms/Toast.tsx` + `src/components/services/toast.tsx` (T1.5), `src/components/organisms/ProductDetailModal.tsx` (T1.4), `CategoryManager.tsx` (T1.3), `StatsBar.tsx` (T2.1), `ProductTable.tsx` (T2.3), `BulkActionBar.tsx` (T2.4), `src/components/services/AuthServices.tsx` + `src/components/organisms/LoginModal.tsx` (T3.1), `src/**/*.test.tsx` (T3.4). T3.1 adds the `@supabase/supabase-js` dependency for Auth/Realtime; no other new frontend dependency is planned.

Each new organism owns one job and receives data via props from `App.tsx`; services own all `fetch` calls. No component fetches directly except `ApiConnectionStatus`, which stays as-is.

---

## Tier 1 — Complete the story

Ship Tier 1 as one release, in task order. T1.1 unblocks T1.4; T1.3 shows errors inline until T1.5 lands, then its callbacks switch to toasts in T1.5's commit; T1.6 is last in the tier because it rewrites the data flow the others use.

### Task T1.1: Richer product fields (description, image_url, sku, stock)

**Files:**
- Create: `../cognizant-assesment-back/supabase/migrations/20261027_01_product_fields.sql`
- Modify: `../cognizant-assesment-back/api/products.py` (`ProductBase`, `ProductUpdate`)
- Modify: `api.ts` (`Product` interface), `src/components/organisms/ProductModal.tsx`, `src/components/organisms/ProductCard.tsx`
- Test: `../cognizant-assesment-back/tests/test_products.py`

**Interfaces:**
- Consumes: existing `ProductBase { name, price, category_id }`, `ProductServices.saveProduct(product, id?)`.
- Produces: `Product { id, name, description: string | null, price: number, category_id, image_url: string | null, sku: string | null, stock: number }` on both sides; create/update accept the same optional fields.

- [ ] **Step 1: Write the failing test** — `test_create_product_with_rich_fields_round_trips` posts `{name, price, category_id, description, sku, stock}` and asserts the 201 body echoes them; `test_create_product_rejects_negative_stock` expects 422; `test_create_product_without_optional_fields_still_works` expects 201 with `stock == 0`.
- [ ] **Step 2: Run it** — `cd ../cognizant-assesment-back && python -m pytest tests/test_products.py -v`. Expected: FAIL (fields dropped or 422 missing).
- [ ] **Step 3: Implement** — Migration adds `description text`, `image_url text`, `sku text`, `stock integer not null default 0 check (stock >= 0)` to `products` (run in Supabase SQL editor, commit the file). Add `description: Optional[str] = None`, `image_url: Optional[str] = None`, `sku: Optional[str] = None`, `stock: int = Field(0, ge=0)` to `ProductBase`; mirror optionals in `ProductUpdate`. Frontend: extend `Product` in `api.ts`; add Description (textarea), SKU, Stock (number, min 0), Image URL fields to `ProductModal` reusing `FormField`; show stock badge and truncated description on `ProductCard`.
- [ ] **Step 4: Run tests + build** — backend pytest PASS; frontend `npm run build && npm run lint` PASS. Manual: create a product with stock 0 and confirm the card shows an out-of-stock state, not a crash.
- [ ] **Step 5: Commit** — `feat: add description, image_url, sku, stock to products` (backend and frontend in their own repos).

### Task T1.2: Search by name (server-side)

**Files:**
- Modify: `../cognizant-assesment-back/api/products.py` (`list_products` gains `search: Optional[str] = Query(None)`)
- Modify: `src/components/services/ProductServices.tsx`, `src/components/molecules/FilterBar.tsx`, `src/App.tsx`
- Test: `../cognizant-assesment-back/tests/test_products.py`

**Interfaces:**
- Consumes: `GET /products/?category_id&page&sort_by` returning `PaginatedProductResponse`; `FilterBarProps`.
- Produces: `fetchProducts(categoryId, page, sortBy, search?) => Promise<{ products, total }>`; `GET /products/?search=<term>` filters `name ilike %term%` before sorting/pagination, and `total` reflects the filtered count.

- [ ] **Step 1: Write the failing test** — `test_search_filters_by_name_case_insensitive` seeds two products and asserts only the match returns with `total == 1`; `test_search_empty_string_behaves_like_no_search`; `test_search_with_wildcard_chars_does_not_500` (`search="%"` returns 200).
- [ ] **Step 2: Run it** — pytest on that file. Expected: FAIL (param ignored).
- [ ] **Step 3: Implement** — Backend: when `search` is non-empty after `strip()`, apply `.ilike("name", f"%{search.strip()}%")` before ordering/range. Frontend: add a search input to `FilterBar` (props `search`, `onSearchChange`), debounce 300 ms in `App.tsx`, reset `currentPage` to 1 on change, pass through `ProductServices`. Add the term to the cache key.
- [ ] **Step 4: Run tests + build** — pytest PASS; `npm run build` PASS. Manual: type a partial name, confirm grid and "Showing X of Y" update and page resets.
- [ ] **Step 5: Commit** — `feat: server-side product search by name`.

### Task T1.3: Category management (create, rename, guarded delete)

**Files:**
- Modify: `../cognizant-assesment-back/api/categories.py` (add `PUT /{id}`, `DELETE /{id}`)
- Modify: `api.ts` (category write helpers), `src/components/services/CategoryServices.tsx`
- Create: `src/components/organisms/CategoryManager.tsx`
- Modify: `src/App.tsx` (open manager, refresh categories)
- Test: `../cognizant-assesment-back/tests/test_categories.py`

**Interfaces:**
- Consumes: existing `POST /categories/`, `GET /categories/`; `Category { id, name }`.
- Produces: `PUT /categories/{id} {name} -> Category` (404 unknown id, 422 empty name); `DELETE /categories/{id} -> 204` or `409 {detail}` when products reference it; `CategoryServices.createCategory(name)`, `updateCategory(id, name)`, `deleteCategory(id)`; `CategoryManager` props `{ categories, onClose, onChanged }`.

- [ ] **Step 1: Write the failing test** — `test_update_category_renames`, `test_delete_unused_category_returns_204`, `test_delete_category_with_products_returns_409`, `test_update_missing_category_returns_404`.
- [ ] **Step 2: Run it** — pytest. Expected: FAIL (405/404 on new routes).
- [ ] **Step 3: Implement** — Backend update mirrors `update_product` (reject empty payload). Delete first counts `products where category_id = id`; if count > 0 raise 409 with a human-readable detail, else delete and return 204. Frontend: extend `CategoryServices` using the same fetch/error style as `productApi`; `CategoryManager` is a `Modal` listing categories with inline rename, add form (name 1–50 chars), and delete with confirm; on success call `onChanged` so `App` refetches categories and the filter dropdown updates.
- [ ] **Step 4: Run tests + build** — pytest PASS; build/lint PASS. Manual: try deleting the category of an existing product and confirm the 409 message is shown, not a silent failure (depends on T1.5 toast; before T1.5, inline text in the manager is acceptable).
- [ ] **Step 5: Commit** — `feat: category create, rename, guarded delete`.

### Task T1.4: Product detail view

**Files:**
- Create: `src/components/organisms/ProductDetailModal.tsx`
- Modify: `src/components/organisms/ProductCard.tsx` (card click opens detail; edit/delete buttons stop propagation), `src/App.tsx`
- Test: manual check in Step 4 now; rendering test backfilled in T3.4 (`ProductDetailModal.test.tsx`)

**Interfaces:**
- Consumes: full `Product` from T1.1 and `categories` for the name lookup already done in `ProductCard`.
- Produces: `ProductDetailModal { product, categoryName, onClose, onEdit }` — read-only view of name, price, category, description, SKU, stock, image (with fallback when `image_url` is null/broken).

- [ ] **Step 1: Write the failing check** — acceptance note: detail for a product with null `image_url`/`description` renders name/price/category with the placeholder, and Edit fires the existing edit flow once. (Automated rendering test is backfilled in T3.4.)
- [ ] **Step 2: Run it** — `npm run build`. Expected: FAIL (component missing) once `App.tsx` references it.
- [ ] **Step 3: Implement** — Reuse `Modal` (`max-w-lg`). Image `onError` swaps to a placeholder block. Edit button closes detail and opens the existing `ProductModal` via `App.handleEditClick`.
- [ ] **Step 4: Run build + manual** — `npm run build && npm run lint` PASS. Manual: open detail, edit from detail, delete from card still confirms.
- [ ] **Step 5: Commit** — `feat: product detail view`.

### Task T1.5: Toasts and surfaced errors

**Files:**
- Create: `src/components/atoms/Toast.tsx`, `src/components/services/toast.tsx` (context + `useToast`)
- Modify: `src/App.tsx` (wrap app, replace `console.error` handlers), `src/components/organisms/ProductModal.tsx` (show server validation detail), `src/main.tsx` if the provider belongs there
- Test: `../cognizant-assesment-back/tests/test_products.py` (422 shape) plus frontend manual checks

**Interfaces:**
- Consumes: backend error shape `{ detail }` (string for `HTTPException`, list for 422) already produced by `main.py` handlers; `productApi` throws `Error` with that detail in the message.
- Produces: `toast.success(msg)`, `toast.error(msg)` auto-dismissing (4 s), stacked top-right, `role="status"`; all create/update/delete/category flows report success and failure through it.

- [ ] **Step 1: Write the failing test** — backend: `test_create_product_invalid_price_returns_422_with_detail` asserts 422 and a `detail` field. Frontend manual script listed in Step 4 (no runner yet is acceptable if T3.4 is noted as the automation task).
- [ ] **Step 2: Run backend test** — pytest. Expected: PASS already for 422 shape (it pins the contract the UI will rely on); if it fails, fix the handler first.
- [ ] **Step 3: Implement** — Toast context/provider + viewport; parse FastAPI `detail` (string vs list of `{loc, msg}` → first readable message) in one helper inside `api.ts` error handling, reuse in services. Wire `handleFormSubmit`, `confirmDelete`, category manager callbacks, and product load failure (retry button in the empty state) to toasts. Remove now-redundant `console.error` or keep it alongside — state the choice in the commit.
- [ ] **Step 4: Verify** — pytest PASS; `npm run build && npm run lint` PASS. Manual: force a failure (stop backend, try delete) and confirm an error toast names the failure; create a product and confirm success toast; confirm empty-page-after-delete still steps back a page.
- [ ] **Step 5: Commit** — `feat: toast notifications and surfaced API errors`.

### Task T1.6: Remove 3-second polling

**Files:**
- Modify: `src/App.tsx` (delete both `setInterval` effects and `productsCacheRef`/`categoriesCacheRef` string-compare logic), `src/components/ApiConnectionStatus.tsx` only if its one-shot check conflicts
- Test: manual + `npm run build`; backend unchanged

**Interfaces:**
- Consumes: mutation handlers from T1.3/T1.5 that already update local state.
- Produces: data loads on mount and on `filterCategoryId | currentPage | sortBy | search` change; after create/update/delete the list refetches (or locally reconciles then refetches page 1 counts). No timers.

- [ ] **Step 1: Write the failing check** — document current behaviour: with the app open and backend data changed externally, UI updates within 3 s (polling). After the change this must NOT happen until a local action or manual refresh — write that as the acceptance note in the PR description.
- [ ] **Step 2: Confirm scope** — grep `setInterval` in `src/`; only `App.tsx` (two effects) and none elsewhere. Expected: exactly those two.
- [ ] **Step 3: Implement** — Single `loadProducts(showSkeleton)` effect keyed on filter/page/sort/search; `loadCategories` on mount and after category mutations. Add a Refresh button in `FilterBar`. Keep skeleton only on filter/page changes, not on mutation refetch. Only if this proves tangled, introduce a query-cache library as a separate commit with its justification — do not add it pre-emptively.
- [ ] **Step 4: Verify** — `npm run build && npm run lint` PASS. Manual: create/edit/delete/search/paginate and confirm instant UI update with no network requests in DevTools while idle for 30 s.
- [ ] **Step 5: Commit** — `refactor: replace polling with fetch-on-change`.

**Tier 1 definition of done:** all six tasks green; a user can search, manage categories, open a detail view, create a rich product, see every failure as a toast, and the Network tab is idle when they are. Demo script: search → filter → detail → edit stock → delete with toast.

---

## Tier 2 — Real product feel

Tier 2 assumes Tier 1 is merged. Each task still ships alone; T2.1 and T2.2 both extend `list_products`/stats and should not run in parallel on the same branch without rebasing.

### Task T2.1: Dashboard stats

**Files:**
- Create: `../cognizant-assesment-back/api/stats.py`, `src/components/organisms/StatsBar.tsx`
- Modify: `../cognizant-assesment-back/main.py` (include router), `src/App.tsx`, `api.ts` (stats type + fetch)
- Test: `../cognizant-assesment-back/tests/test_stats.py`

**Interfaces:**
- Consumes: `products` (with `stock` from T1.1) and `categories` tables.
- Produces: `GET /stats -> { total_products: int, total_categories: int, average_price: number, inventory_value: number }` where `inventory_value = sum(price * stock)`; `StatsBar { stats }` renders four stat cards above `FilterBar`, refetched after mutations.

- [ ] **Step 1: Write the failing test** — `test_stats_empty_catalog_returns_zeros` (no divide-by-zero), `test_stats_counts_and_averages_match_seed`.
- [ ] **Step 2: Run it** — pytest. Expected: FAIL (404).
- [ ] **Step 3: Implement** — Backend aggregates via Supabase selects (count exact; fetch `price, stock` and compute in Python — fine at catalog scale, note the limit). Frontend fetch in `App` alongside products; skeleton or `—` while loading.
- [ ] **Step 4: Verify** — pytest PASS; build PASS. Manual: add a product and confirm totals move without refresh (post-T1.6 refetch).
- [ ] **Step 5: Commit** — `feat: dashboard stats endpoint and bar`.

### Task T2.2: Advanced filters (price range, in-stock)

**Files:**
- Modify: `../cognizant-assesment-back/api/products.py` (`min_price`, `max_price`, `in_stock` query params), `src/components/services/ProductServices.tsx`, `src/components/molecules/FilterBar.tsx`, `src/App.tsx`
- Test: `../cognizant-assesment-back/tests/test_products.py`

**Interfaces:**
- Consumes: search/sort/pagination from T1.2; `stock` from T1.1.
- Produces: `GET /products/?min_price&max_price&in_stock=true` composable with `search`, `category_id`, `sort_by`; invalid range (`min > max`) returns 422 with readable `detail`; `fetchProducts` gains an options object `{ search?, minPrice?, maxPrice?, inStock? }` — migrate the T1.2 positional args to this object in the same commit and update callers.

- [ ] **Step 1: Write the failing test** — `test_price_range_filters`, `test_in_stock_excludes_zero_stock`, `test_min_greater_than_max_returns_422`, `test_filters_compose_with_search_and_category`.
- [ ] **Step 2: Run it** — pytest. Expected: FAIL.
- [ ] **Step 3: Implement** — Backend applies `.gte("price", min_price)`, `.lte("price", max_price)`, `.gt("stock", 0)` in the same builder before range. Frontend adds two number inputs and an in-stock checkbox to `FilterBar`, resets page on change, validates `min <= max` inline before calling.
- [ ] **Step 4: Verify** — pytest PASS; build/lint PASS. Manual: combine search + category + range and confirm `total` matches the grid.
- [ ] **Step 5: Commit** — `feat: price range and in-stock filters`.

### Task T2.3: Grid / list / table view toggle

**Files:**
- Create: `src/components/organisms/ProductTable.tsx`
- Modify: `src/App.tsx` (view state persisted to `localStorage`), `src/components/molecules/FilterBar.tsx` (toggle control)
- Test: manual + build (rendering test welcome in T3.4)

**Interfaces:**
- Consumes: same `products`, `categories`, `onEdit`, `onDelete` as `ProductCard`.
- Produces: `ProductTable { products, categories, onEdit, onDelete, onView }` — dense rows (name, category, price, stock, actions); view mode `grid | table` survives reload.

- [ ] **Step 1: Write the failing check** — acceptance note: toggling to table shows the same page of products with working edit/delete/detail; refreshing keeps table mode.
- [ ] **Step 2: Confirm reuse** — table row actions must call the identical handlers as cards; no new service calls.
- [ ] **Step 3: Implement** — Semantic `<table>` with accessible headers; reuse `Button` variants; detail opens on row click (same handler as T1.4).
- [ ] **Step 4: Verify** — build/lint PASS. Manual keyboard pass: tab to Edit/Delete in both views.
- [ ] **Step 5: Commit** — `feat: grid and table view toggle`.

### Task T2.4: Bulk actions (multi-select delete, re-categorize)

**Files:**
- Create: `src/components/organisms/BulkActionBar.tsx`, `../cognizant-assesment-back/api/products.py` bulk endpoints (in the same file, new routes)
- Modify: `src/App.tsx`, `src/components/organisms/ProductCard.tsx` + `ProductTable.tsx` (checkbox), `src/components/services/ProductServices.tsx`
- Test: `../cognizant-assesment-back/tests/test_products.py`

**Interfaces:**
- Consumes: product IDs (UUID strings), category list.
- Produces: `POST /products/bulk-delete { ids: string[] } -> { deleted: int, failed: [{ id, reason }] }` (partial success; unknown IDs are reported, never fail the batch); `POST /products/bulk-categorize { ids, category_id } -> { updated: int }` (422 unknown category). Frontend selection is per-page, cleared on page/filter change.

- [ ] **Step 1: Write the failing test** — `test_bulk_delete_removes_listed_only`, `test_bulk_delete_reports_unknown_id_without_failing_others`, `test_bulk_categorize_rejects_unknown_category_422`, `test_bulk_empty_ids_returns_422`.
- [ ] **Step 2: Run it** — pytest. Expected: FAIL.
- [ ] **Step 3: Implement** — Backend validates non-empty `ids`, executes per-ID or `.in_("id", ids)` with a pre-check for unknown IDs to build the partial report. Frontend: checkbox on card/table row, `BulkActionBar` appears when selection > 0 with count, category picker, Delete (confirm modal reusing T1.5 patterns), Clear. After success, refetch and handle last-page step-back.
- [ ] **Step 4: Verify** — pytest PASS; build/lint PASS. Manual: select across a full page, bulk-delete, confirm pagination and stats (T2.1) update.
- [ ] **Step 5: Commit** — `feat: bulk delete and re-categorize`.

### Task T2.5: CSV export / import

**Files:**
- Modify: `../cognizant-assesment-back/api/products.py` (`GET /products/export`, `POST /products/import`), `src/App.tsx` (Export/Import buttons), `src/components/services/ProductServices.tsx`
- Create: `src/components/organisms/ImportModal.tsx` (file pick, per-row results)
- Test: `../cognizant-assesment-back/tests/test_products.py`

**Interfaces:**
- Consumes: rich `Product` fields from T1.1; category names must resolve to IDs on import.
- Produces: export returns `text/csv` with header `name,description,price,category_name,sku,stock,image_url`, honouring current `category_id`/`search` filters when passed. Import accepts the same header, returns `{ created: int, failed: [{ row: int, reason: string }] }`, never partially commits a row, and caps file size (state the cap, suggested 2 MB / 1000 rows) with 413/422 beyond it.

- [ ] **Step 1: Write the failing test** — `test_export_returns_csv_with_header_and_rows`, `test_import_creates_valid_rows_and_reports_bad_price_row`, `test_import_unknown_category_name_is_reported_not_created`, `test_export_respects_category_filter`.
- [ ] **Step 2: Run it** — pytest. Expected: FAIL.
- [ ] **Step 3: Implement** — Backend uses Python `csv` on `io.StringIO`; `StreamingResponse`/`Response` with `Content-Disposition: attachment`. Import parses with `csv.DictReader`, validates each row through `ProductCreate` (resolve `category_name` → ID first), collects failures. Frontend export is an anchor download with current filter params; import modal uploads via `FormData` and renders the per-row report, then refetches.
- [ ] **Step 4: Verify** — pytest PASS; build PASS. Manual round-trip: export, edit a price in the CSV, import, confirm the grid reflects it.
- [ ] **Step 5: Commit** — `feat: CSV export and import`.

### Task T2.6: Image upload (Supabase Storage)

**Files:**
- Create: `../cognizant-assesment-back/supabase/migrations/20261027_02_storage_bucket.sql`, `../cognizant-assesment-back/api/uploads.py`, `src/components/services/UploadServices.ts`
- Modify: `../cognizant-assesment-back/main.py` (include uploads router)
- Modify: `src/components/organisms/ProductModal.tsx` (file input + preview, falls back to URL field from T1.1), `src/components/organisms/ProductCard.tsx`, `ProductDetailModal.tsx`
- Test: backend unchanged contract test (image_url persisted) + frontend manual

**Interfaces:**
- Consumes: `image_url` column from T1.1; Supabase project already in use.
- Produces: public bucket `product-images`; upload returns a public URL stored via the existing create/update payload. Client validates type (`image/png|jpeg|webp`) and size (state cap, suggested 5 MB) before upload; failures go through T1.5 toasts.

- [ ] **Step 1: Write the failing check** — acceptance note: uploading a PNG in the create form shows it on the card and detail; uploading a `.txt` is rejected client-side with a toast and no request.
- [ ] **Step 2: Create bucket** — public `product-images` bucket with insert/read policies documented in the migration file/README note; verify a manual upload in Supabase dashboard appears at its public URL.
- [ ] **Step 3: Implement** — Backend endpoint `POST /uploads/product-image` (multipart) uploads via the existing Python Supabase client storage API and returns `{ url }`; `UploadServices.uploadProductImage(file) => Promise<string>` calls it. This keeps storage keys server-side and adds no frontend dependency. Wire preview + remove in `ProductModal`; keep URL paste as fallback.
- [ ] **Step 4: Verify** — build/lint PASS. Manual: create with upload, reload, confirm image persists; break the URL and confirm the T1.4 placeholder.
- [ ] **Step 5: Commit** — `feat: product image upload`.

**Tier 2 definition of done:** stats agree with the grid, filters compose, both views work with the same handlers, bulk and CSV flows report partial failures honestly, and uploaded images survive reload. Demo script: filter → table view → bulk re-categorize → export → import tweak → stats move.

---

## Tier 3 — Production credibility

Tier 3 changes trust boundaries. Land T3.1 before T3.2/T3.3 so realtime and audit can carry user identity. Expect a short freeze on Tier 2 polish while auth lands.

### Task T3.1: Auth (Supabase Auth, protected writes)

**Files:**
- Create: `../cognizant-assesment-back/api/auth.py` (JWT verification dependency), `src/components/services/AuthServices.tsx`, `src/components/organisms/LoginModal.tsx`
- Modify: `../cognizant-assesment-back/api/products.py`, `api/categories.py` (protect `POST/PUT/DELETE` including bulk/import/upload routes), `api.ts` / services (attach `Authorization` header), `src/App.tsx` (login/logout, hide write actions when anonymous), `package.json` (add `@supabase/supabase-js`), both README files (first-user setup)
- Test: `../cognizant-assesment-back/tests/test_auth.py`

**Interfaces:**
- Consumes: Supabase Auth users (email/password to start); `SUPABASE_URL` already configured.
- Produces: backend dependency `require_user` validating the Bearer token via the Supabase Auth API (`supabase.auth.get_user(token)`; mocked in tests — no JWKS handling in v1); reads stay public, writes return 401 without a valid token; frontend stores the session via `AuthServices`, sends `Authorization: Bearer <token>` on every write, and treats 401 as "session expired → open login".

- [ ] **Step 1: Write the failing test** — `test_create_product_without_token_returns_401`, `test_create_product_with_valid_token_returns_201` (verification mocked), `test_list_products_stays_public`, `test_expired_token_returns_401`.
- [ ] **Step 2: Run it** — pytest. Expected: FAIL (writes currently open).
- [ ] **Step 3: Implement** — Backend dependency applied per-route to writes only. CORS already allows all headers; confirm `Authorization` passes preflight. Frontend login modal (email/password), session persistence, logout, header shows user + auth state; Add/Edit/Delete/Category/Bulk/Import controls disabled with a "Login to edit" hint when anonymous. Update READMEs with how to create the first user in Supabase Auth.
- [ ] **Step 4: Verify** — pytest PASS; build/lint PASS. Manual: anonymous can browse/search but every write attempt is blocked in UI and 401s if forced via curl; after login the full Tier 1–2 write flows work; expired-token simulation shows the login prompt (Review Focus).
- [ ] **Step 5: Commit** — `feat: Supabase Auth with protected writes`.

### Task T3.2: Realtime updates

**Files:**
- Modify: `src/App.tsx` (subscribe/unsubscribe), possibly `src/components/services/ProductServices.tsx` (refetch entry point reused by the subscription)
- Create: `../cognizant-assesment-back/supabase/migrations/20261027_03_realtime.sql` enabling replication on `products` (and `categories`)
- Test: manual two-tab check + build

**Interfaces:**
- Consumes: authenticated or anon Supabase client on the frontend (state which, consistent with T3.1 row-level policies); refetch functions from T1.6.
- Produces: inserts/updates/deletes by another client appear without manual refresh within ~2 s; the subscription is torn down on unmount and does not duplicate after filter changes.

- [ ] **Step 1: Write the failing check** — acceptance note: two browser tabs side by side; create in tab A appears in tab B untouched; deleting in B removes it in A.
- [ ] **Step 2: Enable replication** — migration/dashboard step enables Realtime for `products` and `categories`; confirm the publication change in Supabase.
- [ ] **Step 3: Implement** — Subscribe to `postgres_changes` for both tables; on any event, debounce-refetch products and categories (reuse T1.6 loaders; do not hand-merge rows in v1). Re-subscribe cleanly when filters change or rely on refetch-only — state the choice.
- [ ] **Step 4: Verify** — build PASS; two-tab manual check passes three times in a row (create, edit, delete). Idle tab shows no polling storm in DevTools.
- [ ] **Step 5: Commit** — `feat: realtime catalog sync`.

### Task T3.3: Soft delete, trash, restore, audit trail

**Files:**
- Create: `../cognizant-assesment-back/supabase/migrations/20261027_04_soft_delete_audit.sql`, `src/components/organisms/TrashModal.tsx`
- Modify: `../cognizant-assesment-back/api/products.py` (default-exclude deleted, `GET /products/trash`, `POST /products/{id}/restore`, `DELETE /products/{id}/permanent`), `src/App.tsx`, `src/components/services/ProductServices.tsx`
- Test: `../cognizant-assesment-back/tests/test_products.py`

**Interfaces:**
- Consumes: user identity from T3.1 for audit actor.
- Produces: `products.deleted_at timestamptz null`; `DELETE /products/{id}` now soft-deletes (still 204); list/search/export/bulk default to `deleted_at is null`; `product_audit { id, product_id, actor, action, before jsonb, after jsonb, created_at }` written on create/update/soft-delete/restore/permanent-delete; Trash modal lists deleted items with Restore and Delete forever (confirm).

- [ ] **Step 1: Write the failing test** — `test_soft_delete_hides_from_list_but_appears_in_trash`, `test_restore_returns_product_to_list`, `test_permanent_delete_removes_from_trash`, `test_audit_row_written_on_update_with_actor`.
- [ ] **Step 2: Run it** — pytest. Expected: FAIL.
- [ ] **Step 3: Implement** — Migration adds column + audit table. Thread the `deleted_at is null` predicate through `list_products`, search, filters, stats (T2.1), and export so counts never include trash. Audit writes happen in the same request after a successful mutation; if audit insert fails, log and surface 500 rather than silently losing the trail — state this failure policy in the PR.
- [ ] **Step 4: Verify** — pytest PASS (including all Tier 1–2 product tests re-run against the new predicate); build PASS. Manual: delete → trash → restore → delete → delete forever, checking the grid, trash, and stats each time.
- [ ] **Step 5: Commit** — `feat: soft delete, trash, restore, audit trail`.

### Task T3.4: Automated test suites and CI-ready checks

**Files:**
- Create: `../cognizant-assesment-back/tests/conftest.py` (mocked Supabase client / test app), frontend test setup (`vitest` config in `vite.config.ts` or `vitest.config.ts`, `src/**/*.test.tsx` for `ProductModal` validation, `ProductDetailModal`, `FilterBar`, services)
- Modify: both `package.json` / `requirements.txt` (dev test deps: backend `pytest` + FastAPI test client; frontend test runner + DOM assertions), both READMEs (how to run tests)
- Test: the suites themselves

**Interfaces:**
- Consumes: every endpoint and component contract pinned above.
- Produces: backend `python -m pytest` green without real Supabase credentials (Supabase client mocked/faked in `conftest.py`); frontend `npm run test` green; `npm run build && npm run lint` remain the static gates. Note: earlier tasks already added their tests — this task backfills component/service coverage and the harness, it is not permission to defer all testing to here.

- [ ] **Step 1: Write the failing test** — one service test (`fetchProducts` builds the right query string for search/filter/sort) and one component test (name validation message at 26 chars) that fail because no runner exists.
- [ ] **Step 2: Run it** — `npm run test`. Expected: FAIL (script missing).
- [ ] **Step 3: Implement** — Add runner + setup, backend fixtures that fake `supabase.table(...)` chains used in `api/products.py`/`categories.py`, and the backfill tests. Keep tests fast (< 60 s total per suite) and credential-free.
- [ ] **Step 4: Verify** — both suites PASS from a clean checkout using only the README steps; deliberately break `search` handling locally and confirm a test catches it, then revert.
- [ ] **Step 5: Commit** — `test: backend and frontend suites with mocked Supabase`.

**Tier 3 definition of done:** anonymous users cannot write (UI and API agree), two tabs stay in sync, nothing is ever truly gone without a trash step and an audit row, and both test suites run credential-free. Demo script: login → edit in tab A → watch tab B → soft-delete → restore from trash → show audit → run both suites.

---

## Execution Order and Estimates

Order within a tier is the task order above. Across tiers: Tier 1 (release 1) → Tier 2 (release 2) → Tier 3 (release 3). Rough sizes for one developer: T1.1 M, T1.2 S, T1.3 M, T1.4 S, T1.5 S–M, T1.6 M; T2.1 S, T2.2 S–M, T2.3 M, T2.4 M, T2.5 M, T2.6 M; T3.1 L, T3.2 M, T3.3 M–L, T3.4 M spread across all tiers. (S ≈ half day, M ≈ 1–2 days, L ≈ 3+ days including manual Supabase setup.) Highest-risk steps: T3.1 token verification choice, T3.3 threading the soft-delete predicate through every query (miss one and counts lie), and T1.6 removing polling without breaking the delete-last-item page step-back.

## Validation Plan

- Backend per task: `cd ../cognizant-assesment-back && python -m pytest -v` (credential-free after T3.4 fixtures; before that, tests that need Supabase are marked and run against the dev project — state which in each PR).
- Backend smoke: `uvicorn main:app --reload` then `GET http://127.0.0.1:8000/docs` and exercise the changed route in Swagger.
- Frontend per task: `npm run build` (includes `tsc -b`) and `npm run lint`, both zero-error; after T3.4 also `npm run test`.
- End-to-end per tier: run the tier's demo script above against local backend + frontend (`npm run dev`, API at `VITE_BACKEND_API_BASE_URL`), including one forced-failure check (backend stopped) and one mobile-width pass (the header/grid already have `sm:`/`md:` breakpoints — do not regress them).
- Regression guard: after T3.3, re-run the full Tier 1–2 manual scripts once, because the soft-delete predicate touches every read path.

## Risks / Open Questions

- Supabase free-tier limits and Realtime availability affect T3.2; if Realtime is unavailable, the fallback is the T1.6 manual Refresh plus optional slow (30 s) refetch — decide before starting T3.2, not during.
- Storage (T2.6) and Auth (T3.1) both depend on Supabase dashboard configuration that cannot be committed; every such step must land as a migration file or a README checklist in the same PR, or the next developer cannot reproduce it.
- The frontend `description` type is currently non-nullable in `api.ts` while the plan makes it nullable; T1.1 must update every consumer in the same commit or `tsc` will (correctly) block the build.
- Open: should anonymous users see stock levels after T3.1, or only logged-in staff? Default in this plan: catalog including stock stays public, writes are protected. Flag if the assessment wants a fully private app.
None of the other choices need answers before starting: they take the defaults stated in Key Decisions and Assumptions. Image upload is settled in T2.6: backend endpoint, keys stay server-side.


