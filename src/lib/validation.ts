export function validateProductName(name: string): string | null {
  if (name.trim().length === 0) return 'Product name cannot be empty.';
  if (name.length < 1 || name.length > 25) return 'Product name must be between 1 and 25 characters.';
  return null;
}

export function validateProductPrice(price: string): string | null {
  if (price.trim().length === 0) return 'Price cannot be empty.';
  if (price.length < 1 || price.length > 8) return 'Price must be between 1 and 8 characters.';
  const numValue = parseFloat(price);
  if (isNaN(numValue) || numValue <= 0) return 'Price must be a valid positive number or must be greater than 0.';
  return null;
}
