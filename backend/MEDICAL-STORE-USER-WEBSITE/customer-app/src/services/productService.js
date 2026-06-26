import { isFirebaseConfigured, db } from './firebase';
import { collection, getDocs, doc, getDoc, query, where, setDoc } from 'firebase/firestore';

// 25+ realistic products matching the 10 medicine categories
const MOCK_PRODUCTS = [
  // 1. Tablets
  {
    productId: 'prod_tab_01',
    name: 'Paracetamol 650mg (Dolo)',
    brand: 'Micro Labs Ltd',
    manufacturer: 'Micro Labs',
    category: 'Tablets',
    price: 30,
    mrp: 35,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=60',
    description: 'Dolo 650 Tablet helps relieve pain and fever by blocking the release of certain chemical messengers responsible for fever and pain.',
    uses: 'Fever, Body ache, Mild to moderate pain relief',
    sideEffects: 'Nausea, Vomiting, Insomnia (rare), Skin rash (very rare)',
    dosageInformation: 'Take 1 tablet every 4-6 hours as directed by your physician. Max 4 tablets a day.',
    isPopular: true,
    isBestSeller: true,
    isNewArrival: false,
  },
  {
    productId: 'prod_tab_02',
    name: 'Atorvastatin 10mg (Lipitor)',
    brand: 'Pfizer Inc',
    manufacturer: 'Pfizer',
    category: 'Tablets',
    price: 180,
    mrp: 210,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=60',
    description: 'Atorvastatin belongs to a group of medicines called statins. It is used to lower cholesterol and to reduce the risk of heart disease.',
    uses: 'Hypercholesterolemia (High Cholesterol), prevention of cardiovascular disease',
    sideEffects: 'Headache, Muscle pain, Diarrhea, Joint pain',
    dosageInformation: 'Usually taken once daily at any time of day, with or without food. Follow doctor instructions.',
    isPopular: false,
    isBestSeller: true,
    isNewArrival: false,
  },
  {
    productId: 'prod_tab_03',
    name: 'Montelukast Sodium & Levocetirizine',
    brand: 'Mankind Pharma',
    manufacturer: 'Mankind',
    category: 'Tablets',
    price: 95,
    mrp: 120,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=60',
    description: 'Combines Montelukast (leukotriene receptor antagonist) and Levocetirizine (antihistamine) to relieve allergy symptoms.',
    uses: 'Allergic rhinitis, Sneezing, Runny nose, Hay fever',
    sideEffects: 'Dry mouth, Sleepiness, Fatigue, Headache',
    dosageInformation: 'Usually taken once daily in the evening, with or without food.',
    isPopular: true,
    isBestSeller: false,
    isNewArrival: true,
  },

  // 2. Capsules
  {
    productId: 'prod_cap_01',
    name: 'Omeprazole 20mg (Omez)',
    brand: 'Dr. Reddy\'s Laboratories',
    manufacturer: 'Dr. Reddy\'s',
    category: 'Capsules',
    price: 45,
    mrp: 55,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1626716493137-b67fe9501e76?w=600&auto=format&fit=crop&q=60',
    description: 'Omez Capsule is a medicine that reduces the amount of acid produced in your stomach. It is used to treat heartburn, acid reflux and peptic ulcer disease.',
    uses: 'Gastroesophageal Reflux Disease (GERD), Peptic Ulcer, Heartburn',
    sideEffects: 'Diarrhea, Stomach pain, Flatulence, Dry mouth',
    dosageInformation: 'Take 1 capsule daily in the morning, 30 minutes before breakfast.',
    isPopular: true,
    isBestSeller: true,
    isNewArrival: false,
  },
  {
    productId: 'prod_cap_02',
    name: 'Amoxicillin 500mg',
    brand: 'Abbott Healthcare',
    manufacturer: 'Abbott',
    category: 'Capsules',
    price: 72,
    mrp: 85,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&auto=format&fit=crop&q=60',
    description: 'Amoxicillin is a penicillin-type antibiotic used to treat a wide variety of bacterial infections.',
    uses: 'Ear, Nose, Throat infections, Urinary Tract Infections, Bronchitis',
    sideEffects: 'Nausea, Vomiting, Diarrhea, Skin rashes',
    dosageInformation: 'Finish the complete course of antibiotics as prescribed by your doctor. Typically 1 capsule 3 times a day.',
    isPopular: false,
    isBestSeller: false,
    isNewArrival: false,
  },

  // 3. Syrups
  {
    productId: 'prod_syr_01',
    name: 'Cofsil Dry Cough Syrup 100ml',
    brand: 'Cipla Ltd',
    manufacturer: 'Cipla',
    category: 'Syrups',
    price: 85,
    mrp: 105,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&auto=format&fit=crop&q=60',
    description: 'Cofsil Dry Cough Syrup relieves dry cough and throat irritation. It provides fast relief with its triple action formula.',
    uses: 'Dry Cough, Throat itching, Allergy-induced coughing',
    sideEffects: 'Drowsiness, Dizziness, Mild stomach upset',
    dosageInformation: 'Adults: 10ml, Children: 5ml, 3-4 times a day or as directed by the physician.',
    isPopular: true,
    isBestSeller: true,
    isNewArrival: false,
  },
  {
    productId: 'prod_syr_02',
    name: 'Digene Acidity & Gas Relief Gel 200ml',
    brand: 'Abbott India',
    manufacturer: 'Abbott',
    category: 'Syrups',
    price: 135,
    mrp: 150,
    stock: 110,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=60',
    description: 'Digene Gel provides quick relief from acidity, heartburn, and gas, thanks to its high ANC (Acid Neutralizing Capacity) formula.',
    uses: 'Acidity, Gas, Bloating, Heartburn',
    sideEffects: 'Constipation (if overused), Chalky taste',
    dosageInformation: 'Take 2-4 teaspoons (10-20ml) after meals and at bedtime, or as recommended.',
    isPopular: false,
    isBestSeller: true,
    isNewArrival: false,
  },

  // 4. Injection
  {
    productId: 'prod_inj_01',
    name: 'Insulin Glargine 100 IU/ml (Lantus)',
    brand: 'Sanofi India Ltd',
    manufacturer: 'Sanofi',
    category: 'Injection',
    price: 680,
    mrp: 750,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=60',
    description: 'Lantus is a long-acting insulin injection used to improve blood sugar control in adults and children with diabetes.',
    uses: 'Type 1 and Type 2 Diabetes Mellitus',
    sideEffects: 'Hypoglycemia (Low blood sugar), Injection site reactions, Lipodystrophy',
    dosageInformation: 'Inject subcutaneously once daily at the same time every day. Dose customized by endocrinologist.',
    isPopular: true,
    isBestSeller: false,
    isNewArrival: false,
  },

  // 5. Diabetes Care
  {
    productId: 'prod_dia_01',
    name: 'Accu-Chek Active Test Strips (50 count)',
    brand: 'Roche Diagnostics',
    manufacturer: 'Roche',
    category: 'Diabetes Care',
    price: 890,
    mrp: 999,
    stock: 75,
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=60',
    description: 'Accu-Chek Active strips help monitor blood sugar levels easily and accurately at home.',
    uses: 'Blood glucose level monitoring',
    sideEffects: 'None',
    dosageInformation: 'For single use on Accu-Chek Active meter only. Store in dry, cool place.',
    isPopular: true,
    isBestSeller: true,
    isNewArrival: false,
  },
  {
    productId: 'prod_dia_02',
    name: 'Metformin SR 500mg (Glycomet)',
    brand: 'USV Private Ltd',
    manufacturer: 'USV',
    category: 'Diabetes Care',
    price: 25,
    mrp: 30,
    stock: 300,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=60',
    description: 'Glycomet 500 SR Tablet is an oral anti-diabetic medicine that helps control blood sugar levels.',
    uses: 'Type 2 Diabetes Mellitus',
    sideEffects: 'Nausea, Stomach pain, Metallic taste, Diarrhea',
    dosageInformation: 'Take with food to minimize stomach side effects. Usually taken with evening meal.',
    isPopular: false,
    isBestSeller: true,
    isNewArrival: false,
  },

  // 6. Baby Care
  {
    productId: 'prod_bab_01',
    name: 'Himalaya Baby Massage Oil 200ml',
    brand: 'Himalaya Wellness',
    manufacturer: 'Himalaya',
    category: 'Baby Care',
    price: 155,
    mrp: 180,
    stock: 95,
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&auto=format&fit=crop&q=60',
    description: 'Infused with Olive oil and Winter cherry, this baby massage oil nourishes and softens baby\'s delicate skin.',
    uses: 'Baby skin moisturization and massage',
    sideEffects: 'None (Hypoallergenic)',
    dosageInformation: 'Apply gently over baby\'s body before or after bath.',
    isPopular: true,
    isBestSeller: false,
    isNewArrival: true,
  },
  {
    productId: 'prod_bab_02',
    name: 'Sebamed Baby Rash Cream 100ml',
    brand: 'Sebapharma',
    manufacturer: 'Sebamed',
    category: 'Baby Care',
    price: 520,
    mrp: 590,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&auto=format&fit=crop&q=60',
    description: 'Provides rapid relief from diaper rash. Formula with pH 5.5 promotes development of the skin acid mantle.',
    uses: 'Diaper rash relief, skin irritation prevention',
    sideEffects: 'None',
    dosageInformation: 'Apply cream to baby\'s diaper area at each diaper change.',
    isPopular: false,
    isBestSeller: true,
    isNewArrival: false,
  },

  // 7. Skin Care
  {
    productId: 'prod_skn_01',
    name: 'Cetaphil Gentle Skin Cleanser 250ml',
    brand: 'Galderma Laboratories',
    manufacturer: 'Galderma',
    category: 'Skin Care',
    price: 345,
    mrp: 395,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=60',
    description: 'A mild, soap-free formula that cleanses without irritation. Clinically proven to hydrate skin while cleansing.',
    uses: 'Daily face and body cleanser for sensitive/dry skin',
    sideEffects: 'None reported',
    dosageInformation: 'Apply to skin, rub gently and rinse with water. Can also be used without water.',
    isPopular: true,
    isBestSeller: true,
    isNewArrival: false,
  },
  {
    productId: 'prod_skn_02',
    name: 'Sunscreens Gel SPF 50+ (La Shield)',
    brand: 'Glenmark Pharmaceuticals',
    manufacturer: 'Glenmark',
    category: 'Skin Care',
    price: 640,
    mrp: 750,
    stock: 65,
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&auto=format&fit=crop&q=60',
    description: 'La Shield Sunscreen Gel SPF 50+ provides broad-spectrum protection against UVA and UVB rays. Matte finish and water-resistant.',
    uses: 'Sun protection, prevention of sunburn and aging',
    sideEffects: 'Mild irritation in highly sensitive skin (rare)',
    dosageInformation: 'Apply liberally on face, neck, and exposed skin 20 minutes before sun exposure.',
    isPopular: false,
    isBestSeller: false,
    isNewArrival: true,
  },

  // 8. Personal Care
  {
    productId: 'prod_per_01',
    name: 'Sensodyne Fresh Mint Toothpaste 150g',
    brand: 'GSK Consumer Healthcare',
    manufacturer: 'GSK',
    category: 'Personal Care',
    price: 185,
    mrp: 200,
    stock: 160,
    image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&auto=format&fit=crop&q=60',
    description: 'Sensodyne Fresh Mint builds round-the-clock sensitivity protection and provides minty freshness.',
    uses: 'Sensitive teeth protection, oral cavity cleanliness',
    sideEffects: 'None',
    dosageInformation: 'Brush twice daily, not more than 3 times, minimize swallowing.',
    isPopular: true,
    isBestSeller: true,
    isNewArrival: false,
  },
  {
    productId: 'prod_per_02',
    name: 'Dettol Liquid Handwash Refill 1.5L',
    brand: 'Reckitt Benckiser',
    manufacturer: 'Reckitt',
    category: 'Personal Care',
    price: 245,
    mrp: 299,
    stock: 220,
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=60',
    description: 'Dettol handwash protects from 100 illness-causing germs. pH-balanced formula with trusted protection.',
    uses: 'Hand hygiene, antibacterial protection',
    sideEffects: 'None',
    dosageInformation: 'Press pump, lather hands thoroughly for 20 seconds, rinse with water.',
    isPopular: false,
    isBestSeller: true,
    isNewArrival: false,
  },

  // 9. Vitamins
  {
    productId: 'prod_vit_01',
    name: 'Neurobion Forte B-Complex (30 Tabs)',
    brand: 'Procter & Gamble Health',
    manufacturer: 'P&G',
    category: 'Vitamins',
    price: 38,
    mrp: 42,
    stock: 450,
    image: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf4?w=600&auto=format&fit=crop&q=60',
    description: 'Vitamin B Complex supplement that helps support nervous system health and cell metabolism.',
    uses: 'Vitamin B deficiency, neuropathy, immunity support',
    sideEffects: 'None under normal dosage',
    dosageInformation: 'Take 1 tablet daily or as recommended by doctor.',
    isPopular: true,
    isBestSeller: true,
    isNewArrival: false,
  },
  {
    productId: 'prod_vit_02',
    name: 'Limcee Vitamin C 500mg Chewable (15 Tabs)',
    brand: 'Abbott Healthcare',
    manufacturer: 'Abbott',
    category: 'Vitamins',
    price: 22,
    mrp: 26,
    stock: 500,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=60',
    description: 'Orange flavored chewable Vitamin C tablets to boost daily immunity and skin health.',
    uses: 'Vitamin C deficiency, immunity boost, tissue repair',
    sideEffects: 'Mild stomach irritation if consumed in excess',
    dosageInformation: 'Chew 1 tablet daily or as advised.',
    isPopular: true,
    isBestSeller: true,
    isNewArrival: false,
  },
  {
    productId: 'prod_vit_03',
    name: 'Calcimax 500 Calcium & Vitamin D3',
    brand: 'Meyer Organics',
    manufacturer: 'Meyer',
    category: 'Vitamins',
    price: 145,
    mrp: 175,
    stock: 180,
    image: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf4?w=600&auto=format&fit=crop&q=60',
    description: 'Provides optimal calcium absorption with Vitamin D3, essential for bone density and strength.',
    uses: 'Calcium supplement for bone health, osteoporosis',
    sideEffects: 'Constipation (rare)',
    dosageInformation: 'Take 1 tablet daily after a meal.',
    isPopular: false,
    isBestSeller: false,
    isNewArrival: true,
  },

  // 10. Healthcare Devices
  {
    productId: 'prod_dev_01',
    name: 'Omron HEM 7120 Blood Pressure Monitor',
    brand: 'Omron Healthcare',
    manufacturer: 'Omron',
    category: 'Healthcare Devices',
    price: 1890,
    mrp: 2440,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=60',
    description: 'Compact, fully automatic blood pressure monitor operating on the oscillometric principle for precise readings.',
    uses: 'Blood pressure and pulse rate monitoring',
    sideEffects: 'None',
    dosageInformation: 'Wrap cuff around upper arm at heart level, press start. Rest 5 minutes before reading.',
    isPopular: true,
    isBestSeller: true,
    isNewArrival: false,
  },
  {
    productId: 'prod_dev_02',
    name: 'Dr Trust Pulse Oximeter 209',
    brand: 'Dr Trust',
    manufacturer: 'Dr Trust',
    category: 'Healthcare Devices',
    price: 990,
    mrp: 1499,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=60',
    description: 'Measures SpO2 (Oxygen Saturation level) and pulse rate quickly and accurately with multi-directional display.',
    uses: 'Blood oxygen saturation and heart rate monitoring',
    sideEffects: 'None',
    dosageInformation: 'Clip onto finger tip, press button, wait 5 seconds for readings.',
    isPopular: false,
    isBestSeller: false,
    isNewArrival: true,
  }
];

// Initialize localStorage with mock products if not present
const initMockDatabase = () => {
  if (!localStorage.getItem('medstore_mock_products')) {
    localStorage.setItem('medstore_mock_products', JSON.stringify(MOCK_PRODUCTS));
  }
};
initMockDatabase();

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  getProducts: async ({ category, searchQuery, priceRange, sortBy, page = 1, limit = 8 }) => {
    await delay(400);
    
    let productsList = [];
    
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        querySnapshot.forEach((doc) => {
          productsList.push({ productId: doc.id, ...doc.data() });
        });
        
        // If live db is empty, return mock products as placeholder or auto-seed
        if (productsList.length === 0) {
          console.warn('Firestore products collection is empty. Showing seed data.');
          productsList = [...MOCK_PRODUCTS];
        }
      } catch (err) {
        console.error('Error fetching Firestore products:', err);
        productsList = [...MOCK_PRODUCTS];
      }
    } else {
      productsList = JSON.parse(localStorage.getItem('medstore_mock_products') || '[]');
    }

    // Apply filtering
    if (category && category !== 'All') {
      productsList = productsList.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      productsList = productsList.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (priceRange) {
      const [min, max] = priceRange;
      productsList = productsList.filter(p => p.price >= min && p.price <= max);
    }

    // Apply sorting
    if (sortBy) {
      if (sortBy === 'price-low-high') {
        productsList.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high-low') {
        productsList.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'popularity') {
        productsList.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
      }
    }

    // Pagination
    const totalCount = productsList.length;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;
    const paginatedProducts = productsList.slice(offset, offset + limit);

    return {
      products: paginatedProducts,
      totalPages,
      totalCount
    };
  },

  getProductById: async (productId) => {
    await delay(300);
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { productId: docSnap.id, ...docSnap.data() };
        }
      } catch (error) {
        console.error('Error fetching product from firestore:', error);
      }
    }
    
    // Local / Fallback lookup
    const products = JSON.parse(localStorage.getItem('medstore_mock_products') || '[]');
    const found = products.find(p => p.productId === productId);
    if (!found) throw new Error('Product not found');
    return found;
  },

  getSimilarProducts: async (productId, category) => {
    await delay(300);
    let allProducts = [];
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        querySnapshot.forEach((doc) => {
          allProducts.push({ productId: doc.id, ...doc.data() });
        });
      } catch (e) {
        allProducts = [...MOCK_PRODUCTS];
      }
    } else {
      allProducts = JSON.parse(localStorage.getItem('medstore_mock_products') || '[]');
    }
    
    // Filter by same category and exclude current product
    return allProducts
      .filter(p => p.category.toLowerCase() === category.toLowerCase() && p.productId !== productId)
      .slice(0, 4);
  },

  getRelatedMedicines: async (productId, brand) => {
    await delay(300);
    let allProducts = [];
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        querySnapshot.forEach((doc) => {
          allProducts.push({ productId: doc.id, ...doc.data() });
        });
      } catch (e) {
        allProducts = [...MOCK_PRODUCTS];
      }
    } else {
      allProducts = JSON.parse(localStorage.getItem('medstore_mock_products') || '[]');
    }

    // Match same brand or similar category
    return allProducts
      .filter(p => (p.brand.toLowerCase() === brand.toLowerCase() || p.productId !== productId))
      .slice(0, 4);
  },

  getFeaturedSections: async () => {
    await delay(400);
    let allProducts = [];
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        querySnapshot.forEach((doc) => {
          allProducts.push({ productId: doc.id, ...doc.data() });
        });
      } catch (e) {
        allProducts = [...MOCK_PRODUCTS];
      }
    } else {
      allProducts = JSON.parse(localStorage.getItem('medstore_mock_products') || '[]');
    }

    if (allProducts.length === 0) {
      allProducts = [...MOCK_PRODUCTS];
    }

    return {
      popular: allProducts.filter(p => p.isPopular).slice(0, 6),
      bestSellers: allProducts.filter(p => p.isBestSeller).slice(0, 6),
      newArrivals: allProducts.filter(p => p.isNewArrival || p.productId.includes('new')).slice(0, 6),
      healthEssentials: allProducts.filter(p => p.category === 'Vitamins' || p.category === 'Diabetes Care').slice(0, 6),
      featured: allProducts.slice(0, 6),
    };
  },

  // Developer utility to seed mock data to Firestore if Firebase gets configured
  seedProductsToFirestore: async () => {
    if (!isFirebaseConfigured) {
      console.warn('Cannot seed: Firebase is not configured.');
      return false;
    }
    try {
      console.log('Seeding Firestore products collection...');
      for (const prod of MOCK_PRODUCTS) {
        const { productId, ...fields } = prod;
        await setDoc(doc(db, 'products', productId), fields);
      }
      console.log('Seeding completed successfully!');
      return true;
    } catch (e) {
      console.error('Seeding products failed:', e);
      throw e;
    }
  }
};
