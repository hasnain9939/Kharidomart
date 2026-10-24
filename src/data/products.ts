export interface ProductColor {
  name: string;
  hex: string;
  label: string;
}

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
  colors?: ProductColor[];
  dispatchTime?: string;
  dispatchCutoff?: string;
  description: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  createdAt?: string;
  updatedAt?: string;
}

