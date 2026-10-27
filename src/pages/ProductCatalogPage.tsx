import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../components/atoms/Button';
import { Modal } from '../components/atoms/Modal';
import { useToast } from '../components/atoms/toastContext';
import { FilterBar } from '../components/molecules/FilterBar';
import { ProductCardSkeleton } from '../components/molecules/ProductCardSkeleton';
import { ApiConnectionStatus } from '../components/organisms/ApiConnectionStatus';
import { BulkActionBar } from '../components/organisms/BulkActionBar';
import { CategoryManager } from '../components/organisms/CategoryManager';
import { ImportModal } from '../components/organisms/ImportModal';
import { LoginModal } from '../components/organisms/LoginModal';
import { ProductCard } from '../components/organisms/ProductCard';
import { ProductDetailModal } from '../components/organisms/ProductDetailModal';
import { ProductModal } from '../components/organisms/ProductModal';
import { emptyProductForm, formFromProduct, type ProductFormValues } from '../lib/productForm';
import { ProductTable } from '../components/organisms/ProductTable';
import { StatsBar } from '../components/organisms/StatsBar';
import { TrashModal } from '../components/organisms/TrashModal';
import { ProductCatalogTemplate } from '../components/templates/ProductCatalogTemplate';
import { ApiError, UNAUTHORIZED_EVENT } from '../lib/apiError';
import { AuthServices } from '../services/AuthServices';
import { CategoryServices } from '../services/CategoryServices';
import { ProductServices } from '../services/ProductServices';
import { StatsServices } from '../services/StatsServices';
import { subscribeToCatalogChanges } from '../services/realtime';
import type { Category, Product, ProductFilters, Stats } from '../types/catalog';

const ITEMS_PER_PAGE = 10;

export default function ProductCatalogPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<string | 'All Categories'>('All Categories');
  const [filters, setFilters] = useState<ProductFilters>({ sortBy: 'name', search: '' });
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    try { return localStorage.getItem('pcwa_view_mode') === 'table' ? 'table' : 'grid'; } catch { return 'grid'; }
  });
  const [user, setUser] = useState(AuthServices.getUser());
  const canWrite = Boolean(user);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const requireLogin = useCallback(() => {
    toast.error('Login to edit the catalog.');
    setShowLogin(true);
  }, [toast]);

  const dropSession = useCallback(() => {
    AuthServices.logout();
    setUser(null);
  }, []);

  // Any 401 anywhere (page or modal) drops the dead session and opens login.
  useEffect(() => {
    const onUnauthorized = () => { dropSession(); requireLogin(); };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [dropSession, requireLogin]);

  const handleApiError = useCallback((err: unknown, fallback: string) => {
    if (err instanceof ApiError && err.status === 401) { dropSession(); requireLogin(); return; }
    toast.error(err instanceof Error ? err.message : fallback);
  }, [dropSession, requireLogin, toast]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(filters.search?.trim() ?? ''), 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [filters.search]);

  const activeFilters: ProductFilters = { ...filters, search: debouncedSearch };

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await CategoryServices.fetchAllCategories());
    } catch (err) {
      handleApiError(err, 'Failed to load categories.');
    }
  }, [handleApiError]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await StatsServices.fetchStats());
    } catch {
      setStats(null);
    }
  }, []);

  const loadSequence = useRef(0);
  const loadProducts = useCallback(async () => {
    const sequence = ++loadSequence.current;
    try {
      const data = await ProductServices.fetchProducts(filterCategoryId, currentPage, activeFilters);
      if (sequence !== loadSequence.current) return; // a newer load superseded this one
      setProducts(data.products);
      setTotalCount(data.total);
      setLoadError(null);
    } catch (err) {
      if (sequence !== loadSequence.current) return;
      setLoadError(err instanceof Error ? err.message : 'Failed to load products.');
      handleApiError(err, 'Failed to load products.');
    } finally {
      if (sequence === loadSequence.current) setIsLoading(false);
    }
    // activeFilters is derived from filters + debouncedSearch; listed via deps below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategoryId, currentPage, debouncedSearch, filters.sortBy, filters.minPrice, filters.maxPrice, filters.inStock, handleApiError]);

  useEffect(() => {
    let cancelled = false;
    CategoryServices.fetchAllCategories()
      .then((data) => { if (!cancelled) setCategories(data); })
      .catch((err: unknown) => { if (!cancelled) handleApiError(err, 'Failed to load categories.'); });
    return () => { cancelled = true; };
  }, [handleApiError]);

  useEffect(() => {
    let cancelled = false;
    ProductServices.fetchProducts(filterCategoryId, currentPage, activeFilters)
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products);
        setTotalCount(data.total);
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load products.');
        handleApiError(err, 'Failed to load products.');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
    // activeFilters derives from filters + debouncedSearch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategoryId, currentPage, debouncedSearch, filters.sortBy, filters.minPrice, filters.maxPrice, filters.inStock, handleApiError]);

  useEffect(() => {
    let cancelled = false;
    StatsServices.fetchStats()
      .then((data) => { if (!cancelled) setStats(data); })
      .catch(() => { if (!cancelled) setStats(null); });
    return () => { cancelled = true; };
  }, [products.length, totalCount]);

  // T3.2: realtime refetch when configured; no-op without Supabase env keys.
  useEffect(() => subscribeToCatalogChanges(() => {
    void loadProducts();
    void loadCategories();
  }), [loadProducts, loadCategories]);

  useEffect(() => {
    try { localStorage.setItem('pcwa_view_mode', viewMode); } catch { /* ignore */ }
  }, [viewMode]);

  const refreshAll = useCallback(() => {
    void loadProducts();
    void loadCategories();
    void loadStats();
  }, [loadProducts, loadCategories, loadStats]);

  const resetToFirstPage = () => { setCurrentPage(1); setSelectedIds(new Set()); };

  const handleFilterChange = (categoryId: string | 'All Categories') => {
    setFilterCategoryId(categoryId);
    resetToFirstPage();
  };

  const handleFiltersChange = (next: ProductFilters) => {
    setFilters(next);
    resetToFirstPage();
  };

  const toggleSelect = (id: string) => {
    if (!canWrite) { requireLogin(); return; }
    setSelectedIds((current) => {
      const nextSet = new Set(current);
      if (nextSet.has(id)) nextSet.delete(id); else nextSet.add(id);
      return nextSet;
    });
  };

  const handleDelete = (id: string) => {
    if (!canWrite) { requireLogin(); return; }
    const product = products.find((p) => String(p.id) === id);
    if (product) setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await ProductServices.deleteProduct(String(productToDelete.id));
      toast.success(`"${productToDelete.name}" moved to trash.`);
      setProductToDelete(null);
      if (products.length === 1 && currentPage > 1) setCurrentPage((p) => p - 1);
      else void loadProducts();
      void loadStats();
    } catch (err) {
      handleApiError(err, 'Failed to delete product.');
    }
  };

  const handleEditClick = (product: Product) => {
    if (!canWrite) { requireLogin(); return; }
    setViewingProduct(null);
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    if (!canWrite) { requireLogin(); return; }
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (_e: React.FormEvent, values: ProductFormValues) => {
    const productData = {
      name: values.name,
      description: values.description.trim() || null,
      price: parseFloat(values.price),
      category_id: values.category_id,
      image_url: values.image_url.trim() || null,
      sku: values.sku.trim() || null,
      stock: Number(values.stock) || 0,
    };
    try {
      await ProductServices.saveProduct(productData, editingProduct ? String(editingProduct.id) : undefined);
      toast.success(editingProduct ? 'Product updated.' : 'Product created.');
      setIsModalOpen(false);
      void loadProducts();
      void loadStats();
    } catch (err) {
      handleApiError(err, 'Failed to save product.');
    }
  };

  const runBulkDelete = async () => {
    try {
      const result = await ProductServices.bulkDelete([...selectedIds]);
      toast.success(`Deleted ${result.deleted} product(s)${result.failed.length ? `, ${result.failed.length} failed` : ''}.`);
      setConfirmBulkDelete(false);
      setSelectedIds(new Set());
      if (products.length === selectedIds.size && currentPage > 1) setCurrentPage((p) => p - 1);
      else void loadProducts();
      void loadStats();
    } catch (err) {
      handleApiError(err, 'Bulk delete failed.');
    }
  };

  const runBulkCategorize = async (categoryId: string) => {
    try {
      const result = await ProductServices.bulkCategorize([...selectedIds], categoryId);
      toast.success(`Moved ${result.updated} product(s)${result.failed.length ? `, ${result.failed.length} failed` : ''}.`);
      setSelectedIds(new Set());
      void loadProducts();
    } catch (err) {
      handleApiError(err, 'Bulk categorize failed.');
    }
  };

  const downloadCsv = async () => {
    try {
      const response = await fetch(ProductServices.exportUrl(filterCategoryId, debouncedSearch));
      if (!response.ok) throw new Error('Export failed.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'products.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed.');
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const categoryNameFor = (product: Product) =>
    categories.find((c) => String(c.id) === String(product.category_id))?.name || 'Unknown Category';

  const header = (
    <header className="bg-[#00241B] text-white px-4 py-4 sm:px-8 sm:py-5 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-lg border-b border-[#4E878C]">
      <h1 className="text-lg sm:text-xl text-white font-bold tracking-tight text-center sm:text-left">Product Catalog Dashboard</h1>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" onClick={() => void downloadCsv()}>Export CSV</Button>
        <Button variant="secondary" disabled={!canWrite} onClick={() => (canWrite ? setShowImport(true) : requireLogin())}>Import CSV</Button>
        <Button variant="secondary" disabled={!canWrite} onClick={() => (canWrite ? setShowTrash(true) : requireLogin())}>Trash</Button>
        <Button variant="secondary" onClick={() => setShowCategoryManager(true)}>Categories</Button>
        {user ? (
          <>
            <span className="flex items-center text-sm text-white/80 px-1">{user.email}</span>
            <Button variant="secondary" onClick={() => { AuthServices.logout(); setUser(null); toast.success('Logged out.'); }}>Logout</Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => setShowLogin(true)}>Login to edit</Button>
        )}
        <Button onClick={handleAddClick} disabled={categories.length === 0}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}>
          ADD PRODUCT
        </Button>
      </div>
    </header>
  );

  const pagination = totalCount > ITEMS_PER_PAGE ? (
    <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-6 mt-8">
      <p className="text-sm text-slate-500 font-medium">
        Showing <span className="text-[#00241B]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
        <span className="text-[#00241B]">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> of{' '}
        <span className="text-[#00241B]">{totalCount}</span> results
      </p>
      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm bg-white" aria-label="Pagination">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => { setCurrentPage(i + 1); setSelectedIds(new Set()); }}
            aria-current={currentPage === i + 1 ? 'page' : undefined}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-bold border transition-colors first:rounded-l-md last:rounded-r-md ${
              currentPage === i + 1 ? 'z-10 bg-[#00241B] text-white border-[#00241B]' : 'text-slate-400 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </nav>
    </div>
  ) : null;

  return (
    <>
      <ProductCatalogTemplate
        header={header}
        stats={<StatsBar stats={stats} />}
        toolbar={(
          <FilterBar
            currentFilter={filterCategoryId}
            onFilterChange={handleFilterChange}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={categories}
            displayedCount={products.length}
            totalCount={totalCount}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onRefresh={refreshAll}
          />
        )}
        bulkBar={(
          <BulkActionBar
            count={selectedIds.size}
            categories={categories}
            onDelete={() => setConfirmBulkDelete(true)}
            onCategorize={(categoryId) => void runBulkCategorize(categoryId)}
            onClear={() => setSelectedIds(new Set())}
          />
        )}
        pagination={pagination}
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : loadError && products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{loadError}</p>
            <Button onClick={refreshAll}>Retry</Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No products found matching these filters.</div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={categories}
                selected={selectedIds.has(String(product.id))}
                canWrite={canWrite}
                onToggleSelect={toggleSelect}
                onView={setViewingProduct}
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <ProductTable
            products={products}
            categories={categories}
            selectedIds={selectedIds}
            canWrite={canWrite}
            onToggleSelect={toggleSelect}
            onView={setViewingProduct}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        )}
      </ProductCatalogTemplate>

      {isModalOpen && (
        <ProductModal
          key={editingProduct?.id || 'new-product'}
          isOpen={isModalOpen}
          editingProduct={editingProduct}
          initialFormData={editingProduct ? formFromProduct(editingProduct) : emptyProductForm(categories.length > 0 ? String(categories[0].id) : '')}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {viewingProduct && (
        <ProductDetailModal
          product={viewingProduct}
          categoryName={categoryNameFor(viewingProduct)}
          canWrite={canWrite}
          onClose={() => setViewingProduct(null)}
          onEdit={handleEditClick}
        />
      )}

      {showCategoryManager && (
        <CategoryManager categories={categories} onClose={() => setShowCategoryManager(false)} onChanged={() => void loadCategories()} />
      )}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImported={refreshAll} />}
      {showTrash && <TrashModal onClose={() => setShowTrash(false)} onChanged={refreshAll} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLoggedIn={() => setUser(AuthServices.getUser())} />}

      {productToDelete && (
        <Modal isOpen onClose={() => setProductToDelete(null)} title="Delete Product?" maxWidth="max-w-sm">
          <p className="text-gray-600 mb-6">
            Move <span className="font-semibold text-gray-900">"{productToDelete.name}"</span> to trash? You can restore it from Trash.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setProductToDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => void confirmDelete()}>Delete</Button>
          </div>
        </Modal>
      )}

      {confirmBulkDelete && (
        <Modal isOpen onClose={() => setConfirmBulkDelete(false)} title="Delete selected products?" maxWidth="max-w-sm">
          <p className="text-gray-600 mb-6">Move {selectedIds.size} selected product(s) to trash?</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setConfirmBulkDelete(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => void runBulkDelete()}>Delete selected</Button>
          </div>
        </Modal>
      )}

      <ApiConnectionStatus />
    </>
  );
}
