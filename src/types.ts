/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  category: string;
  name: string;
  weight: string;
  mrp: number;
  ratePerKg?: number;
  description: string;
  ingredients: string;
  usage: string;
  shelfLife: string;
  notes?: string;
  image: string;
}

export interface Recipe {
  id: string;
  title: string;
  prepTime: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Expert';
  servings: number;
  ingredients: string[];
  steps: string[];
  description: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  review: string;
  product: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
}
