import { useState, useEffect, useRef } from 'react';
import { Button } from './components/atoms/Button';
import { FilterBar } from './components/molecules/FilterBar';
import { ProductCard } from './components/organisms/ProductCard';
import { ProductModal } from './components/organisms/ProductModal';
import { ProductServices } from './components/services/ProductServices';
import { ApiConnectionStatus } from './components/ApiConnectionStatus';
import { CategoryServices } from './components/services/CategoryServices';
import { Modal } from './components/atoms/Modal';
import { type Product, type Category } from '../api';
import { ProductCardSkeleton } from './components/molecules/ProductCardSkeleton';

export default function ProductCatalog() {
  const itemsPerPage = 10;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<string | 'All Categories'>('All Categories');
  const [totalCount, setTotalCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', price: '', category_id: '' });

  // Cache references to track server data and avoid redundant updates
  const categoriesCacheRef = useRef<string>('');
  const productsCacheRef = useRef<Record<string, string>>({});

  // Fetch categories periodically (every 3 seconds)
  useEffect(() => {
    const fetchCats = () => {
      CategoryServices.fetchAllCategories()
        .then(data => {
          const stringified = JSON.stringify(data);
          if (stringified !== categoriesCacheRef.current) {
            categoriesCacheRef.current = stringified;
            setCategories(data);
          }
        })
        .catch(err => console.error('Error fetching categories:', err));
    };

    fetchCats();
    const interval = setInterval(fetchCats, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products whenever the filter/page changes and periodically (every 3 seconds)
  useEffect(() => {
    const loadProducts = async (showSkeleton: boolean = false): Promise<void> => {
      try {
        if (showSkeleton) setIsLoading(true);
        const data = await ProductServices.fetchProducts(filterCategoryId, currentPage);
        const productsArray = data.products || [];
        const stringified = JSON.stringify(productsArray);
        const cacheKey = `${filterCategoryId}-${currentPage}`;
        const currentCache = productsCacheRef.current[cacheKey] || '';
        const newTotal = data.total || 0;

        // Update if products changed OR if the total count changed
        if (showSkeleton || stringified !== currentCache || totalCount !== newTotal) {
          productsCacheRef.current[cacheKey] = stringified;
          setTotalCount(newTotal);
          
          setProducts(productsArray);
        }
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts(true);

    const interval = setInterval(() => loadProducts(false), 3000);
    return () => clearInterval(interval);
  }, [filterCategoryId, currentPage, totalCount]);

  // --- Handlers ---
  const handleFilterChange = (categoryId: string | 'All Categories') => {
    setFilterCategoryId(categoryId);
    // Reset to page 1 immediately when filter changes to avoid cascading effects
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await ProductServices.deleteProduct(String(productToDelete.id));
      const updatedProducts = products.filter(p => p.id !== productToDelete.id);
      const cacheKey = `${filterCategoryId}-${currentPage}`;
      productsCacheRef.current[cacheKey] = JSON.stringify(updatedProducts);
      setProducts(updatedProducts);
      setTotalCount(prev => prev - 1);
      setProductToDelete(null);

      // If we deleted the last item on the page, go back one page if possible
      if (updatedProducts.length === 0 && currentPage > 1) setCurrentPage(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({ 
      name: product.name, 
      price: product.price.toString(), 
      category_id: String(product.category_id) 
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', category_id: categories.length > 0 ? String(categories[0].id) : '' });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent, submittedValues: { name: string; price: string; category_id: string }) => {
    e.preventDefault();

    if (!submittedValues.category_id) {
      console.error('Validation Error: category_id is required and must be a valid UUID.');
      return;
    }
    const productData: Partial<Product> = {
      name: submittedValues.name,
      price: parseFloat(submittedValues.price),
      category_id: submittedValues.category_id,
    };

    try {
      const savedProduct = await ProductServices.saveProduct(productData, editingProduct?.id ? String(editingProduct.id) : undefined);

      const cacheKey = `${filterCategoryId}-${currentPage}`;
      if (editingProduct) {
        const updatedProducts = products.map(p => (p.id === editingProduct.id ? savedProduct : p));
        productsCacheRef.current[cacheKey] = JSON.stringify(updatedProducts);
        setProducts(updatedProducts);
      } else {
        if (filterCategoryId === 'All Categories' || savedProduct.category_id === filterCategoryId) {
          const updatedProducts = products.length < itemsPerPage ? [...products, savedProduct] : products;
          productsCacheRef.current[cacheKey] = JSON.stringify(updatedProducts);
          setProducts(updatedProducts);
        }
        setTotalCount(prev => prev + 1);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const displayedProducts = products || [];

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#00241B]">
      {/* Header */}
      <header className="bg-[#00241B] text-white px-8 py-5 flex justify-between items-center shadow-lg border-b border-[#4E878C]">
        <h1 className="text-xl text-white font-bold tracking-tight">Product Catalog Dashboard</h1>
        <Button 
          onClick={handleAddClick}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>}
          disabled={categories.length === 0} // Disable if no categories to assign to
        >
          ADD PRODUCT
        </Button>
      </header>

      {/* Main Content */}
      <main className="w-full p-6 mt-4">
        
        {/* Filter Bar */}
        <FilterBar 
          currentFilter={filterCategoryId}
          onFilterChange={handleFilterChange}
          categories={categories}
          displayedCount={products.length}
          totalCount={totalCount}
        />

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                categories={categories}
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
        
        {displayedProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No products found in this category.
          </div>
        )}

        {/* Pagination UI */}
        {totalCount > itemsPerPage && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-6 mt-8">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(totalCount / itemsPerPage)}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Showing <span className="text-[#00241B]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="text-[#00241B]">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
                  <span className="text-[#00241B]">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm bg-white" aria-label="Pagination">
                  {[...Array(Math.ceil(totalCount / itemsPerPage))].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      aria-current={currentPage === i + 1 ? 'page' : undefined}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-bold border transition-all first:rounded-l-md last:rounded-r-md focus:z-20 ${
                        currentPage === i + 1
                          ? 'z-10 bg-[#00241B] text-white border-[#00241B]'
                          : 'text-slate-400 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <ProductModal 
          key={editingProduct?.id || 'new-product'}
          isOpen={isModalOpen}
          editingProduct={editingProduct}
          initialFormData={formData}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {productToDelete && (
        <Modal
          isOpen={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          title="Delete Product?"
          maxWidth="max-w-sm"
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{productToDelete.name}"</span>? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setProductToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </Modal>
      )}

      {/* Connection Diagnostic Tool */}
      <ApiConnectionStatus />
    </div>
  );
}