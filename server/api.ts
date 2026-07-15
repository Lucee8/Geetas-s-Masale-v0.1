/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  getAdmins, 
  getCategories, saveCategories,
  getProducts, saveProducts,
  getOrders, saveOrders,
  getPayments, savePayments,
  getReviews, saveReviews,
  getContactMessages, saveContactMessages,
  getWebsiteSettings, saveWebsiteSettings,
  getBanners, saveBanners,
  getCoupons, saveCoupons,
  Product, Category, Order, Review, ContactMessage
} from './db/database';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from './middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'geetas-special-sunday-masala-secret-key';

// -------------------------------------------------------------
// PUBLIC & CUSTOMER API ENDPOINTS
// -------------------------------------------------------------

// Website metadata / configuration settings
router.get('/settings', (req, res) => {
  const settings = getWebsiteSettings();
  res.json(settings);
});

// Categories list
router.get('/categories', (req, res) => {
  const categories = getCategories();
  // Filter out hidden ones for raw customers
  res.json(categories.filter(c => !c.hidden));
});

// Products list (supports optional search and categories filter)
router.get('/products', (req, res) => {
  const products = getProducts();
  const { category, search } = req.query;
  
  let filtered = products;
  
  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }
  
  if (search) {
    const query = (search as string).toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) || 
      p.ingredients.toLowerCase().includes(query)
    );
  }
  
  res.json(filtered);
});

// Single product details
router.get('/products/:id', (req, res) => {
  const products = getProducts();
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Fetch approved reviews
router.get('/reviews', (req, res) => {
  const reviews = getReviews();
  const approved = reviews.filter(r => r.approved);
  res.json(approved);
});

// Submit a new customer review
router.post('/reviews', (req, res) => {
  const { name, rating, comment } = req.body;
  if (!name || !rating || !comment) {
    return res.status(400).json({ error: 'Missing required parameters: name, rating, comment' });
  }
  
  const reviews = getReviews();
  const newReview: Review = {
    id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
    name,
    ratingValue: Number(rating),
    comment,
    date: new Date().toISOString().split('T')[0],
    verified: false,
    approved: false // Admin must approve it first (moderation cycle)
  };
  
  reviews.push(newReview);
  saveReviews(reviews);
  res.status(201).json({ message: 'Review submitted. Thank you! It will be listed once approved.', review: newReview });
});

// Submit a client inquiry message
router.post(['/contact', '/contacts'], (req, res) => {
  const { name, email, phone, subject, message, product } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing required fields for contact submission (name and phone are required)' });
  }
  
  const finalEmail = email || '';
  const finalSubject = subject || product || 'General Inquiry';
  const finalMessage = message || 'No additional text specified.';

  const messages = getContactMessages();
  const newMsg: ContactMessage = {
    id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
    name,
    email: finalEmail,
    phone,
    subject: finalSubject,
    message: finalMessage,
    status: 'New',
    createdAt: new Date().toISOString()
  };
  
  messages.push(newMsg);
  saveContactMessages(messages);
  res.status(201).json({ message: 'Inquiry details submitted successfully. Geetas kitchen will reply soon.', data: newMsg });
});

// Submit/Create a New Order from Cust Checkout Flow
router.post('/orders', (req, res) => {
  const { customerName, customerPhone, customerAddress, customerEmail, items, paymentType, amount, paidAmount } = req.body;
  
  if (!customerName || !customerPhone || !customerAddress || !items || !Array.isArray(items) || items.length === 0 || !amount) {
    return res.status(400).json({ error: 'Incomplete client order checkout details.' });
  }

  const orders = getOrders();
  const products = getProducts();
  
  // Deduct/update inventory stock for each purchased product
  const updatedProducts = products.map(prod => {
    const item = items.find((i: any) => i.productId === prod.id || i.product?.id === prod.id);
    if (item) {
      const quantityToDeduct = item.quantity;
      return { ...prod, stock: Math.max(0, prod.stock - quantityToDeduct) };
    }
    return prod;
  });
  saveProducts(updatedProducts);

  // Parse items to save
  const orderItems = items.map((item: any) => {
    // support nested product structures if payload differs
    const pId = item.productId || item.product?.id;
    const pName = item.productName || item.product?.name;
    const pWeight = item.weight || item.product?.weight;
    const pPrice = item.price || item.product?.mrp;
    return {
      productId: pId,
      productName: pName,
      quantity: item.quantity,
      price: Number(pPrice),
      weight: pWeight
    };
  });

  const parsedAmount = Number(amount);
  const parsedPaid = Number(paidAmount || 0);

  const newOrder: Order = {
    id: `GMA-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    customerName,
    customerPhone,
    customerAddress,
    customerEmail: customerEmail || '',
    items: orderItems,
    paymentType: paymentType || 'COD',
    amount: parsedAmount,
    paidAmount: parsedPaid,
    pendingAmount: Math.max(0, parsedAmount - parsedPaid),
    status: 'Inquiry',
    paymentStatus: 'Pending',
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  saveOrders(orders);

  // If a transaction reference is present, store payment transaction details
  if (req.body.transactionReference) {
    const payments = getPayments();
    payments.push({
      id: `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: newOrder.id,
      amount: parsedPaid,
      method: 'UPI',
      transactionReference: req.body.transactionReference,
      status: 'Success',
      createdAt: new Date().toISOString()
    });
    savePayments(payments);
  }

  res.status(201).json({ message: 'Order submitted successfully!', order: newOrder });
});

// Banners & coupons
router.get('/banners', (req, res) => res.json(getBanners().filter(b => b.active)));
router.get('/coupons', (req, res) => res.json(getCoupons().filter(c => c.active)));

// Validate dynamic coupon
router.post('/coupons/validate', (req, res) => {
  const { code, amount } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });
  const coupon = getCoupons().find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
  if (!coupon) return res.status(404).json({ error: 'Invalid or inactive coupon code' });
  if (amount && amount < coupon.minOrderAmount) {
    return res.status(400).json({ error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` });
  }
  res.json(coupon);
});

router.get('/coupons/validate', (req, res) => {
  const code = req.query.code as string;
  const amount = Number(req.query.amount || 0);
  if (!code) return res.status(400).json({ error: 'Code is required' });
  const coupon = getCoupons().find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
  if (!coupon) return res.status(404).json({ error: 'Invalid or inactive coupon code' });
  if (amount && amount < coupon.minOrderAmount) {
    return res.status(400).json({ error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` });
  }
  res.json(coupon);
});


// -------------------------------------------------------------
// ADMIN & DASHBOARD API ENDPOINTS (PROTECTED & NON-PROTECTED LOGIN)
// -------------------------------------------------------------

// Admin sign-in / verification (STEP 3)
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter both username and password' });
  }

  const admins = getAdmins();
  const admin = admins.find(a => a.username.toLowerCase() === username.toLowerCase());
  
  if (!admin) {
    return res.status(401).json({ error: 'Invalid administrators login credentials' });
  }

  const isMatched = bcrypt.compareSync(password, admin.passwordHash);
  if (!isMatched) {
    return res.status(401).json({ error: 'Invalid administrators login credentials' });
  }

  const tokenPayload = {
    id: admin.id,
    username: admin.username,
    role: admin.role,
    name: admin.name
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
  res.json({
    message: 'Login successful. Welcome back!',
    token,
    user: tokenPayload
  });
});

// Admin verify profile details
router.get('/auth/profile', authenticateJWT, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});


// -------------------------------------------------------------
// MANAGED CRUD ROUTES (DASHBOARD AUTH REQUIRED)
// -------------------------------------------------------------

// -- Admin Products CRUD --
router.get('/admin/products', authenticateJWT, (req, res) => {
  res.json(getProducts());
});

router.post('/admin/products', authenticateJWT, authorizeRoles(['Super Admin', 'Manager']), (req, res) => {
  const { name, category, weight, mrp, ratePerKg, description, ingredients, usage, shelfLife, notes, image, stock, isBestseller } = req.body;
  if (!name || !category || !weight || !mrp) {
    return res.status(400).json({ error: 'Missing primary product parameters' });
  }

  const products = getProducts();
  const nextId = 'm' + (products.length > 0 ? Math.max(...products.map(p => {
    const numericPart = parseInt(p.id.replace(/\D/g, ''));
    return isNaN(numericPart) ? 0 : numericPart;
  })) + 1 : 1);

  const newProduct: Product = {
    id: nextId,
    category,
    name,
    weight,
    mrp: Number(mrp),
    ratePerKg: Number(ratePerKg || (Number(mrp) / 0.250)), // Default estimation
    description: description || '',
    ingredients: ingredients || '',
    usage: usage || '',
    shelfLife: shelfLife || '12 Months',
    notes: notes || '',
    image: image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    stock: Number(stock !== undefined ? stock : 50),
    isBestseller: !!isBestseller
  };

  products.push(newProduct);
  saveProducts(products);

  // Automatically update the categories inventory count size
  const categories = getCategories();
  const updatedCategories = categories.map(cat => {
    if (cat.id.toLowerCase() === category.toLowerCase()) {
      return { ...cat, count: cat.count + 1 };
    }
    return cat;
  });
  saveCategories(updatedCategories);

  res.status(201).json({ message: 'Product created successfully', product: newProduct });
});

router.put('/admin/products/:id', authenticateJWT, authorizeRoles(['Super Admin', 'Manager']), (req, res) => {
  const products = getProducts();
  const pIndex = products.findIndex(p => p.id === req.params.id);
  if (pIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = products[pIndex];
  const updatedProduct = {
    ...existing,
    ...req.body,
    mrp: req.body.mrp !== undefined ? Number(req.body.mrp) : existing.mrp,
    ratePerKg: req.body.ratePerKg !== undefined ? Number(req.body.ratePerKg) : existing.ratePerKg,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : existing.stock,
    isBestseller: req.body.isBestseller !== undefined ? !!req.body.isBestseller : existing.isBestseller
  };

  products[pIndex] = updatedProduct;
  saveProducts(products);
  res.json({ message: 'Product updated successfully', product: updatedProduct });
});

router.delete('/admin/products/:id', authenticateJWT, authorizeRoles(['Super Admin']), (req, res) => {
  const products = getProducts();
  const productToDelete = products.find(p => p.id === req.params.id);
  if (!productToDelete) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const filtered = products.filter(p => p.id !== req.params.id);
  saveProducts(filtered);

  // Lower the category counts count
  const categories = getCategories();
  const updatedCategories = categories.map(cat => {
    if (cat.id.toLowerCase() === productToDelete.category.toLowerCase()) {
      return { ...cat, count: Math.max(0, cat.count - 1) };
    }
    return cat;
  });
  saveCategories(updatedCategories);

  res.json({ message: 'Product deleted successfully' });
});


// -- Admin Categories CRUD --
router.get('/admin/categories', authenticateJWT, (req, res) => {
  res.json(getCategories());
});

router.post('/admin/categories', authenticateJWT, authorizeRoles(['Super Admin', 'Manager']), (req, res) => {
  const { id, name, description, image } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'Missing primary category values' });
  }

  const categories = getCategories();
  if (categories.some(c => c.id.toLowerCase() === id.toLowerCase())) {
    return res.status(400).json({ error: 'Category ID already exists.' });
  }

  const newCategory: Category = {
    id,
    name,
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    count: 0,
    hidden: false
  };

  categories.push(newCategory);
  saveCategories(categories);
  res.status(201).json({ message: 'Category added.', category: newCategory });
});

router.put('/admin/categories/:id', authenticateJWT, authorizeRoles(['Super Admin', 'Manager']), (req, res) => {
  const categories = getCategories();
  const idx = categories.findIndex(c => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const updatedCategory = {
    ...categories[idx],
    ...req.body
  };
  categories[idx] = updatedCategory;
  saveCategories(categories);
  res.json({ message: 'Category updated.', category: updatedCategory });
});

router.delete('/admin/categories/:id', authenticateJWT, authorizeRoles(['Super Admin']), (req, res) => {
  const categories = getCategories();
  if (!categories.some(c => c.id === req.params.id)) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Deleting category moves all connected products to "General" category
  const filteredCats = categories.filter(c => c.id !== req.params.id);
  saveCategories(filteredCats);

  const products = getProducts();
  let movedCount = 0;
  const updatedProducts = products.map(prod => {
    if (prod.category.toLowerCase() === req.params.id.toLowerCase()) {
      movedCount++;
      return { ...prod, category: 'General' };
    }
    return prod;
  });

  if (movedCount > 0) {
    saveProducts(updatedProducts);
    // Ensure General category exists
    if (!filteredCats.some(c => c.id === 'General')) {
      filteredCats.push({
        id: 'General',
        name: 'General Cookings',
        description: 'Miscellaneous specialties',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
        count: movedCount,
        hidden: false
      });
      saveCategories(filteredCats);
    }
  }

  res.json({ message: `Category deleted. ${movedCount} products re-routed to General.` });
});


// -- Admin Orders & Tracking CRUD (STEP 7) --
router.get('/admin/orders', authenticateJWT, (req, res) => {
  res.json(getOrders());
});

router.put('/admin/orders/:id/status', authenticateJWT, (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  
  const orders = getOrders();
  const orderIdx = orders.findIndex(o => o.id === req.params.id);
  if (orderIdx === -1) return res.status(404).json({ error: 'Order not found' });

  orders[orderIdx].status = status;
  
  // If status marked delivered, ensure paid is matching full amount if COD
  if (status === 'Delivered') {
    orders[orderIdx].paidAmount = orders[orderIdx].amount;
    orders[orderIdx].pendingAmount = 0;
  }

  saveOrders(orders);
  res.json({ message: 'Order status updated successfully', order: orders[orderIdx] });
});

router.put('/admin/orders/:id/payment-status', authenticateJWT, (req, res) => {
  const { paymentStatus, paidAmount, pendingAmount } = req.body;
  if (!paymentStatus) return res.status(400).json({ error: 'paymentStatus is required' });

  const orders = getOrders();
  const orderIdx = orders.findIndex(o => o.id === req.params.id);
  if (orderIdx === -1) return res.status(404).json({ error: 'Order not found' });

  orders[orderIdx].paymentStatus = paymentStatus;
  if (paidAmount !== undefined) orders[orderIdx].paidAmount = Number(paidAmount);
  if (pendingAmount !== undefined) orders[orderIdx].pendingAmount = Number(pendingAmount);

  saveOrders(orders);
  res.json({ message: 'Payment status updated successfully', order: orders[orderIdx] });
});

router.put('/admin/orders/:id', authenticateJWT, (req, res) => {
  const orders = getOrders();
  const orderIdx = orders.findIndex(o => o.id === req.params.id);
  if (orderIdx === -1) return res.status(404).json({ error: 'Order not found' });

  const { customerName, customerPhone, customerAddress, customerEmail, items, amount, paidAmount, pendingAmount, status, paymentStatus, trackingNumber } = req.body;

  if (customerName !== undefined) orders[orderIdx].customerName = customerName;
  if (customerPhone !== undefined) orders[orderIdx].customerPhone = customerPhone;
  if (customerAddress !== undefined) orders[orderIdx].customerAddress = customerAddress;
  if (customerEmail !== undefined) orders[orderIdx].customerEmail = customerEmail;
  if (items !== undefined) orders[orderIdx].items = items;
  if (amount !== undefined) orders[orderIdx].amount = Number(amount);
  if (paidAmount !== undefined) orders[orderIdx].paidAmount = Number(paidAmount);
  if (pendingAmount !== undefined) orders[orderIdx].pendingAmount = Number(pendingAmount);
  if (status !== undefined) orders[orderIdx].status = status;
  if (paymentStatus !== undefined) orders[orderIdx].paymentStatus = paymentStatus;
  if (trackingNumber !== undefined) orders[orderIdx].trackingNumber = trackingNumber;

  saveOrders(orders);
  res.json({ message: 'Order updated successfully', order: orders[orderIdx] });
});

router.put('/admin/orders/:id/tracking', authenticateJWT, (req, res) => {
  const { trackingNumber } = req.body;
  const orders = getOrders();
  const orderIdx = orders.findIndex(o => o.id === req.params.id);
  if (orderIdx === -1) return res.status(404).json({ error: 'Order not found' });

  orders[orderIdx].trackingNumber = trackingNumber;
  saveOrders(orders);
  res.json({ message: 'Tracking details updated successfully', order: orders[orderIdx] });
});

router.delete('/admin/orders/:id', authenticateJWT, authorizeRoles(['Super Admin']), (req, res) => {
  const filtered = getOrders().filter(o => o.id !== req.params.id);
  saveOrders(filtered);
  res.json({ message: 'Order reference archived successfully.' });
});


// -- Customer Audit Trails (STEP 8) --
router.get('/admin/customers', authenticateJWT, (req, res) => {
  const orders = getOrders();
  // Extract unique customers based on telephone number
  const customersMap = new Map<string, any>();
  
  orders.forEach(o => {
    const phone = o.customerPhone;
    if (!customersMap.has(phone)) {
      customersMap.set(phone, {
        phone: o.customerPhone,
        name: o.customerName,
        email: o.customerEmail || 'No Email',
        address: o.customerAddress,
        totalOrders: 0,
        totalPurchasesAmount: 0,
        history: []
      });
    }
    const record = customersMap.get(phone);
    record.totalOrders += 1;
    record.totalPurchasesAmount += o.amount;
    record.history.push({
      orderId: o.id,
      amount: o.amount,
      status: o.status,
      date: o.createdAt
    });
  });

  res.json(Array.from(customersMap.values()));
});


// -- Payments Audit Modules (STEP 9) --
router.get('/admin/payments', authenticateJWT, (req, res) => {
  res.json(getPayments());
});


// -- Reviews Moderator Control (STEP 11) --
router.get('/admin/reviews', authenticateJWT, (req, res) => {
  res.json(getReviews());
});

router.put('/admin/reviews/:id/approve', authenticateJWT, (req, res) => {
  const { approved } = req.body;
  const reviews = getReviews();
  const rIdx = reviews.findIndex(r => r.id === Number(req.params.id));
  if (rIdx === -1) return res.status(404).json({ error: 'Review reference not found' });

  reviews[rIdx].approved = !!approved;
  saveReviews(reviews);
  res.json({ message: approved ? 'Review approved for listing' : 'Review suspended from listing', review: reviews[rIdx] });
});

router.delete('/admin/reviews/:id', authenticateJWT, authorizeRoles(['Super Admin']), (req, res) => {
  const filtered = getReviews().filter(r => r.id !== Number(req.params.id));
  saveReviews(filtered);
  res.json({ message: 'Review permanently deleted.' });
});


// -- Contact Messages Control (STEP 12) --
router.get('/admin/contact', authenticateJWT, (req, res) => {
  res.json(getContactMessages());
});

router.put('/admin/contact/:id/status', authenticateJWT, (req, res) => {
  const { status } = req.body;
  const messages = getContactMessages();
  const mIdx = messages.findIndex(m => m.id === Number(req.params.id));
  if (mIdx === -1) return res.status(404).json({ error: 'Inquiry response not found' });

  messages[mIdx].status = status;
  saveContactMessages(messages);
  res.json({ message: 'Inquiry progress updated', messageRecord: messages[mIdx] });
});

router.delete('/api/admin/contact/:id', authenticateJWT, authorizeRoles(['Super Admin']), (req, res) => {
  const filtered = getContactMessages().filter(m => m.id !== Number(req.params.id));
  saveContactMessages(filtered);
  res.json({ message: 'Inquiry message removed.' });
});


// -- Web configuration updates (STEP 14) --
router.post('/admin/settings', authenticateJWT, authorizeRoles(['Super Admin', 'Manager']), (req, res) => {
  const current = getWebsiteSettings();
  const updatedSettings = {
    ...current,
    ...req.body
  };
  saveWebsiteSettings(updatedSettings);
  res.json({ message: 'Website specifications updated successfully.', settings: updatedSettings });
});


// -- Banners & Coupons Admin --
router.get('/admin/banners', authenticateJWT, (req, res) => res.json(getBanners()));
router.post('/admin/banners', authenticateJWT, authorizeRoles(['Super Admin', 'Manager']), (req, res) => {
  const banners = getBanners();
  const nextId = banners.length > 0 ? Math.max(...banners.map(b => b.id)) + 1 : 1;
  const newBanner = { id: nextId, title: req.body.title, image: req.body.image, active: true };
  banners.push(newBanner);
  saveBanners(banners);
  res.status(201).json(newBanner);
});

router.put('/admin/banners/:id', authenticateJWT, (req, res) => {
  const banners = getBanners();
  const bIdx = banners.findIndex(b => b.id === Number(req.params.id));
  if (bIdx !== -1) {
    banners[bIdx] = { ...banners[bIdx], ...req.body };
    saveBanners(banners);
    return res.json(banners[bIdx]);
  }
  res.status(404).json({ error: 'Banner not found' });
});

router.get('/admin/coupons', authenticateJWT, (req, res) => res.json(getCoupons()));
router.post('/admin/coupons', authenticateJWT, authorizeRoles(['Super Admin', 'Manager']), (req, res) => {
  const coupons = getCoupons();
  const nextId = coupons.length > 0 ? Math.max(...coupons.map(c => c.id)) + 1 : 1;
  const newCoupon = { 
    id: nextId, 
    code: req.body.code.toUpperCase(), 
    discountType: req.body.discountType || 'Fixed', 
    value: Number(req.body.value), 
    minOrderAmount: Number(req.body.minOrderAmount || 0), 
    active: true 
  };
  coupons.push(newCoupon);
  saveCoupons(coupons);
  res.status(201).json(newCoupon);
});

router.put('/admin/coupons/:id', authenticateJWT, (req, res) => {
  const coupons = getCoupons();
  const cIdx = coupons.findIndex(c => c.id === Number(req.params.id));
  if (cIdx !== -1) {
    coupons[cIdx] = { ...coupons[cIdx], ...req.body };
    saveCoupons(coupons);
    return res.json(coupons[cIdx]);
  }
  res.status(404).json({ error: 'Coupon not found' });
});


// -- Real-time Analytics Calculations (STEP 13) --
router.get('/admin/analytics', authenticateJWT, (req, res) => {
  const products = getProducts();
  const orders = getOrders();
  const messages = getContactMessages();
  const reviews = getReviews();

  // A. Sales and order size metrics
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.amount, 0);

  const pendingRevenue = orders
    .filter(o => o.status !== 'Cancelled' && o.status !== 'Delivered')
    .reduce((sum, o) => sum + o.pendingAmount, 0);

  const itemsOnHandCount = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockThresholdCount = products.filter(p => p.stock < 15).length;

  // B. Construct orders timeline analytics (By Days/Months)
  const monthlyTimeline: { [key: string]: number } = {};
  orders.forEach(o => {
    // Expected date key: "Year-Month"
    const date = new Date(o.createdAt);
    const key = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear().toString().slice(-2);
    monthlyTimeline[key] = (monthlyTimeline[key] || 0) + o.amount;
  });

  const ordersOverTime = Object.keys(monthlyTimeline).map(month => ({
    period: month,
    revenue: monthlyTimeline[month]
  })).slice(-12);

  // C. Top Selling Products
  const salesMap = new Map<string, { name: string; qty: number; category: string; value: number }>();
  orders.forEach(o => {
    if (o.status === 'Cancelled') return;
    o.items.forEach(itm => {
      if (!salesMap.has(itm.productId)) {
        salesMap.set(itm.productId, {
          name: itm.productName,
          qty: 0,
          category: '',
          value: 0
        });
      }
      const pRecord = salesMap.get(itm.productId)!;
      pRecord.qty += itm.quantity;
      pRecord.value += (itm.quantity * itm.price);
    });
  });

  // Populate category info as helper
  salesMap.forEach((v, k) => {
    const parentProd = products.find(p => p.id === k);
    if (parentProd) {
      v.category = parentProd.category;
    }
  });

  const topSellingProducts = Array.from(salesMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // D. Category Distribution share
  const catDistribution: { [key: string]: number } = {};
  products.forEach(p => {
    catDistribution[p.category] = (catDistribution[p.category] || 0) + 1;
  });
  const categoryDistribution = Object.keys(catDistribution).map(catName => ({
    category: catName,
    count: catDistribution[catName]
  }));

  // E. Compile Recent Activity List
  const recentOrders = orders
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(o => ({
      id: o.id,
      customer: o.customerName,
      amount: o.amount,
      status: o.status,
      date: o.createdAt
    }));

  res.json({
    summary: {
      totalRevenue,
      pendingRevenue,
      totalOrdersCount: orders.length,
      itemCategoriesCount: getCategories().length,
      totalApprovedReviewsCount: reviews.filter(r => r.approved).length,
      pendingReviewsCount: reviews.filter(r => !r.approved).length,
      unreadInquiriesCount: messages.filter(m => m.status === 'New').length,
      itemsOnHandCount,
      lowStockThresholdCount
    },
    ordersOverTime,
    topSellingProducts,
    categoryDistribution,
    recentOrders
  });
});

export default router;
