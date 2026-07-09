/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'server', 'db', 'data');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read JSON file synchronously with type safety
function readDataFile<T>(filename: string, defaultData: T): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Error reading ${filename}, re-initializing:`, err);
    return defaultData;
  }
}

// Helper to write JSON file synchronously
function writeDataFile(filename: string, data: any): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Structures mimicking MySQL tables
export interface Admin {
  id: number;
  username: string;
  passwordHash: string;
  role: 'Super Admin' | 'Manager' | 'Staff';
  name: string;
}

export interface Category {
  id: string; // e.g. 'Masale'
  name: string;
  description: string;
  image: string;
  count: number;
  hidden: boolean;
}

export interface Product {
  id: string;
  category: string;
  name: string;
  weight: string;
  mrp: number;
  ratePerKg: number;
  description: string;
  ingredients: string;
  usage: string;
  shelfLife: string;
  notes: string;
  image: string;
  stock: number;
  isBestseller: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  weight: string;
}

export interface Order {
  id: string; // Order ID
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail: string;
  items: OrderItem[];
  paymentType: 'UPI' | 'COD';
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'Inquiry' | 'Pending' | 'Confirmed' | 'Processing' | 'Dispatched' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  trackingNumber?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  transactionReference: string;
  status: 'Success' | 'Pending' | 'Failed';
  createdAt: string;
}

export interface Review {
  id: number;
  name: string;
  ratingValue: number; // 1-5
  comment: string;
  date: string;
  verified: boolean;
  approved: boolean;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface WebsiteSettings {
  logo: string;
  upiId: string;
  contactNumber: string;
  email: string;
  address: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
  footer: string;
  storeStatus: 'Open' | 'Closed' | 'Maintenance';
}

export interface Banner {
  id: number;
  title: string;
  image: string;
  active: boolean;
}

export interface Coupon {
  id: number;
  code: string;
  discountType: 'Percentage' | 'Fixed';
  value: number;
  minOrderAmount: number;
  active: boolean;
}

// Dynamic seeds directly in-file to make Express completely standalone
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'Masale',
    name: 'Malvani Masalas & Chutneys',
    description: 'Generations of expertise in roasting and blending coastal spices, red chillies, and garlic.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    count: 11,
    hidden: false
  },
  {
    id: 'Pith',
    name: 'Traditional Flours (Pith)',
    description: 'Freshly milled rice, pulse, and grain flours prepared for authentic Bhakri, Vade, and Modak.',
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop&q=80',
    count: 7,
    hidden: false
  },
  {
    id: 'Malvani products',
    name: 'Konkan Specialties & Meva',
    description: 'Sun-dried Kokum, parboiled rice, fruit leathers (Poli), and authentic farm-fresh items.',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80',
    count: 11,
    hidden: false
  },
  {
    id: 'Laddoos',
    name: 'Handmade Laddoos',
    description: 'Sweet, nutritious daily delicacies rolled with pure ghee, organic jaggery, peanuts, and dry fruits.',
    image: 'https://images.unsplash.com/photo-1581781868311-6415779c13dd?w=600&auto=format&fit=crop&q=80',
    count: 4,
    hidden: false
  },
  {
    id: 'Kaju',
    name: 'Premium Malvan Cashews (Kaju)',
    description: 'Export-grade whole cashews, salted variants, masala-flavored crunch, and healthy split kernels.',
    image: '/src/assets/images/cashew_premium_1780594672474.png',
    count: 7,
    hidden: false
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  // Masale Category
  {
    id: 'm1',
    category: 'Masale',
    name: 'Malvani special Sunday masala',
    weight: '250gm',
    mrp: 275,
    ratePerKg: 1100,
    description: 'Traditional Malvani spice blend for rich Sunday-style curries.',
    ingredients: 'Coriander, Red Chilli, Cumin, Turmeric, Black Pepper, Aromatic Spices',
    usage: 'Add during cooking for authentic Malvani flavor.',
    shelfLife: '12 Months',
    notes: 'No artificial colors or preservatives.',
    image: '/src/assets/images/Masale/malvani-spl-sunday-masala.webp',
    stock: 120,
    isBestseller: true
  },
  {
    id: 'm2',
    category: 'Masale',
    name: 'Malvani fish fry masala',
    weight: '300gm',
    mrp: 240,
    ratePerKg: 800,
    description: 'Authentic spice mix for crispy and flavorful fish fry.',
    ingredients: 'Red Chilli, Coriander, Turmeric, Garlic, Salt, Traditional Spices',
    usage: 'Marinate fish with masala and fry.',
    shelfLife: '12 Months',
    notes: 'Best for Pomfret, Surmai, Bangda.',
    image: '/src/assets/images/Masale/Malvani fish fry masala.webP',
    stock: 85,
    isBestseller: true
  },
  {
    id: 'm3',
    category: 'Masale',
    name: 'Biryani Masala',
    weight: '250gm',
    mrp: 300,
    ratePerKg: 1320,
    description: 'Aromatic spice blend for restaurant-style biryani.',
    ingredients: 'Cardamom, Cloves, Cinnamon, Bay Leaf, Nutmeg, Mace',
    usage: 'Add while cooking rice and meat/vegetables.',
    shelfLife: '12 Months',
    notes: 'Suitable for veg and non-veg biryani.',
    image: '/src/assets/images/Masale/Biryani masala.webP',
    stock: 95,
    isBestseller: false
  },
  {
    id: 'm4',
    category: 'Masale',
    name: 'Kashmiri mirchi powder',
    weight: '250gm',
    mrp: 220,
    ratePerKg: 880,
    description: 'Mild spicy chili powder with rich red color.',
    ingredients: 'Premium Kashmiri Red Chillies',
    usage: 'Use in curries, gravies and marinades.',
    shelfLife: '12 Months',
    notes: 'Natural color enhancer.',
    image: '/src/assets/images/Masale/Kashmiri mirchi powder copy.webP',
    stock: 150,
    isBestseller: false
  },
  {
    id: 'm5',
    category: 'Masale',
    name: 'Malvani special bhajka masala',
    weight: '250gm',
    mrp: 225,
    ratePerKg: 900,
    description: 'Roasted spice blend with traditional Malvani taste.',
    ingredients: 'Roasted Coriander, Cumin, Coconut, Chillies, Spices',
    usage: 'Add to curries and vegetables.',
    shelfLife: '12 Months',
    notes: 'Authentic homemade recipe.',
    image: '/src/assets/images/Masale/Malvani special bhajka masala.webP',
    stock: 75,
    isBestseller: false
  },
  {
    id: 'm6',
    category: 'Masale',
    name: 'Malvani special mutton masala',
    weight: '250gm',
    mrp: 325,
    ratePerKg: 1300,
    description: 'Rich spice blend specially crafted for mutton dishes.',
    ingredients: 'Coriander, Red Chilli, Black Pepper, Garam Masala Spices',
    usage: 'Use while cooking mutton curry.',
    shelfLife: '12 Months',
    notes: 'Enhances taste and aroma.',
    image: '/src/assets/images/Masale/malvani special mutton masala.webP',
    stock: 110,
    isBestseller: false
  },
  {
    id: 'm7',
    category: 'Masale',
    name: 'Malvani fish curry masala',
    weight: '250gm',
    mrp: 250,
    ratePerKg: 1000,
    description: 'Traditional Malvani masala for fish curries.',
    ingredients: 'Coconut, Coriander, Chilli, Turmeric, Garlic, Spices',
    usage: 'Add while preparing fish curry.',
    shelfLife: '12 Months',
    notes: 'Coastal-style flavor.',
    image: '/src/assets/images/Masale/malvani fish curry masala.webP',
    stock: 90,
    isBestseller: false
  },
  {
    id: 'm8',
    category: 'Masale',
    name: 'Khobra lasun chutney',
    weight: '200 gm',
    mrp: 120,
    ratePerKg: 0,
    description: 'Spicy dry chutney made from coconut and garlic.',
    ingredients: 'Dry Coconut, Garlic, Red Chilli, Salt',
    usage: 'Serve with bhakri, vada pav or meals.',
    shelfLife: '6 Months',
    notes: 'Ready to eat.',
    image: '/src/assets/images/Masale/Khobra lasun chutney.webP',
    stock: 140,
    isBestseller: false
  },
  {
    id: 'm9',
    category: 'Masale',
    name: 'Kanda lasun masala',
    weight: '250 gm',
    mrp: 140,
    ratePerKg: 560,
    description: 'Traditional onion-garlic spice mix.',
    ingredients: 'Onion, Garlic, Red Chilli, Spices',
    usage: 'Use in curries, vegetables and gravies.',
    shelfLife: '12 Months',
    notes: 'Homemade style taste.',
    image: '/src/assets/images/Masale/Kanda lasun masala.webP',
    stock: 160,
    isBestseller: false
  },
  {
    id: 'm10',
    category: 'Masale',
    name: 'special misal masala',
    weight: '250 gm',
    mrp: 220,
    ratePerKg: 880,
    description: 'Flavorful spice blend for spicy Misal.',
    ingredients: 'Red Chilli, Coriander, Cumin, Garlic, Special Spices',
    usage: 'Add while preparing Misal.',
    shelfLife: '12 Months',
    notes: 'Perfect for Maharashtrian Misal.',
    image: '/src/assets/images/Masale/special misal masala.webP',
    stock: 80,
    isBestseller: false
  },
  {
    id: 'm11',
    category: 'Masale',
    name: 'shengdana chutney',
    weight: '200 gm',
    mrp: 120,
    ratePerKg: 480,
    description: 'Nutritious dry peanut chutney.',
    ingredients: 'Roasted Peanuts, Garlic, Chilli, Salt',
    usage: 'Enjoy with bhakri, dosa or rice.',
    shelfLife: '6 Months',
    notes: 'Rich in protein.',
    image: '/src/assets/images/Masale/shengdana chutney.webP',
    stock: 130,
    isBestseller: false
  },

  // Pith Category
  {
    id: 'p1',
    category: 'Pith',
    name: 'Gavthi kulith pithi',
    weight: '250gm',
    mrp: 85,
    ratePerKg: 340,
    description: 'Traditional horse gram flour.',
    ingredients: 'Premium Horse Gram',
    usage: 'Use for pithla, soups and healthy recipes.',
    shelfLife: '6 Months',
    notes: 'High in protein and fiber.',
    image: '/src/assets/images/Pith/Gavthi kulith pithi.webP',
    stock: 60,
    isBestseller: false
  },
  {
    id: 'p2',
    category: 'Pith',
    name: 'Thalipith bhajni',
    weight: '500gm',
    mrp: 90,
    ratePerKg: 180,
    description: 'Ready flour mix for traditional thalipith.',
    ingredients: 'Mixed Grains, Pulses, Spices',
    usage: 'Knead dough and prepare thalipith.',
    shelfLife: '6 Months',
    notes: 'Traditional Maharashtrian recipe.',
    image: '/src/assets/images/Pith/Thalipith bhajni.webP',
    stock: 70,
    isBestseller: false
  },
  {
    id: 'p3',
    category: 'Pith',
    name: 'Basmati modak pith',
    weight: '500gm',
    mrp: 80,
    ratePerKg: 160,
    description: 'Fine rice flour for making modaks.',
    ingredients: 'Premium Basmati Rice',
    usage: 'Prepare soft modaks and sweets.',
    shelfLife: '6 Months',
    notes: 'Ideal for festive occasions.',
    image: '/src/assets/images/Pith/Basmati modak pith.webP',
    stock: 110,
    isBestseller: false
  },
  {
    id: 'p4',
    category: 'Pith',
    name: 'Ghavne pith',
    weight: '500gm',
    mrp: 80,
    ratePerKg: 160,
    description: 'Ready mix for soft Konkan-style ghavne.',
    ingredients: 'Rice Flour',
    usage: 'Mix with water and prepare ghavne.',
    shelfLife: '6 Months',
    notes: 'Easy to prepare.',
    image: '/src/assets/images/Pith/Ghavane pith.webP',
    stock: 95,
    isBestseller: false
  },
  {
    id: 'p5',
    category: 'Pith',
    name: 'Malvani vade pith',
    weight: '500gm',
    mrp: 80,
    ratePerKg: 160,
    description: 'Traditional flour mix for Malvani vade.',
    ingredients: 'Rice, Wheat, Pulses, Spices',
    usage: 'Prepare crispy Malvani vade.',
    shelfLife: '6 Months',
    notes: 'Authentic coastal recipe.',
    image: '/src/assets/images/Pith/Malvani vade pith.webP',
    stock: 100,
    isBestseller: false
  },
  {
    id: 'p6',
    category: 'Pith',
    name: 'Aamboli pith',
    weight: '500gm',
    mrp: 90,
    ratePerKg: 180,
    description: 'Ready mix for soft and fluffy aamboli.',
    ingredients: 'Rice and Lentil Flour',
    usage: 'Ferment and prepare aamboli.',
    shelfLife: '6 Months',
    notes: 'Traditional breakfast option.',
    image: '/src/assets/images/Pith/Aamboli pith.webP',
    stock: 85,
    isBestseller: false
  },
  {
    id: 'p7',
    category: 'Pith',
    name: 'Shirwale pith',
    weight: '500gm',
    mrp: 80,
    ratePerKg: 160,
    description: 'Special flour mix for Shirwale preparation.',
    ingredients: 'Rice Flour',
    usage: 'Prepare traditional Shirwale noodles.',
    shelfLife: '6 Months',
    notes: 'Easy to cook.',
    image: '/src/assets/images/Pith/Shirwale pith.webP',
    stock: 65,
    isBestseller: false
  },

  // Malvani Products Category
  {
    id: 'mp1',
    category: 'Malvani products',
    name: 'Malvani sola (aamsul)',
    weight: '250gm',
    mrp: 150,
    ratePerKg: 600,
    description: 'Natural kokum rind used for curries and beverages.',
    ingredients: 'Sun-dried Kokum',
    usage: 'Use in curries, solkadhi and drinks.',
    shelfLife: '12 Months',
    notes: 'Natural souring agent.',
    image: '/src/assets/images/Malvani product/Malvani Sola ( Aamsul ).webP',
    stock: 120,
    isBestseller: false
  },
  {
    id: 'mp2',
    category: 'Malvani products',
    name: 'Gavthi Ukde Tandul',
    weight: '500gm',
    mrp: 80,
    ratePerKg: 160,
    description: 'Traditional parboiled rice from Konkan region.',
    ingredients: 'Premium Parboiled Rice',
    usage: 'Cook and serve with curries.',
    shelfLife: '12 Months',
    notes: 'Rich traditional taste.',
    image: '/src/assets/images/Malvani product/Gavathi ukde tandul.webP',
    stock: 140,
    isBestseller: false
  },
  {
    id: 'mp3',
    category: 'Malvani products',
    name: 'Homemade gul khobravadi',
    weight: '1 unit (Approx 300g)',
    mrp: 90,
    ratePerKg: 0,
    description: 'Sweet coconut and jaggery delicacy.',
    ingredients: 'Coconut, Jaggery, Cardamom',
    usage: 'Ready to eat.',
    shelfLife: '3 Months',
    notes: 'Handmade product.',
    image: '/src/assets/images/Malvani product/Homemade gul khobra vadi.webP',
    stock: 50,
    isBestseller: false
  },
  {
    id: 'mp4',
    category: 'Malvani products',
    name: 'Taak mirchi',
    weight: '1 packet',
    mrp: 70,
    ratePerKg: 0,
    description: 'Sun-dried buttermilk chillies.',
    ingredients: 'Green Chillies, Buttermilk, Salt',
    usage: 'Fry before serving.',
    shelfLife: '12 Months',
    notes: 'Traditional side dish.',
    image: '/src/assets/images/Malvani product/Taak mirchi.webP',
    stock: 90,
    isBestseller: false
  },
  {
    id: 'mp5',
    category: 'Malvani products',
    name: 'Sandgi mirchi ',
    weight: '1 packet',
    mrp: 70,
    ratePerKg: 0,
    description: 'Sun-dried stuffed chillies.',
    ingredients: 'Green Chillies, Salt, Spices',
    usage: 'Fry and serve with meals.',
    shelfLife: '12 Months',
    notes: 'Authentic Maharashtrian accompaniment.',
    image: '/src/assets/images/Malvani product/Sandgi mirchi.webP',
    stock: 85,
    isBestseller: false
  },
  {
    id: 'mp6',
    category: 'Malvani products',
    name: 'Awala candy 100 gm',
    weight: '100gm',
    mrp: 40,
    ratePerKg: 0,
    description: 'Sweet and tangy amla candy.',
    ingredients: 'Amla, Sugar, Natural Flavors',
    usage: 'Ready to eat.',
    shelfLife: '6 Months',
    notes: 'Rich in Vitamin C.',
    image: '/src/assets/images/Malvani product/Awala Candy.webP',
    stock: 110,
    isBestseller: false
  },
  {
    id: 'mp7',
    category: 'Malvani products',
    name: 'Fanas wafers',
    weight: '1 packet (Approx 150gm)',
    mrp: 90,
    ratePerKg: 0,
    description: 'Crispy jackfruit chips.',
    ingredients: 'Jackfruit, Edible Oil, Salt',
    usage: 'Ready to eat snack.',
    shelfLife: '4 Months',
    notes: 'Traditional Konkan snack.',
    image: '/src/assets/images/Malvani product/Fanas wafers.webP',
    stock: 130,
    isBestseller: false
  },
  {
    id: 'mp8',
    category: 'Malvani products',
    name: 'Gavthi poha',
    weight: '1 packet',
    mrp: 70,
    ratePerKg: 0,
    description: 'Thick traditional flattened rice.',
    ingredients: 'Premium Rice',
    usage: 'Prepare poha or snacks.',
    shelfLife: '6 Months',
    notes: 'Easy breakfast option.',
    image: '/src/assets/images/Malvani product/Gavathi pohe.webP',
    stock: 95,
    isBestseller: false
  },
  {
    id: 'mp9',
    category: 'Malvani products',
    name: 'Amba poli',
    weight: '1 packet (Approx 200gm)',
    mrp: 90,
    ratePerKg: 0,
    description: 'Sweet mango fruit leather.',
    ingredients: 'Mango Pulp, Sugar',
    usage: 'Ready to eat.',
    shelfLife: '6 Months',
    notes: 'Natural fruity taste.',
    image: '/src/assets/images/Malvani product/Aamba poli.webP',
    stock: 105,
    isBestseller: false
  },
  {
    id: 'mp10',
    category: 'Malvani products',
    name: 'Fanas poli',
    weight: '1 packet (Approx 200gm)',
    mrp: 90,
    ratePerKg: 0,
    description: 'Traditional jackfruit fruit leather.',
    ingredients: 'Jackfruit Pulp, Sugar',
    usage: 'Ready to eat.',
    shelfLife: '6 Months',
    notes: 'Konkan specialty.',
    image: '/src/assets/images/Malvani product/Fanas poli.webP',
    stock: 80,
    isBestseller: false
  },
  {
    id: 'mp11',
    category: 'Malvani products',
    name: 'Malvani khaja',
    weight: '1 packet (Approx 200gm)',
    mrp: 40,
    ratePerKg: 0,
    description: 'Crispy layered sweet delicacy.',
    ingredients: 'Flour, Sugar, Ghee',
    usage: 'Ready to eat.',
    shelfLife: '2 Months',
    notes: 'Traditional festive sweet.',
    image: '/src/assets/images/Malvani product/Malvani Khaja.webP',
    stock: 75,
    isBestseller: false
  },

  // Laddoos Category
  {
    id: 'l1',
    category: 'Laddoos',
    name: 'Khadkhade laddoos',
    weight: '25 unit',
    mrp: 80,
    ratePerKg: 0,
    description: 'Crunchy traditional laddoos.',
    ingredients: 'Jaggery, Rice, Ghee',
    usage: 'Ready to eat.',
    shelfLife: '2 Months',
    notes: 'Handmade product.',
    image: '/src/assets/images/Laddoos/Khadkhade laddoo.webP',
    stock: 45,
    isBestseller: false
  },
  {
    id: 'l2',
    category: 'Laddoos',
    name: 'Kadak bundi laddoo',
    weight: '25 unit',
    mrp: 80,
    ratePerKg: 0,
    description: 'Traditional crunchy boondi laddoos.',
    ingredients: 'Gram Flour, Sugar, Ghee',
    usage: 'Ready to eat.',
    shelfLife: '2 Months',
    notes: 'Festive favorite.',
    image: '/src/assets/images/Laddoos/Kadak bundi laddoo.webP',
    stock: 50,
    isBestseller: false
  },
  {
    id: 'l3',
    category: 'Laddoos',
    name: 'Shev laddoo',
    weight: '25 unit',
    mrp: 80,
    ratePerKg: 0,
    description: 'Sweet laddoos made with shev.',
    ingredients: 'Shev, Jaggery, Ghee',
    usage: 'Ready to eat.',
    shelfLife: '2 Months',
    notes: 'Traditional Maharashtrian sweet.',
    image: '/src/assets/images/Laddoos/Shev laddoo.webP',
    stock: 40,
    isBestseller: false
  },
  {
    id: 'l4',
    category: 'Laddoos',
    name: 'Shengdana laddoo',
    weight: '20 unit',
    mrp: 90,
    ratePerKg: 0,
    description: 'Nutritious peanut and jaggery laddoo.',
    ingredients: 'Peanuts, Jaggery',
    usage: 'Ready to eat.',
    shelfLife: '3 Months',
    notes: 'High-energy snack.',
    image: '/src/assets/images/Laddoos/Shengdana laddoo.webP',
    stock: 65,
    isBestseller: false
  },

  // Kaju Category
  {
    id: 'k1',
    category: 'Kaju',
    name: 'Polish kaju(big size)',
    weight: '250gm',
    mrp: 380,
    ratePerKg: 0,
    description: 'Premium large-sized cashew nuts.',
    ingredients: 'Cashew Nuts',
    usage: 'Ready to eat or use in recipes.',
    shelfLife: '9 Months',
    notes: 'Export-quality cashews.',
    image: '/src/assets/images/Kaju/polish kaju (big size).webP',
    stock: 90,
    isBestseller: true
  },
  {
    id: 'k2',
    category: 'Kaju',
    name: 'Salwale kaju(big size)',
    weight: '250gm',
    mrp: 250,
    ratePerKg: 950,
    description: 'Salted large-sized cashews.',
    ingredients: 'Cashew Nuts, Salt',
    usage: 'Ready to eat.',
    shelfLife: '9 Months',
    notes: 'Premium snack.',
    image: '/src/assets/images/Kaju/Salwale kaju (big size).webP',
    stock: 80,
    isBestseller: false
  },
  {
    id: 'k3',
    category: 'Kaju',
    name: 'Salwale kaju (medium)',
    weight: '250gm',
    mrp: 250,
    ratePerKg: 880,
    description: 'Salted medium-sized cashews.',
    ingredients: 'Cashew Nuts, Salt',
    usage: 'Ready to eat.',
    shelfLife: '9 Months',
    notes: 'Perfect tea-time snack.',
    image: '/src/assets/images/Kaju/Salwale kaju (medium size).webP',
    stock: 110,
    isBestseller: false
  },
  {
    id: 'k4',
    category: 'Kaju',
    name: 'Salted kaju',
    weight: '200gm',
    mrp: 230,
    ratePerKg: 1150,
    description: 'Crunchy salted cashew nuts.',
    ingredients: 'Cashew Nuts, Salt',
    usage: 'Ready to eat.',
    shelfLife: '9 Months',
    notes: 'Premium quality.',
    image: '/src/assets/images/Kaju/Salted kaju.webP',
    stock: 120,
    isBestseller: false
  },
  {
    id: 'k5',
    category: 'Kaju',
    name: 'Masala kaju',
    weight: '200gm',
    mrp: 230,
    ratePerKg: 1150,
    description: 'Spicy flavored cashew nuts.',
    ingredients: 'Cashew Nuts, Spices, Salt',
    usage: 'Ready to eat.',
    shelfLife: '9 Months',
    notes: 'Rich spicy flavor.',
    image: '/src/assets/images/Kaju/Masala kaju.webP',
    stock: 95,
    isBestseller: false
  },
  {
    id: 'k6',
    category: 'Kaju',
    name: 'Tukda kaju',
    weight: '200gm',
    mrp: 175,
    ratePerKg: 875,
    description: 'Cashew pieces for cooking and baking.',
    ingredients: 'Cashew Pieces',
    usage: 'Use in sweets, curries and desserts.',
    shelfLife: '9 Months',
    notes: 'Economical option.',
    image: '/src/assets/images/Kaju/Tukda kaju.webP',
    stock: 150,
    isBestseller: false
  },
  {
    id: 'k7',
    category: 'Kaju',
    name: 'Polish kaju(medium size)',
    weight: '250gm',
    mrp: 260,
    ratePerKg: 1040,
    description: 'Premium medium-sized cashew nuts.',
    ingredients: 'Cashew Nuts',
    usage: 'Ready to eat or cook.',
    shelfLife: '9 Months',
    notes: 'High-quality kernels.',
    image: '/src/assets/images/Kaju/polish kaju (medium size).webP',
    stock: 100,
    isBestseller: false
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 1,
    name: "Prasad Gawde",
    ratingValue: 5,
    comment: "Pure organic Sankeshwari and Ghati chilli mix. True taste of Malvan kitchen. The Sunday masala is out of this world!",
    date: "2026-06-15",
    verified: true,
    approved: true
  },
  {
    id: 2,
    name: "Aparna Parab",
    ratingValue: 5,
    comment: "The Peanuts Chutney and Khobra Lasun Chutney are delicious with bhakri. Strongly suggest this to everyone who loves home-style Konkan cooking.",
    date: "2026-06-14",
    verified: true,
    approved: true
  }
];

const DEFAULT_SETTINGS: WebsiteSettings = {
  logo: "https://ik.imagekit.io/9f6w6a0wf/logo.png.png",
  upiId: "bhaveshkoyande62@okaxis",
  contactNumber: "+91 91762 04289",
  email: "geetasmasale@gmail.com",
  address: "Near Dewoolwada along Kasal-Malvan Highway, Malvan, Maharashtra, India",
  socialLinks: {
    instagram: "https://instagram.com/geetasmasale",
    facebook: "https://facebook.com/geetasmasale",
    whatsapp: "https://wa.me/917620428920"
  },
  footer: "© 2026 Sri Geeta's Spices. Handcrafted along the beautiful shores of Malvan. Built with absolute love.",
  storeStatus: "Open"
};

const DEFAULT_COUPONS: Coupon[] = [
  { id: 1, code: "GEETA50", discountType: "Fixed", value: 50, minOrderAmount: 399, active: true },
  { id: 2, code: "KONKAN10", discountType: "Percentage", value: 10, minOrderAmount: 500, active: true }
];

const DEFAULT_BANNERS: Banner[] = [
  { id: 1, title: "Pure Sunday Griddle Roast", image: "/src/assets/images/masala_hero_1780594616996.png", active: true }
];

// Initialize database storage collections
export const getAdmins = () => {
  const admins = readDataFile<Admin[]>('admins.json', []);
  if (admins.length === 0) {
    const salt = bcrypt.genSaltSync(10);
    // Secure default password geeta2004
    const passwordHash = bcrypt.hashSync('geeta2004', salt);
    const superAdmin: Admin = {
      id: 1,
      username: 'admin',
      passwordHash,
      role: 'Super Admin',
      name: 'Bhavesh Admin'
    };
    admins.push(superAdmin);
    writeDataFile('admins.json', admins);
  }
  return admins;
};

export const getCategories = () => readDataFile<Category[]>('categories.json', DEFAULT_CATEGORIES);
export const saveCategories = (categories: Category[]) => writeDataFile('categories.json', categories);

export const getProducts = () => readDataFile<Product[]>('products.json', DEFAULT_PRODUCTS);
export const saveProducts = (products: Product[]) => writeDataFile('products.json', products);

export const getOrders = () => readDataFile<Order[]>('orders.json', []);
export const saveOrders = (orders: Order[]) => writeDataFile('orders.json', orders);

export const getPayments = () => readDataFile<Payment[]>('payments.json', []);
export const savePayments = (payments: Payment[]) => writeDataFile('payments.json', payments);

export const getReviews = () => readDataFile<Review[]>('reviews.json', DEFAULT_REVIEWS);
export const saveReviews = (reviews: Review[]) => writeDataFile('reviews.json', reviews);

export const getContactMessages = () => readDataFile<ContactMessage[]>('contact_messages.json', []);
export const saveContactMessages = (messages: ContactMessage[]) => writeDataFile('contact_messages.json', messages);

export const getWebsiteSettings = () => readDataFile<WebsiteSettings>('website_settings.json', DEFAULT_SETTINGS);
export const saveWebsiteSettings = (settings: WebsiteSettings) => writeDataFile('website_settings.json', settings);

export const getBanners = () => readDataFile<Banner[]>('banners.json', DEFAULT_BANNERS);
export const saveBanners = (banners: Banner[]) => writeDataFile('banners.json', banners);

export const getCoupons = () => readDataFile<Coupon[]>('coupons.json', DEFAULT_COUPONS);
export const saveCoupons = (coupons: Coupon[]) => writeDataFile('coupons.json', coupons);
