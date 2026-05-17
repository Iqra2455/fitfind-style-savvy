export type Product = {
  id: string;
  title: string;
  brand: string;
  store: "Amazon" | "Daraz";
  price: string;
  image: string;
  rating: number;
  sizes: string[];
  category: string;
  gender: "men" | "women" | "unisex";
  color: string;
  url: string;
};

// Curated mock catalog — replace with real affiliate feeds later.
export const PRODUCTS: Product[] = [
  { id: "p1", title: "Oversized Linen Blazer", brand: "Outfitters", store: "Daraz", price: "PKR 6,490", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80", rating: 4.6, sizes: ["S","M","L","XL"], category: "jackets", gender: "women", color: "blush", url: "https://daraz.pk" },
  { id: "p2", title: "Slim Tapered Jeans", brand: "Levi's", store: "Amazon", price: "$48", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80", rating: 4.7, sizes: ["28","30","32","34","36"], category: "jeans", gender: "men", color: "indigo", url: "https://amazon.com" },
  { id: "p3", title: "Cotton Crewneck Tee", brand: "Uniworth", store: "Daraz", price: "PKR 1,290", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", rating: 4.4, sizes: ["S","M","L","XL","XXL"], category: "shirts", gender: "men", color: "white", url: "https://daraz.pk" },
  { id: "p4", title: "Lavender Midi Dress", brand: "Generation", store: "Daraz", price: "PKR 4,890", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80", rating: 4.8, sizes: ["XS","S","M","L"], category: "dresses", gender: "women", color: "lavender", url: "https://daraz.pk" },
  { id: "p5", title: "Heavyweight Hoodie", brand: "Champion", store: "Amazon", price: "$54", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80", rating: 4.5, sizes: ["S","M","L","XL"], category: "hoodies", gender: "unisex", color: "cream", url: "https://amazon.com" },
  { id: "p6", title: "Leather Biker Jacket", brand: "AllSaints", store: "Amazon", price: "$320", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80", rating: 4.6, sizes: ["S","M","L"], category: "jackets", gender: "women", color: "black", url: "https://amazon.com" },
  { id: "p7", title: "Embroidered Kurta", brand: "Khaadi", store: "Daraz", price: "PKR 3,790", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80", rating: 4.7, sizes: ["S","M","L","XL"], category: "shirts", gender: "women", color: "blush", url: "https://daraz.pk" },
  { id: "p8", title: "Knit Sweater", brand: "Mango", store: "Amazon", price: "$59", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80", rating: 4.3, sizes: ["XS","S","M","L"], category: "hoodies", gender: "women", color: "cream", url: "https://amazon.com" },
  { id: "p9", title: "Chino Trousers", brand: "Cougar", store: "Daraz", price: "PKR 2,890", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80", rating: 4.4, sizes: ["30","32","34","36"], category: "jeans", gender: "men", color: "beige", url: "https://daraz.pk" },
  { id: "p10", title: "Running Sneakers", brand: "Nike", store: "Amazon", price: "$95", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", rating: 4.8, sizes: ["7","8","9","10","11"], category: "shoes", gender: "unisex", color: "white", url: "https://amazon.com" },
  { id: "p11", title: "Floral Maxi Dress", brand: "Sapphire", store: "Daraz", price: "PKR 5,290", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80", rating: 4.6, sizes: ["S","M","L","XL"], category: "dresses", gender: "women", color: "pink", url: "https://daraz.pk" },
  { id: "p12", title: "Wool Overcoat", brand: "Zara", store: "Amazon", price: "$189", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80", rating: 4.5, sizes: ["S","M","L","XL"], category: "jackets", gender: "men", color: "camel", url: "https://amazon.com" },
];
