export interface Product {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  category: string;
  categorySlug: string;
  badge?: string;
  stock: number;
  featured: boolean;
  images: string[];
  videoUrl?: string;
  description: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  createdAt?: string;
  updatedAt?: string;
}

// Initial empty catalog for the client to add their own real products via Admin (/admin/products/new)
export const PRODUCTS: Product[] = [];
