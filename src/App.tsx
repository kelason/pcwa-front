import { useState, useEffect } from 'react';
import { Button } from './components/atoms/Button';
import { FilterBar } from './components/molecules/FilterBar';
import { ProductCard } from './components/organisms/ProductCard';
import { ProductModal } from './components/organisms/ProductModal';
import { ProductServices } from './components/services/ProductServices';
import { ApiConnectionStatus } from './components/ApiConnectionStatus';
import { CategoryServices } from './components/services/CategoryServices';
import { Modal } from './components/atoms/Modal';
import { type Product, type Category } from '../api';

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<string | 'All Categories'>('All Categories');
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', price: '', category_id: '' });

  // Fetch categories once on mount
  useEffect(() => {
    CategoryServices.fetchAllCategories()
      .then(setCategories)
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Fetch products whenever the filter changes (Server-side filtering)
  useEffect(() => {
    const loadProducts = async (): Promise<void> => {
      try {
        const data = await ProductServices.fetchProducts(filterCategoryId);
        if (filterCategoryId === 'All Categories') setTotalCount(data.length);
        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
      }
    };
    loadProducts();
  }, [filterCategoryId]);

  // --- Handlers ---
  const handleDelete = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await ProductServices.deleteProduct(String(productToDelete.id));
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setTotalCount(prev => prev - 1);
      setProductToDelete(null);
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

      if (editingProduct) {
        setProducts(products.map(p => (p.id === editingProduct.id ? savedProduct : p)));
      } else {
        if (filterCategoryId === 'All Categories' || savedProduct.category_id === filterCategoryId) {
          setProducts([...products, savedProduct]);
        }
        setTotalCount(prev => prev + 1);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const displayedProducts = products;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h4 className="text-white">Product Catalog Dashboard</h4>
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
          onFilterChange={setFilterCategoryId}
          categories={categories}
          displayedCount={displayedProducts.length}
          totalCount={totalCount}
        />

        {/* Product Grid */}
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
        
        {displayedProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No products found in this category.
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