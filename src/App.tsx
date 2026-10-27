import ProductCatalogPage from './pages/ProductCatalogPage';

/**
 * Entry only. The catalog lives in pages/ProductCatalogPage (atomic design:
 * atoms -> molecules -> organisms -> templates -> pages).
 */
export default function App() {
  return <ProductCatalogPage />;
}
