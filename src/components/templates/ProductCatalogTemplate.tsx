import React from 'react';

/**
 * Template layer (atomic design): page layout only — header band, content
 * column, pagination slot. It owns no data and no business logic; the page
 * composes organisms into these slots.
 */
interface ProductCatalogTemplateProps {
  header: React.ReactNode;
  stats: React.ReactNode;
  toolbar: React.ReactNode;
  bulkBar: React.ReactNode;
  children: React.ReactNode;
  pagination: React.ReactNode;
}

export const ProductCatalogTemplate: React.FC<ProductCatalogTemplateProps> = ({
  header, stats, toolbar, bulkBar, children, pagination,
}) => (
  <div className="min-h-screen bg-white font-sans text-[#00241B]">
    {header}
    <main className="w-full p-6 mt-4">
      {stats}
      {toolbar}
      {bulkBar}
      {children}
      {pagination}
    </main>
  </div>
);
