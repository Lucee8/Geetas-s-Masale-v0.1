/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Recipe, Testimonial, GalleryItem } from '../types';

// Eagerly glob-import all local images in src/assets/images.
// This is natively supported by Vite and bundles them with hash URLs in production.
const imageModules = import.meta.glob('../assets/images/**/*.{webp,webP,png,jpg,jpeg}', { eager: true, import: 'default' }) as Record<string, string>;

/**
 * Robust, dynamic helper function to automatically resolve product image URLs
 * based on category and product name, supporting various file formats and naming patterns.
 */
export const getProductImage = (category: string, productName: string, fallbackUrl?: string): string => {
  const normCategory = category.trim().toLowerCase().startsWith('malvani') ? 'Malvani product' : category.trim();
  const targetClean = productName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  // Search through all globbed files in the assets directory
  for (const [filePath, url] of Object.entries(imageModules)) {
    const parts = filePath.split('/');
    if (parts.length < 2) continue;
    
    const fileCategory = parts[parts.length - 2]; // Folder name (e.g., "Masale", "Kaju")
    const fileNameWithExt = parts[parts.length - 1]; // File name (e.g., "Malvani fish fry masala.webP")
    const fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.'));
    const fileClean = fileName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check if the folder category matches, and match on exact clean name or partial keyword overlap
    if (fileCategory.toLowerCase() === normCategory.toLowerCase()) {
      if (
        fileClean === targetClean ||
        fileClean.includes(targetClean) ||
        targetClean.includes(fileClean) ||
        // Multi-word substring matches
        (targetClean.includes('sunday') && fileClean.includes('sunday')) ||
        (targetClean.includes('fry') && fileClean.includes('fry')) ||
        (targetClean.includes('bhajka') && fileClean.includes('bhajka')) ||
        (targetClean.includes('mutton') && fileClean.includes('mutton')) ||
        (targetClean.includes('curry') && fileClean.includes('curry')) ||
        (targetClean.includes('kanda') && fileClean.includes('kanda')) ||
        (targetClean.includes('misal') && fileClean.includes('misal')) ||
        (targetClean.includes('shengdana') && fileClean.includes('shengdana')) ||
        (targetClean.includes('lasun') && fileClean.includes('lasun')) ||
        (targetClean.includes('kulith') && fileClean.includes('kulith')) ||
        (targetClean.includes('modak') && fileClean.includes('modak')) ||
        (targetClean.includes('vade') && fileClean.includes('vade')) ||
        (targetClean.includes('ghavane') && fileClean.includes('ghavane')) ||
        (targetClean.includes('aamboli') && fileClean.includes('aamboli')) ||
        (targetClean.includes('shirwale') && fileClean.includes('shirwale')) ||
        (targetClean.includes('sola') && fileClean.includes('sola')) ||
        (targetClean.includes('ukde') && fileClean.includes('ukde')) ||
        (targetClean.includes('gul') && fileClean.includes('gul')) ||
        (targetClean.includes('taak') && fileClean.includes('taak')) ||
        (targetClean.includes('sandgi') && fileClean.includes('sandgi')) ||
        (targetClean.includes('awala') && fileClean.includes('awala')) ||
        (targetClean.includes('fanas') && fileClean.includes('fanas')) ||
        (targetClean.includes('poha') && fileClean.includes('poha')) ||
        (targetClean.includes('amba') && fileClean.includes('amba')) ||
        (targetClean.includes('khaja') && fileClean.includes('khaja')) ||
        (targetClean.includes('khadkhade') && fileClean.includes('khadkhade')) ||
        (targetClean.includes('bundi') && fileClean.includes('bundi')) ||
        (targetClean.includes('shev') && fileClean.includes('shev')) ||
        (targetClean.includes('polish') && fileClean.includes('polish') && targetClean.includes('big') && fileClean.includes('big')) ||
        (targetClean.includes('polish') && fileClean.includes('polish') && targetClean.includes('medium') && fileClean.includes('medium')) ||
        (targetClean.includes('salwale') && fileClean.includes('salwale') && targetClean.includes('big') && fileClean.includes('big')) ||
        (targetClean.includes('salwale') && fileClean.includes('salwale') && targetClean.includes('medium') && fileClean.includes('medium')) ||
        (targetClean.includes('salted') && fileClean.includes('salted')) ||
        (targetClean.includes('masala') && fileClean.includes('masala') && fileCategory.toLowerCase() === 'kaju') ||
        (targetClean.includes('tukda') && fileClean.includes('tukda'))
      ) {
        return url;
      }
    }
  }

  // Fallbacks if not found locally
  if (fallbackUrl) return fallbackUrl;

  const lowCat = normCategory.toLowerCase();
  if (lowCat === 'masale') {
    return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';
  } else if (lowCat === 'pith') {
    return 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop&q=80';
  } else if (lowCat.startsWith('malvani')) {
    return 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80';
  } else if (lowCat === 'laddoos') {
    return 'https://images.unsplash.com/photo-1581781868311-6415779c13dd?w=600&auto=format&fit=crop&q=80';
  } else if (lowCat === 'kaju') {
    return 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop&q=80';
  }

  return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';
};

export const CATEGORIES = [
  {
    id: 'Masale',
    name: 'Malvani Masalas & Chutneys',
    description: 'Generations of expertise in roasting and blending coastal spices, red chillies, and garlic.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    count: 11
  },
  {
    id: 'Pith',
    name: 'Traditional Flours (Pith)',
    description: 'Freshly milled rice, pulse, and grain flours prepared for authentic Bhakri, Vade, and Modak.',
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop&q=80',
    count: 7
  },
  {
    id: 'Malvani products',
    name: 'Konkan Specialties & Meva',
    description: 'Sun-dried Kokum, parboiled rice, fruit leathers (Poli), and authentic farm-fresh items.',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80',
    count: 11
  },
  {
    id: 'Laddoos',
    name: 'Handmade Laddoos',
    description: 'Sweet, nutritious daily delicacies rolled with pure ghee, organic jaggery, peanuts, and dry fruits.',
    image: 'https://images.unsplash.com/photo-1581781868311-6415779c13dd?w=600&auto=format&fit=crop&q=80',
    count: 4
  },
  {
    id: 'Kaju',
    name: 'Premium Malvan Cashews (Kaju)',
    description: 'Export-grade whole cashews, salted variants, masala-flavored crunch, and healthy split kernels.',
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop&q=80',
    count: 7
  }
];

export const PRODUCTS: Product[] = [
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
    image: getProductImage('Masale', 'Malvani special Sunday masala'),
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
    image: getProductImage('Masale', 'Malvani fish fry masala'),
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
    image: getProductImage('Masale', 'Biryani Masala'),
    stock: 95
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
    image: getProductImage('Masale', 'Kashmiri mirchi powder'),
    stock: 150
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
    image: getProductImage('Masale', 'Malvani special bhajka masala'),
    stock: 75
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
    image: getProductImage('Masale', 'Malvani special mutton masala'),
    stock: 110
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
    image: getProductImage('Masale', 'Malvani fish curry masala'),
    stock: 90
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
    image: getProductImage('Masale', 'Khobra lasun chutney'),
    stock: 140
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
    image: getProductImage('Masale', 'Kanda lasun masala'),
    stock: 160
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
    image: getProductImage('Masale', 'special misal masala'),
    stock: 80
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
    image: getProductImage('Masale', 'shengdana chutney'),
    stock: 130
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
    image: getProductImage('Pith', 'Gavthi kulith pithi'),
    stock: 60
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
    image: getProductImage('Pith', 'Thalipith bhajni'),
    stock: 70
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
    image: getProductImage('Pith', 'Basmati modak pith'),
    stock: 110
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
    image: getProductImage('Pith', 'Ghavne pith'),
    stock: 95
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
    image: getProductImage('Pith', 'Malvani vade pith'),
    stock: 100
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
    image: getProductImage('Pith', 'Aamboli pith'),
    stock: 85
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
    image: getProductImage('Pith', 'Shirwale pith'),
    stock: 65
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
    image: getProductImage('Malvani products', 'Malvani sola (aamsul)'),
    stock: 120
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
    image: getProductImage('Malvani products', 'Gavthi Ukde Tandul'),
    stock: 140
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
    image: getProductImage('Malvani products', 'Homemade gul khobravadi'),
    stock: 50
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
    image: getProductImage('Malvani products', 'Taak mirchi'),
    stock: 90
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
    image: getProductImage('Malvani products', 'Sandgi mirchi '),
    stock: 85
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
    image: getProductImage('Malvani products', 'Awala candy 100 gm'),
    stock: 110
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
    image: getProductImage('Malvani products', 'Fanas wafers'),
    stock: 130
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
    image: getProductImage('Malvani products', 'Gavthi poha'),
    stock: 95
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
    image: getProductImage('Malvani products', 'Amba poli'),
    stock: 105
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
    image: getProductImage('Malvani products', 'Fanas poli'),
    stock: 80
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
    image: getProductImage('Malvani products', 'Malvani khaja'),
    stock: 75
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
    image: getProductImage('Laddoos', 'Khadkhade laddoos'),
    stock: 45
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
    image: getProductImage('Laddoos', 'Kadak bundi laddoo'),
    stock: 50
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
    image: getProductImage('Laddoos', 'Shev laddoo'),
    stock: 40
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
    image: getProductImage('Laddoos', 'Shengdana laddoo'),
    stock: 65
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
    image: getProductImage('Kaju', 'Polish kaju(big size)'),
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
    image: getProductImage('Kaju', 'Salwale kaju(big size)'),
    stock: 80
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
    image: getProductImage('Kaju', 'Salwale kaju (medium)'),
    stock: 110
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
    image: getProductImage('Kaju', 'Salted kaju'),
    stock: 120
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
    image: getProductImage('Kaju', 'Masala kaju'),
    stock: 95
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
    image: getProductImage('Kaju', 'Tukda kaju'),
    stock: 150
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
    image: getProductImage('Kaju', 'Polish kaju(medium size)'),
    stock: 100
  }
];

export const RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: 'Authentic Crispy Malvani Fish Fry',
    prepTime: '20 mins',
    cookTime: '15 mins',
    difficulty: 'Easy',
    servings: 4,
    description: 'The definitive Konkan-beach standard. Fresh surmai coated with fiery Malvani Fish Fry Masala and pan-fried crisp outside while remaining intensely juicy inside.',
    ingredients: [
      '4 slices of Surmai (King Fish) or Pomfret',
      '2.5 tbsp Geetas Malvani Fish Fry Masala',
      '2 tbsp Kokum water (Aamsul juice)',
      '1 tbsp Ginger-garlic paste',
      '3 tbsp Fine Semolina (Rava) for dusting',
      '1 tbsp Rice flour',
      'Pure coconut oil for shallow frying',
      'Fresh lemon and onion slices for garnish'
    ],
    steps: [
      'Wash fish slices thoroughly and pat dry with paper towels.',
      'In a small bowl, mix Geetas Malvani Fish Fry Masala, kokum water, ginger-garlic paste, and a dash of salt to make a thick, concentrated red paint-like paste.',
      'Generously rub this paste over all surfaces of the fish slices. Marinate for 15-20 minutes.',
      'Mix fine semolina and rice flour on a flat plate.',
      'Gently press each marinated fish slice into the semolina mix to achieve a clean, even coating on both sides.',
      'Heat coconut oil in a flat iron skillet/tawa on medium-high heat.',
      'Shallow fry the fish for 6-7 minutes on each side until the outer skin turns deep dark golden-brown and crispy.',
      'Drain on clean plates and serve screaming hot garnished with onions and lemon slices.'
    ],
    image: '/src/assets/images/malvani_cooking_1780594653286.png'
  },
  {
    id: 'r2',
    title: 'Royal Malvani Chicken Curry with Vade',
    prepTime: '30 mins',
    cookTime: '45 mins',
    difficulty: 'Medium',
    servings: 6,
    description: 'The soul of Malvani cuisine. Chicken slow-stewed in a fragrant roasted fresh coconut gravy, flavored with Special Sunday Masala, and paired with puffed Kombdi Vade.',
    ingredients: [
      '1 kg Chicken, curry-cut pieces',
      '3 tbsp Geetas Malvani Special Sunday Masala',
      '500g Geetas Kombdi Vade Pith (flour)',
      '1 cup Grated Fresh Wet Coconut',
      '2 large Onions, finely sliced',
      '1 tbsp Ginger-garlic paste',
      '4-5 Malvani Solas (Aamsul/Kokum)',
      '3 tbsp Coconut oil',
      'Fresh coriander leaves for heavy garnish'
    ],
    steps: [
      'Marinate Chicken in turmeric, ginger-garlic paste, and lime juice for 30 minutes.',
      'Dry roast grated fresh coconut and one sliced onion in a pan until chocolate brown. Grind with a little water to make a signature silky "Vatan" paste.',
      'In a deep vessel, heat coconut oil, saute the remaining onions till translucent, add Geetas Malvani Special Sunday Masala and fry for 1 minute.',
      'Add the marinated chicken and roast on high heat for 5 minutes to sear in flavors.',
      'Pour in 2 cups of boiling water, add Kokum solos, and simmer covered for 15 minutes.',
      'Stir in the coconut "Vatan" paste, adjust salt, and simmer uncovered for 10-12 minutes until the chicken is fork-tender and curry is swimming in rich red oil (tarri).',
      'Meanwhile, knead Geetas Vade Pith with warm water, shape small rounds over damp wrap, deep-fry in smoking oil until fully puffed and golden.',
      'Serve chicken rassa in deep brass bowls alongside steaming hot puffed Kombdi Vade.'
    ],
    image: '/src/assets/images/malvani_cooking_1780594653286.png'
  },
  {
    id: 'r3',
    title: 'Traditional Spicy Kat/Misal',
    prepTime: '15 mins',
    cookTime: '25 mins',
    difficulty: 'Easy',
    servings: 4,
    description: 'Create the ultimate spicy Maharashtrian breakfast at home using our custom roasted Misal Masala to produce a beautiful, red-hot fiery gravy layer.',
    ingredients: [
      '2 cups Mixed sprouts (Matki/moth beans), boiled',
      '2 tbsp Geetas Special Misal Masala',
      '2 Onions & 2 Tomatoes, finely chopped',
      '1 tbsp Ginger-garlic paste',
      '3 tbsp Refined oil (generous amount is key for Kat)',
      '1 cup Mixed Spicy Farsan (namkeen)',
      'Chopped onion, lemon, and fresh coriander',
      '4 fresh soft Pav buns'
    ],
    steps: [
      'Heat oil in a deep kai. Saute chopped onions and ginger-garlic paste until rich brown.',
      'Add chopped tomatoes and cook until oil starts separating from the masala edges.',
      'Incorporate 2 tablespoons of Geetas Special Misal Masala and cook for 1 minute on very low heat to avoid scorching spices.',
      'Stir in boiled sprouts along with their cooking water. Add another 2 cups of hot water to make a thin, flowing rassa.',
      'Let cook on a rolling boil for 12-15 minutes until a beautiful, glistening layer of spicy red oil ("Kat") floats on top.',
      'To assemble: ladle sprouts first in a deep bowl, pour plenty of hot sizzling rassa on top, throw a heavy handful of fresh farsan, garnish with onions and coriander.',
      'Serve with soft pav and a wedge of lemon.'
    ],
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Suhas Parab',
    location: 'Mumbai (Native of Malvan)',
    rating: 5,
    review: 'I have lived in Mumbai for 20 years, but my kitchen always smells like Malvan thanks to Geeta’s Sunday Masala. The coarse roast and oil release is exactly how my grandmother used to grind spices in Kasal. Highly recommended!',
    product: 'Malvani special Sunday masala'
  },
  {
    id: 't2',
    name: 'Sneha Shirodkar',
    location: 'Pune',
    rating: 5,
    review: 'Their Basmati Modak Pith was an absolute lifesaver during Ganesh Chaturthi! The modaks turned out beautiful white, extremely soft, and didn’t develop a single tear. Absolute high-quality flour.',
    product: 'Basmati modak pith'
  },
  {
    id: 't3',
    name: 'Chef Milind Sawant',
    location: 'Alibaug Heritage Resort',
    rating: 5,
    review: 'As a chef specializing in coastal seafood, I demand absolute authenticity. Geeta’s Fish Fry Masala has the perfect dry-roasted tang of coastal spices. It coats pomfret spectacularly and doesn’t burn in hot pan oil.',
    product: 'Malvani fish fry masala'
  },
  {
    id: 't4',
    name: 'Rajen Bhise',
    location: 'Kasal',
    rating: 5,
    review: 'Their dry-fruit Kaju cashew selections are legendary in our region! Large jumbo nuts, freshly dried, completely sweet and high-grade. Excellent gift options for families visiting the Konkan.',
    product: 'Polish kaju(big size)'
  }
];

export const GALLERY_PHOTOS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Geeta’s Masale Kasal Storefront',
    category: 'Store',
    image: '/src/assets/images/geetas_storefront_1780594715235.png'
  },
  {
    id: 'g2',
    title: 'Boutique Shelves Filled with Spices',
    category: 'Interior',
    image: '/src/assets/images/geetas_interior_1780594732720.png'
  },
  {
    id: 'g3',
    title: 'Authentic Sundried Malvani Sola (Kokum)',
    category: 'Products',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'g4',
    title: 'Slow Roasted Indian Griddle Spices',
    category: 'Heritage',
    image: '/src/assets/images/masala_hero_1780594616996.png'
  },
  {
    id: 'g5',
    title: 'Premium Raw Jumbo Cashews',
    category: 'Kaju',
    image: '/src/assets/images/cashew_premium_1780594672474.png'
  },
  {
    id: 'g6',
    title: 'Freshly Steamed Malvani Chicken & Vatan',
    category: 'Cooking',
    image: '/src/assets/images/malvani_cooking_1780594653286.png'
  }
];
