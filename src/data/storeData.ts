/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Recipe, Testimonial, GalleryItem } from '../types';
import malvaniSundayMasala from '../assets/images/Masale/malvani spl Sunday masala.webp';
import frymasala from '../assets/images/Masale/Malvani fish fry masala.webP';
import Biryanimasala from '../assets/images/Masale/Biryani masala.webP';
import Kashmirimirchi from '../assets/images/Masale/Kashmiri mirchi powder.webP';
import specialbhajka from '../assets/images/Masale/Malvani special bhajka masala.webP';
import muttonmasala from '../assets/images/Masale/malvani special mutton masala.webP';
import currymasala from '../assets/images/Masale/malvani fish curry masala.webP';
import kandaLasunMasala from '../assets/images/Masale/Kanda lasun masala.webP';
import specialmisal from '../assets/images/Masale/special misal masala.webP';
import shengdanachutney from '../assets/images/Masale/shengdana chutney.webP';
import kulithpithi from '../assets/images/Pith/Gavthi kulith pithi.webP';
import Thalipithbhajni from '../assets/images/Pith/Thalipith bhajni.webP';
import Basmatimodakpith from '../assets/images/Pith/Basmati modak pith.webP';
import Ghavanepith from '../assets/images/Pith/Ghavane pith.webP';
import Malvanivadepith from '../assets/images/Pith/Malvani vade pith.webP';
import Aambolipith from '../assets/images/Pith/Aamboli pith.webP';
import Shirwalepith from '../assets/images/Pith/Shirwale pith.webP';
import MalvaniSola from '../assets/images/Malvani product/Malvani Sola ( Aamsul ).webP';
import Gavathiukdetandul from '../assets/images/Malvani product/Gavathi ukde tandul.webP';
import Homemadegulkhobravadi from '../assets/images/Malvani product/Homemade gul khobra vadi.webP';
import Taakmirchi from '../assets/images/Malvani product/Taak mirchi.webP';
import Sandgimirchi from '../assets/images/Malvani product/Sandgi mirchi.webP';
import AwalaCandy from '../assets/images/Malvani product/Awala Candy.webP';
import Fanaswafers from '../assets/images/Malvani product/Fanas wafers.webP';
import Gavathipohe from '../assets/images/Malvani product/Gavathi pohe.webP';
import Aambapoli from '../assets/images/Malvani product/Aamba poli.webP';
import Fanaspoli from '../assets/images/Malvani product/Fanas poli.webP';
import MalvaniKhaja from '../assets/images/Malvani product/Malvani Khaja.webP';
import Khadkhadeladdoo from '../assets/images/Laddoos/Khadkhade laddoo.webP';
import Kadakbundiladdoo from '../assets/images/Laddoos/Kadak bundi laddoo.webP';
import Shevladdoo from '../assets/images/Laddoos/Shev laddoo.webP';
import Shengdanaladdoo from '../assets/images/Laddoos/Shengdana laddoo.webP';
import polishkaju2 from '../assets/images/Kaju/polish kaju 2 (big size).webP';
import Salwalekaju2 from '../assets/images/Kaju/Salwale kaju 2 (big size).webP';
import Salwalekaju4 from '../assets/images/Kaju/Salwale kaju 4 (medium size).webP';
import Saltedkaju from '../assets/images/Kaju/Salted kaju.webP';
import Masalakaju from '../assets/images/Kaju/Masala kaju.webP';
import Tukdakaju from '../assets/images/Kaju/Tukda kaju.webP';
import polishkaju4 from '../assets/images/Kaju/polish kaju 4 (medium size).webP';

// Static assets for categories, gallery, and recipes to ensure Vite bundles them successfully in production
import cookingImage from '../assets/images/malvani_cooking_1780594653286.png';
import storefrontImage from '../assets/images/geetas_storefront_1780594715235.png';
import interiorImage from '../assets/images/geetas_interior_1780594732720.png';
import masalaHeroImage from '../assets/images/masala_hero_1780594616996.png';
import cashewPremiumImage from '../assets/images/cashew_premium_1780594672474.png';

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
    image: cashewPremiumImage,
    count: 7
  }
];

export const PRODUCTS: Product[] = [
  // Masale Category
  {
    id: 'm1',
    category: 'Masale',
    name: 'Malvani Special Sunday Masala',
    weight: '250gm',
    mrp: 275,
    ratePerKg: 1100,
    description: 'Our crown jewel. A secret multi-generational blend of heavy-roast spices and rich Ghati chillies designed for your slow-cooked Sunday feasts.',
    ingredients: 'Coriander, Red Chilli, Cumin, Turmeric, Black Pepper, Dagad Phool, Star Anise, Jaiphal, Aromatic Konkan Spices',
    usage: 'Add 2-3 tablespoons during the gravy tempering phase. Cook on low heat to release slow-roasted essential oils.',
    shelfLife: '12 Months',
    notes: 'No artificial colors, preservatives, or added MSG. Strictly vegetarian.',
    image: malvaniSundayMasala  
  },
  {
    id: 'm2',
    category: 'Masale',
    name: 'Malvani Fish Fry Masala',
    weight: '300gm',
    mrp: 240,
    ratePerKg: 800,
    description: 'High-acid, fiery spice blend optimized to grip fish skin and create an elite, gold-paneled outer crunch during pan frying.',
    ingredients: 'Red Chilli, Roasted Coriander, Pure Turmeric, Dried Garlic, Iodized Salt, Coastal Heritage Spices',
    usage: 'Mix with lime juice or kokum water to make a paste. Generously coat fish slices, dust with semolina, and shallow fry.',
    shelfLife: '12 Months',
    notes: 'Specially crafted for Pomfret, Surmai, Bangda, and prawns.',
    image: frymasala     
  },
  {
    id: 'm3',
    category: 'Masale',
    name: 'Biryani Masala',
    weight: '250gm',
    mrp: 300,
    ratePerKg: 1320,
    description: 'A sovereign blend of fragrant whole spices, ground precisely to deliver that trademark royal aromatic cloud when you crack open the handi dum.',
    ingredients: 'Green Cardamom, Cloves, Cinnamon Bark, Bay Leaf, Nutmeg, Mace, Black Cumin, Rose Petals',
    usage: 'Add during rice boiling and sprinkle between layers of rice and meat/vegetables before dum sealing.',
    shelfLife: '12 Months',
    notes: 'Magnificently suited for both authentic vegetable and slow-cooked meat biryanis.',
    image: Biryanimasala
  },
  {
    id: 'm4',
    category: 'Masale',
    name: 'Kashmiri Mirchi Powder',
    weight: '250gm',
    mrp: 220,
    ratePerKg: 880,
    description: 'Expertly selected mild-heat Kashmiri chillies ground at low temperature to preserve the shiny carotenoidal red oils and sweet natural glaze.',
    ingredients: 'Premium, hand-picked deseeded Kashmiri Red Chillies',
    usage: 'Incorporate in slow curries, subzis, and marinades for a brilliant, photogenic crimson hue without burning heat.',
    shelfLife: '12 Months',
    notes: 'Dual action: works as an organic visual glaze and a mild warm aroma enhancer.',
    image: Kashmirimirchi
  },
  {
    id: 'm5',
    category: 'Masale',
    name: 'Malvani Special Bhajka Masala',
    weight: '250gm',
    mrp: 225,
    ratePerKg: 900,
    description: 'Slow-roasted to charcoal edges, this bhaji/gravy base blend delivers an irreplaceable smoky, complex undertone unique to traditional Konkan hearths.',
    ingredients: 'Roasted Coriander, Roasted Cumin, Dry Grated Coconut, Roasted Kashmiri & Sankeshwari Chillies, Bay Leaves',
    usage: 'Use as a thickening and flavoring agent directly in veg sprouts, local shev bhaji, or dry mutton thick gravies.',
    shelfLife: '12 Months',
    notes: 'Extremely authentic. Delivers the classic dark brown coastal gravy look.',
    image: specialbhajka
  },
  {
    id: 'm6',
    category: 'Masale',
    name: 'Malvani Special Mutton Masala',
    weight: '250gm',
    mrp: 325,
    ratePerKg: 1300,
    description: 'Fierce, full-blooded signature masala engineered to penetrate tough red meat fibers and marry cleanly with rich caramelized onions.',
    ingredients: 'Coriander, Red Sankeshwari Chilli, Black Pepper, Strong Garam Masala formulation, Cloves, Ginger, Garlic',
    usage: 'Whisk with yogurt/oil and marinate raw mutton for 2 hours, then saute on high heat before adding water to cook.',
    shelfLife: '12 Months',
    notes: 'Produces a thin, fiery oil layer (tarri) on top of curries.',
    image: muttonmasala
  },
  {
    id: 'm7',
    category: 'Masale',
    name: 'Malvani Fish Curry Masala',
    weight: '250gm',
    mrp: 250,
    ratePerKg: 1000,
    description: 'Light, tangy-spice blend created to fuse perfectly with freshly grated coconut milk or raw fresh grated coconut paste for a velvety gravy.',
    ingredients: 'Dehydrated White Coconut, Coriander, Lavangi Chilli, Turmeric, Dried Garlic Pearls, Star Anise, Black Pepper',
    usage: 'Grind this masala with fresh wet coconut and water, boil with Kokum/Tamarind juice, and add raw fish at the very end.',
    shelfLife: '12 Months',
    notes: 'Replicates the taste of Malvani beach-side shacks.',
    image: currymasala
  },
  {
    id: 'm8',
    category: 'Masale',
    name: 'Khobra Lasun Chutney',
    weight: '200gm',
    mrp: 120,
    description: 'A coarse, dry, punchy side-dish chutney made from premium dried coconut flakes and spicy raw garlic cloves.',
    ingredients: 'Graded Dry Coconut, Peeled Malvan Garlic, Red Chilli Flakes, Sea Salt',
    usage: 'Ready to consume. Best enjoyed alongside freshly made hot Bajra/Jowar Bhakris, Vada Pav, or simply mixed with oil over warm rice.',
    shelfLife: '6 Months',
    notes: 'No preservatives, very low moisture content for enduring crunch.',
    image: kandaLasunMasala
  },
  {
    id: 'm9',
    category: 'Masale',
    name: 'Kanda Lasun Masala',
    weight: '250gm',
    mrp: 140,
    ratePerKg: 560,
    description: 'The staple onion-garlic masala that defines Western Maharashtra household cooking. Dark red, spicy, and extremely aromatic.',
    ingredients: 'Dehydrated Onions, Premium Garlic cloves, Sankeshwari red chillies, Salt, Special spice mix',
    usage: 'Add to everyday dry stir-fries, egg curries, potato rassa, and spicy street-style gravies.',
    shelfLife: '12 Months',
    notes: 'Saves preparation time; provides instant garlicky depth to any everyday dish.',
    image: kandaLasunMasala
  },
  {
    id: 'm10',
    category: 'Masale',
    name: 'Special Misal Masala',
    weight: '250gm',
    mrp: 220,
    ratePerKg: 880,
    description: 'A fiery, high-color, hot-spice blend that produces the iconic spicy rassa/kat that makes Misal Pav unforgettable.',
    ingredients: 'Red Sankeshwari Chilli, Coriander, Black Cardamom, Dry Cumin, Fresh Garlic oil, Cloves, Spices',
    usage: 'Add during the bean sprout boiling and oil-separation phase. Serves with farsan, dry potatoes, and soft pav.',
    shelfLife: '12 Months',
    notes: 'Specially engineered for high heat tolerance without turning bitter.',
    image: specialmisal
  },
  {
    id: 'm11',
    category: 'Masale',
    name: 'Shengdana Chutney',
    weight: '200gm',
    mrp: 120,
    ratePerKg: 480,
    description: 'Rich, dry peanut chutney ground to a clipboard state, discharging a delightful nutty oiliness paired with fiery red chilli.',
    ingredients: 'Carefully Roasted Deseeded Peanuts, Red Chilli Powder, Raw Garlic Pearls, Salt',
    usage: 'Pair with flatbreads, curd-rice, idlis, parathas or use in morning sandwich rolls for instant zinc and protein boosts.',
    shelfLife: '6 Months',
    notes: 'Dry, granular texture. Made of export-quality, sweet-kernel peanuts.',
    image: shengdanachutney
  },

  // Pith Category
  {
    id: 'p1',
    category: 'Pith',
    name: 'Gavthi Kulith Pithi',
    weight: '250gm',
    mrp: 85,
    ratePerKg: 340,
    description: 'Super-finely ground indigenous horse gram. Highly valued for its warmth-producing and high-protein therapeutic properties.',
    ingredients: 'Selected Native Horse Gram (Kulith)',
    usage: 'Boil with water, garlic, green chillies, and kokum water to create the thick, comforting traditional Malvani "pithi" soup.',
    shelfLife: '6 Months',
    notes: 'Extremely rich in dietary fiber, iron, and proteins. Great for winter wellness.',
    image: kulithpithi
  },
  {
    id: 'p2',
    category: 'Pith',
    name: 'Thalipith Bhajni',
    weight: '500gm',
    mrp: 90,
    ratePerKg: 180,
    description: 'Multigrain roasted flour mixed with aromatic spices. Perfectly roasted grains milled slowly to maintain gut-friendly properties.',
    ingredients: 'Roasted Jowar, Bajra, Wheat, Bengal Gram, Split Black Gram, Coriander Seeds, Cumin Seeds',
    usage: 'Knead with grated onions, coriander, green chillies, and hot water. Press directly onto a wet tawa with damp fingers and cook with ghee.',
    shelfLife: '6 Months',
    notes: 'Highly nutritious, ready-made breakfast mix.',
    image: Thalipithbhajni
  },
  {
    id: 'p3',
    category: 'Pith',
    name: 'Basmati Modak Pith',
    weight: '500gm',
    mrp: 80,
    ratePerKg: 160,
    description: 'Pure, ultra-refined fragrant Basmati rice flour milled specifically to yield extremely soft, tear-resistant outer shells for sweet Modaks.',
    ingredients: 'Fragrant Premium Basmati Rice kernels',
    usage: 'Prepare Ukad (steamed dough) by boiling flour with water/milk and some ghee, knead thoroughly, stuff with coconut-jaggery, and steam.',
    shelfLife: '6 Months',
    notes: 'Superior aroma and white satin finish. Perfect for Ukdiche Modak during Ganeshotsav.',
    image: Basmatimodakpith
  },
  {
    id: 'p4',
    category: 'Pith',
    name: 'Ghavne Pith',
    weight: '500gm',
    mrp: 80,
    ratePerKg: 160,
    description: 'Ready-mix rice flour blended with precise mineral salts to yield paper-thin, lace-like coastal crêpes without stickiness.',
    ingredients: 'Finely polished coastal rice grains, Sea Salt, baking aids',
    usage: 'Mix with water to achieve a very watery, buttermilk-like consistency. Pour from height onto a blazing hot, oiled cast-iron grid tawa.',
    shelfLife: '6 Months',
    notes: 'Pre-treated to ensure the crêpes can be peeled off easily without tearing.',
    image: Ghavanepith
  },
  {
    id: 'p5',
    category: 'Pith',
    name: 'Malvani Vade Pith',
    weight: '500gm',
    mrp: 80,
    ratePerKg: 160,
    description: 'Pre-roasted and seasoned blend of grains and lentils designed to rise and form fluffy, crispy Malvani Kombdi Vade.',
    ingredients: 'Parboiled Rice, Wheat, Bengal Gram, Black Gram, Fenugreek Seeds, Fennel Seeds, Coriander Seeds',
    usage: 'Knead with warm water, let sit for 30 minutes, pat small rounds on a damp plastic wrap, and deep fry in piping hot oil.',
    shelfLife: '6 Months',
    notes: 'The classic accomplice to Malvani Chicken/Mutton Rassa.',
    image: Malvanivadepith
  },
  {
    id: 'p6',
    category: 'Pith',
    name: 'Aamboli Pith',
    weight: '500gm',
    mrp: 90,
    ratePerKg: 180,
    description: 'A fermented-grade rice and split black lentil flour formulation that yields sponge-like, fluffy breakfast pancakes (Amboli).',
    ingredients: 'Polished Rice, Graded Urad Dal, Fenugreek Seeds',
    usage: 'Soak with warm water to a smooth thick batter, let sit overnight for natural fermentation, pour thick on tawa, cover and cook.',
    shelfLife: '6 Months',
    notes: 'Produces highly nutritious, naturally aerated and soft breakfast pancakes.',
    image: Aambolipith
  },
  {
    id: 'p7',
    category: 'Pith',
    name: 'Shirwale Pith',
    weight: '500gm',
    mrp: 80,
    ratePerKg: 160,
    description: 'Special formulation rice flour prepared with optimal starch gelatinization temperature to seamlessly press into local steamed noodles.',
    ingredients: 'Premium high-starch rice grains',
    usage: 'Boil into dry dough, press through a heavy brass Shirvale/Shevya squeezer, steam noodles, and serve with sweet cardamom coconut milk.',
    shelfLife: '6 Months',
    notes: 'Authentic Konkani sweet dish helper ingredient.',
    image: Shirwalepith
  },

  // Malvani Products Category
  {
    id: 'mp1',
    category: 'Malvani products',
    name: 'Malvani Sola (Aamsul)',
    weight: '250gm',
    mrp: 150,
    ratePerKg: 600,
    description: 'Deep purple, thick black-kokum rinds wet-salted and sun-dried to lock in maximum hydroxycitric acid for souring curries.',
    ingredients: 'Freshly harvested Red Kokum fruit rinds, Pure Sea Salt',
    usage: 'Drop 3-4 solos directly into fish curries or soak in warm water to extract beautiful crimson juice for Solkadhi cream.',
    shelfLife: '12 Months',
    notes: 'Pure organic souring agent; rich in natural antioxidants.',
    image: MalvaniSola
  },
  {
    id: 'mp2',
    category: 'Malvani products',
    name: 'Gavthi Ukde Tandul',
    weight: '500gm',
    mrp: 80,
    ratePerKg: 160,
    description: 'Coarse, parboiled local brown rice harvested by small-scale Konkan farmers. Retains the highly nutritious outer bran layer.',
    ingredients: 'Authentic parboiled red rice hulls',
    usage: 'Wash thrice, cook in plenty of water (takes longer than white rice), drain excess water. Best served piping hot with fish rassa.',
    shelfLife: '12 Months',
    notes: 'Has a highly distinct earthy aroma and rich fiber profile.',
    image: Gavathiukdetandul
  },
  {
    id: 'mp3',
    category: 'Malvani products',
    name: 'Homemade Gul Khobravadi',
    weight: '1 unit (Approx 300g)',
    mrp: 90,
    description: 'Traditional sweets crafted with absolute purity, mixing fresh wet-grated coconut milk, rich dark organic jaggery, and cardamom.',
    ingredients: 'Wet-grated Coconut, Organic Sugarcane Jaggery, Pure Cow Ghee, Green Cardamom seeds',
    usage: 'Ready to eat sweet treat post meals or as healthy dessert snacks during the day.',
    shelfLife: '3 Months',
    notes: 'Handmade by local women artisans, entirely chemical-free.',
    image: Homemadegulkhobravadi
  },
  {
    id: 'mp4',
    category: 'Malvani products',
    name: 'Taak Mirchi',
    weight: '1 packet',
    mrp: 70,
    description: 'Mild green hot pepper lines soaked in sour salted buttermilk, cured under heavy sun till they shrink to white-golden crisp crusts.',
    ingredients: 'Punctured Green Chillies, Fermented Cow Buttermilk, Graded Rock Salt',
    usage: 'Deep fry in hot oil for 5-10 seconds until they turn dark brown. Serve instantly alongside dal-rice or khichdi.',
    shelfLife: '12 Months',
    notes: 'Irreplaceable salty, sour, and mildly hot side-dish accompaniment.',
    image: Taakmirchi
  },
  {
    id: 'mp5',
    category: 'Malvani products',
    name: 'Sandgi Mirchi',
    weight: '1 packet',
    mrp: 70,
    description: 'Hand-split chillies stuffed with toasted Fenugreek, Cumin, Mustard, and Turmeric, soaked in salted buttermilk and thoroughly sun-dried.',
    ingredients: 'Thick local Green Peppers, Fenugreek seeds, Cumin seeds, Turmeric, Buttermilk, Salt',
    usage: 'Fry in hot oil until charcoal brown and crunchy. Crush over flatbreads or plain curd rice.',
    shelfLife: '12 Months',
    notes: 'Spicier, more fragrant spice-stuffed alternative to Taak Mirchi.',
    image: Sandgimirchi
  },
  {
    id: 'mp6',
    category: 'Malvani products',
    name: 'Awala Candy 100 gm',
    weight: '100gm',
    mrp: 40,
    description: 'Delectable sweet and tangy segments of fleshy gooseberries saturated with sugar juice and sun-dehydrated. Juicy and chewy.',
    ingredients: 'Fresh Indian Gooseberry (Amla) pulp, Granulated Sugar, Citric acid',
    usage: 'Ready to eat digestive aid. Chew a couple of candies post meal for cooling and fresh digestion.',
    shelfLife: '6 Months',
    notes: 'Rich source of natural Vitamin C and mineral nutrients.',
    image: AwalaCandy
  },
  {
    id: 'mp7',
    category: 'Malvani products',
    name: 'Fanas Wafers',
    weight: '1 packet (Approx 150gm)',
    mrp: 90,
    description: 'Extravagantly crunchy, bright-yellow salty snacks made by slicing raw, firm flesh of Konkan jackfruits.',
    ingredients: 'Raw Jackfruit slices, Double-refined Edible Vegetable Oil, Graded Sea Salt',
    usage: 'Ready to consume crispy tea-time savory snack.',
    shelfLife: '4 Months',
    notes: 'Unique woody flavor and highly distinct high-density crunch. Highly addictive!',
    image: Fanaswafers
  },
  {
    id: 'mp8',
    category: 'Malvani products',
    name: 'Gavthi Poha',
    weight: '1 packet (Approx 250gm)',
    mrp: 70,
    description: 'Thick, rustically flattened brown rice flakes, retaining wholesome fiber. Offers deep mineral goodness.',
    ingredients: 'Earthy local paddy parboiled rice grains',
    usage: 'Wash, drain (let water soak in for 10 mins), and prepare standard traditional Kanda Poha with mustard, chillies, and yellow turmeric.',
    shelfLife: '6 Months',
    notes: 'Keeps you full for longer compared to thin industrial white rice flakes.',
    image: Gavathipohe
  },
  {
    id: 'mp9',
    category: 'Malvani products',
    name: 'Amba Poli',
    weight: '1 packet (Approx 200gm)',
    mrp: 90,
    description: 'True Alphonso Mango fruit leather. Fresh sweet mango pulp concentrated layer by layer on bamboo mats under pure coastal sun beams.',
    ingredients: 'Authentic Devgad Alphonso Mango Pulp, Granulated Sugar',
    usage: 'Ready to consume. Cut into square sheets and enjoy as clean natural mango candy slices.',
    shelfLife: '6 Months',
    notes: 'Exquisite, bright gold color. Pure fruit essence without artificial colors.',
    image: Aambapoli
  },
  {
    id: 'mp10',
    category: 'Malvani products',
    name: 'Fanas Poli',
    weight: '1 packet (Approx 200gm)',
    mrp: 90,
    description: 'Dark brown, sticky, highly distinct sweet jackfruit leather cooked intensely and thin-spread over traditional straw frames.',
    ingredients: 'Golden Ripe Jackfruit pulp, Pure Jaggery traces',
    usage: 'Ready to devour. Features an exotic warm aroma and delightful deep organic chewiness.',
    shelfLife: '6 Months',
    notes: 'Very famous regional specialty of traditional Konkani homes.',
    image: Fanaspoli
  },
  {
    id: 'mp11',
    category: 'Malvani products',
    name: 'Malvani Khaja',
    weight: '1 packet (Approx 200gm)',
    mrp: 40,
    description: 'Crispy, ribbon-like finger-length sweet flour crisps fried till light and coated with warm dissolved ginger-jaggery syrup.',
    ingredients: 'Refined Wheat Flour, Ghee, Jaggery, Fresh Ginger extract, Sesame seeds',
    usage: 'Eat straight out of the box. Traditional local fair (Jatra) sweet of Malvan.',
    shelfLife: '2 Months',
    notes: 'Features a sweet, warm ginger-jaggery spice glaze.',
    image: MalvaniKhaja
  },

  // Laddoos Category
  {
    id: 'l1',
    category: 'Laddoos',
    name: 'Khadkhade Laddoos',
    weight: '25 unit box',
    mrp: 80,
    description: 'Unique, hollow and incredibly crispy sweet balls rolled traditionally using dried rice flour flakes and molten hot jaggery.',
    ingredients: 'Fine Rice flakes, Molten Jaggery, Cow Ghee, Cardamom seeds',
    usage: 'Ready to enjoy. Features a highly unique hollow crisp snap when bitten!',
    shelfLife: '2 Months',
    notes: 'Our absolute specialty. Handmade using complex antique folding ratios.',
    image: Khadkhadeladdoo
  },
  {
    id: 'l2',
    category: 'Laddoos',
    name: 'Kadak Bundi Laddoo',
    weight: '25 unit box',
    mrp: 80,
    description: 'Crunchy, dense sugar-glazed golden chickpea flour drops mixed with warm cardamom and pressed tightly into classic sphere formats.',
    ingredients: 'Bengal Gram flour (Besan), Sugar crystals, Pure Cow Ghee, Nutmeg, Cardamom',
    usage: 'Ready to eat festive sweet treats.',
    shelfLife: '2 Months',
    notes: 'Beloved child-hood treat; retains crunchy bead textures throughout.',
    image: Kadakbundiladdoo
  },
  {
    id: 'l3',
    category: 'Laddoos',
    name: 'Shev Laddoo',
    weight: '25 unit box',
    mrp: 80,
    description: 'Inimitable local salty-sweet combination laddoos made with fine chickpea flour noodles glazed in thick cardamom-infused jaggery syrup.',
    ingredients: 'Bengal Gram flour noodles, Sugarcane Jaggery, Ghee, Sesame seeds',
    usage: 'Ready to eat. Melts easily with a satisfying moist crumbly texture.',
    shelfLife: '2 Months',
    notes: 'Perfect pairing with savory snack menus.',
    image: Shevladdoo
  },
  {
    id: 'l4',
    category: 'Laddoos',
    name: 'Shengdana Laddoo',
    weight: '20 unit box',
    mrp: 90,
    description: 'Extremely nutritious, protein-concentrated balls of coarse crushed sweet peanuts bound with pure melted organic jaggery.',
    ingredients: 'Selected Roasted Peanuts, Molten sugarcane Jaggery, Ghee highlights',
    usage: 'Perfect healthy breakfast bite or immediate non-chemical energy boost post gym/school.',
    shelfLife: '3 Months',
    notes: 'Preservative-free energy food, rich in plant-based proteins.',
    image: Shengdanaladdoo
  },

  // Kaju Category
  {
    id: 'k1',
    category: 'Kaju',
    name: 'Polish Kaju (Big Size)',
    weight: '250gm',
    mrp: 380,
    description: 'Sovereign white premium jumbo cashews carefully hand-sorted to exclude any blemishes. Pristine ivory shine.',
    ingredients: 'Export-grade whole Raw Cashew Nuts (Kaju)',
    usage: 'Consume raw as premium snacks, gift in dynamic occasions, or chop into luxury desserts and rich royal gravies.',
    shelfLife: '9 Months',
    notes: 'Grown on Malvan family plantations, carefully polished without heat.',
    image: polishkaju2
  },
  {
    id: 'k2',
    category: 'Kaju',
    name: 'Salwale Kaju (Big Size)',
    weight: '250gm',
    mrp: 250,
    ratePerKg: 950,
    description: 'Salted, premium jumbo roasted cashews. Lightly pan-toasted to unlock full creamy richness with high-grade hand-sprinkled sea salt.',
    ingredients: 'Premium Jumbo Cashew Kernels, Organic Sea Salt, trace refined oils',
    usage: 'Ready-to-eat gourmet snack. Incredible tea-time luxury.',
    shelfLife: '9 Months',
    notes: 'Roasted at low temperature to protect healthy fats.',
    image: Salwalekaju2
  },
  {
    id: 'k3',
    category: 'Kaju',
    name: 'Salwale Kaju (Medium)',
    weight: '250gm',
    mrp: 250,
    ratePerKg: 880,
    description: 'Perfect daily-snack salted cashews of medium sizing, exhibiting sweet butteriness balanced by crisp sea salt dust.',
    ingredients: 'Medium Cashew Kernels, Sea Salt, trace oil',
    usage: 'Ready-to-eat luxury snacks for hosting guests or office munching.',
    shelfLife: '9 Months',
    notes: 'Highly cost-effective family snack pack size.',
    image: Salwalekaju4
  },
  {
    id: 'k4',
    category: 'Kaju',
    name: 'Salted Kaju',
    weight: '200gm',
    mrp: 230,
    ratePerKg: 1150,
    description: 'Intensely crispy salted whole cashew nut snacks, vacuum packed to sustain absolute freshness and oil balance.',
    ingredients: 'Premium Cashews, Salt',
    usage: 'Eat straight out of the jar. Pairs well with juices, snacks, and sweet platters.',
    shelfLife: '9 Months',
    notes: 'Protected with gas-flush packaging to avoid oxygen-staling.',
    image: Saltedkaju
  },
  {
    id: 'k5',
    category: 'Kaju',
    name: 'Masala Kaju',
    weight: '200gm',
    mrp: 230,
    ratePerKg: 1150,
    description: 'Fiery, highly appetizing roasted whole cashews dressed with our secret Malvani seasoning blend. Creamy, spicy, and tangy.',
    ingredients: 'Premium whole cashews, Malvani ground red pepper, garlic oil, amchur dry mango, sea salt',
    usage: 'Stellar premium savory snack for high-end hospitality.',
    shelfLife: '9 Months',
    notes: 'A perfect explosion of Konkan flavors in every single kernel.',
    image: Masalakaju
  },
  {
    id: 'k6',
    category: 'Kaju',
    name: 'Tukda Kaju',
    weight: '200gm',
    mrp: 175,
    ratePerKg: 875,
    description: 'Premium raw split cashew pieces. Retains identical sweet fatty flavor of whole nuts but in split forms for cooking convenience.',
    ingredients: 'Raw Cashew pieces and halves',
    usage: 'Incorporate in rice puddings (kheer), cake batters, festive sweets, or blend for rich Mughlai cashew paste bases.',
    shelfLife: '9 Months',
    notes: 'Highly economical kitchen utility ingredient.',
    image: Tukdakaju
  },
  {
    id: 'k7',
    category: 'Kaju',
    name: 'Polish Kaju (Medium Size)',
    weight: '250gm',
    mrp: 260,
    ratePerKg: 1040,
    description: 'Pristine raw ivory cashews of medium caliber, hand-shelled and polished cleanly. Yields delightful natural creaminess.',
    ingredients: 'Raw medium Cashew Kernels',
    usage: 'Excellent dry snack, useful for school-going kids, or as dry fruit decor plates.',
    shelfLife: '9 Months',
    notes: 'Pure raw cashews, entirely unroasted.',
    image: polishkaju4
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
    image: cookingImage
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
    image: cookingImage
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
      'Heat oil in a deep kadai. Saute chopped onions and ginger-garlic paste until rich brown.',
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
    product: 'Malvani Special Sunday Masala'
  },
  {
    id: 't2',
    name: 'Sneha Shirodkar',
    location: 'Pune',
    rating: 5,
    review: 'Their Basmati Modak Pith was an absolute lifesaver during Ganesh Chaturthi! The modaks turned out beautiful white, extremely soft, and didn’t develop a single tear. Absolute high-quality flour.',
    product: 'Basmati Modak Pith'
  },
  {
    id: 't3',
    name: 'Chef Milind Sawant',
    location: 'Alibaug Heritage Resort',
    rating: 5,
    review: 'As a chef specializing in coastal seafood, I demand absolute authenticity. Geeta’s Fish Fry Masala has the perfect dry-roasted tang of coastal spices. It coats pomfret spectacularly and doesn’t burn in hot pan oil.',
    product: 'Malvani Fish Fry Masala'
  },
  {
    id: 't4',
    name: 'Rajen Bhise',
    location: 'Kasal',
    rating: 5,
    review: 'Their dry-fruit Kaju cashew selections are legendary in our region! Large jumbo nuts, freshly dried, completely sweet and high-grade. Excellent gift options for families visiting the Konkan.',
    product: 'Polish Kaju (Big Size)'
  }
];

export const GALLERY_PHOTOS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Geeta’s Masale Kasal Storefront',
    category: 'Store',
    image: storefrontImage
  },
  {
    id: 'g2',
    title: 'Boutique Shelves Filled with Spices',
    category: 'Interior',
    image: interiorImage
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
    image: masalaHeroImage
  },
  {
    id: 'g5',
    title: 'Premium Raw Jumbo Cashews',
    category: 'Kaju',
    image: cashewPremiumImage
  },
  {
    id: 'g6',
    title: 'Freshly Steamed Malvani Chicken & Vatan',
    category: 'Cooking',
    image: cookingImage
  }
];
