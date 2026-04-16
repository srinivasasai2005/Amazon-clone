import { query, initSchema } from './database.js';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('⏳ Starting massive database seed process...');
  
  await initSchema();

  await query('DELETE FROM wishlist_items');
  await query('DELETE FROM order_items');
  await query('DELETE FROM orders');
  await query('DELETE FROM cart_items');
  await query('DELETE FROM products');
  await query('DELETE FROM categories');
  await query('DELETE FROM users');

  const sequences = ['users_id_seq', 'categories_id_seq', 'products_id_seq', 'cart_items_id_seq', 'order_items_id_seq', 'wishlist_items_id_seq'];
  for (const seq of sequences) {
    try { await query(`ALTER SEQUENCE ${seq} RESTART WITH 1`); } catch (err) {}
  }

  const hashedPass = await bcrypt.hash('password123', 10);
  await query(`
    INSERT INTO users (id, name, email, password_hash, address, avatar_url) 
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [
    1, 'John Doe', 'john.doe@amazon.in', hashedPass,
    '123 Main Street, Indiranagar, Bangalore, Karnataka 560038',
    'https://ui-avatars.com/api/?name=John+Doe&background=FF9900&color=fff&size=64'
  ]);
  await query(`SELECT setval('users_id_seq', 1)`);

  const catData = [
    { name:'Electronics',           slug:'electronics',  image_url:'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=75' },
    { name:'Books',                  slug:'books',        image_url:'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=75' },
    { name:'Clothing & Apparel',     slug:'clothing',     image_url:'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=75' },
    { name:'Home & Kitchen',         slug:'home-kitchen', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=75' },
    { name:'Sports & Outdoors',      slug:'sports',       image_url:'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&q=75' },
    { name:'Beauty & Personal Care', slug:'beauty',       image_url:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=75' },
    { name:'Toys & Games',           slug:'toys-games',   image_url:'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=75' },
    { name:'Grocery Essentials',     slug:'grocery',      image_url:'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=75' },
    { name:'Office Supplies',        slug:'office-supplies', image_url:'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&q=75' },
    { name:'Pet Supplies',           slug:'pet-supplies', image_url:'https://images.unsplash.com/photo-1583512603806-077998240c7a?w=500&q=75' }
  ];

  const catIds = {};
  for (const c of catData) {
    const res = await query(
      'INSERT INTO categories (name, slug, image_url) VALUES ($1, $2, $3) RETURNING id',
      [c.name, c.slug, c.image_url]
    );
    catIds[c.slug] = res.rows[0].id;
  }

  async function p(obj) {
    await query(`
      INSERT INTO products (category_id, name, description, price, stock_qty, rating, review_count, thumbnail, images, specs, is_prime)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      obj.category_id, obj.name, obj.description, obj.price, obj.stock_qty,
      obj.rating, obj.review_count, obj.thumbnail,
      JSON.stringify(obj.images), JSON.stringify(obj.specs), obj.is_prime ?? true
    ]);
  }

  const productsToSeed = [
    // Electronics
    { cat: 'electronics', name: 'Apple 2023 MacBook Pro (14-inch, M3, 8GB RAM, 512GB)', price: 169900, rating: 4.8, reviews: 3102, thumb: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', desc: 'The most advanced Mac ever.', specs: { RAM:'8GB', Storage:'512GB SSD' } },
    { cat: 'electronics', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', price: 29990, rating: 4.7, reviews: 15400, thumb: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb', desc: 'Industry leading noise cancellation, optimized for Alexa and Google Assistant.', specs: { Battery:'30 hrs', Weight:'250g' } },
    { cat: 'electronics', name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB, 256GB)', price: 129999, rating: 4.6, reviews: 6200, thumb: 'https://images.unsplash.com/photo-1621330396167-a414fba022fc', desc: 'Galaxy AI is here.', specs: { RAM:'12GB', Storage:'256GB' } },
    { cat: 'electronics', name: 'LG 139 cm (55 inches) 4K Ultra HD Smart LED TV', price: 42990, rating: 4.3, reviews: 21900, thumb: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1', desc: 'Stunning 4K display. Refresh Rate: 60 Hertz', specs: { Size:'55 in', Resolution:'4K' } },
    { cat: 'electronics', name: 'Apple iPad Air (5th Generation): with M1 chip', price: 59900, rating: 4.8, reviews: 9340, thumb: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0', desc: 'Supercharged by the Apple M1 chip.', specs: { Size:'10.9 in', Storage:'64GB' } },
    { cat: 'electronics', name: 'Logitech MX Master 3S Wireless Mouse', price: 9495, rating: 4.7, reviews: 3200, thumb: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c399c', desc: 'An iconic mouse remastered for ultimate tactility.', specs: { DPI:'8000', Connection:'Bluetooth' } },
    { cat: 'electronics', name: 'SanDisk 1TB Extreme Portable SSD', price: 8499, rating: 4.5, reviews: 45000, thumb: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58', desc: 'Fast, tough SSD you can take anywhere.', specs: { Capacity:'1TB', Speed:'1050MB/s' } },
    { cat: 'electronics', name: 'Keychron K2 Wireless Mechanical Keyboard', price: 7999, rating: 4.6, reviews: 11200, thumb: 'https://images.unsplash.com/photo-1595225476474-87563907a212', desc: 'A compact 84-key mechanical keyboard.', specs: { Switches:'Gateron Brown', Battery:'4000mAh' } },
    
    // Books
    { cat: 'books', name: 'Atomic Habits by James Clear', price: 499, rating: 4.8, reviews: 153200, thumb: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73', desc: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.', specs: { Author:'James Clear', Pages:'320' } },
    { cat: 'books', name: 'The Psychology of Money', price: 299, rating: 4.7, reviews: 85000, thumb: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', desc: 'Timeless lessons on wealth, greed, and happiness.', specs: { Author:'Morgan Housel', Pages:'252' } },
    { cat: 'books', name: 'Dune (Penguin Galaxy)', price: 699, rating: 4.6, reviews: 45000, thumb: 'https://images.unsplash.com/photo-1614947950-ab1234123412', desc: 'A triumph of the imagination.', specs: { Author:'Frank Herbert', Genre:'Sci-Fi' } },
    { cat: 'books', name: 'Deep Work', price: 350, rating: 4.6, reviews: 23100, thumb: 'https://images.unsplash.com/photo-1512820790803-83ca734da794', desc: 'Rules for Focused Success in a Distracted World.', specs: { Author:'Cal Newport' } },
    { cat: 'books', name: 'Sapiens: A Brief History of Humankind', price: 450, rating: 4.7, reviews: 78000, thumb: 'https://images.unsplash.com/photo-1629196914532-615f21226ba3', desc: 'Explore the fascinating history of our species.', specs: { Author:'Yuval Noah Harari' } },
    { cat: 'books', name: 'Project Hail Mary', price: 599, rating: 4.8, reviews: 41000, thumb: 'https://images.unsplash.com/photo-1589998059171-988d887df646', desc: 'A lone astronaut must save the earth from disaster.', specs: { Author:'Andy Weir' } },
    { cat: 'books', name: 'Clean Code', price: 899, rating: 4.7, reviews: 11000, thumb: 'https://images.unsplash.com/photo-1532012197267-da84d127e765', desc: 'A Handbook of Agile Software Craftsmanship.', specs: { Author:'Robert C. Martin' } },
    
    // Clothing
    { cat: 'clothing', name: "Levi's Men's 511 Slim Fit Jeans", price: 2599, rating: 4.3, reviews: 12000, thumb: 'https://images.unsplash.com/photo-1542272604-787c3835535d', desc: 'A modern slim with room to move.', specs: { Material:'99% Cotton, 1% Elastane', Fit:'Slim' } },
    { cat: 'clothing', name: "PUMA Men's T-Shirt", price: 899, rating: 4.1, reviews: 3400, thumb: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', desc: 'Classic comfort for everyday wear.', specs: { Material:'Cotton', Care:'Machine Wash' } },
    { cat: 'clothing', name: 'Nike Revolution 6 Running Shoes', price: 3495, rating: 4.4, reviews: 29000, thumb: 'https://images.unsplash.com/photo-1542291026-7eec264ea519', desc: 'Intuitive comfort with flexible cushioning.', specs: { Sole:'Rubber', Closure:'Lace-up' } },
    { cat: 'clothing', name: "Allen Solly Men's Polo", price: 799, rating: 4.2, reviews: 18000, thumb: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820', desc: 'Solid polo neck t-shirt.', specs: { Fit:'Regular', Sleeve:'Short' } },
    { cat: 'clothing', name: "Biba Women's Cotton Salwar Suit", price: 1899, rating: 4.1, reviews: 5600, thumb: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c', desc: 'Elegant and comfortable ethnic wear.', specs: { Material:'Cotton', Style:'Straight' } },
    { cat: 'clothing', name: 'Ray-Ban Aviator Sunglasses', price: 6590, rating: 4.6, reviews: 7500, thumb: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083', desc: 'Currently one of the most iconic sunglass models in the world.', specs: { Frame:'Metal', Lens:'Non-Polarized' } },
    { cat: 'clothing', name: "US Polo Assn Men's Sneaker", price: 2199, rating: 4.0, reviews: 2100, thumb: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77', desc: 'Stylish casual sneakers.', specs: { Outer:'Synthetic', Heel:'Flat' } },
    
    // Home & Kitchen
    { cat: 'home-kitchen', name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker', price: 7999, rating: 4.7, reviews: 65000, thumb: 'https://images.unsplash.com/photo-1584286595398-a59f21d0dc56', desc: 'Your new best friend in the kitchen.', specs: { Capacity:'6 Quart', Wattage:'1000W' } },
    { cat: 'home-kitchen', name: 'Philips Digital Air Fryer HD9252/90', price: 9999, rating: 4.5, reviews: 14000, thumb: 'https://images.unsplash.com/photo-1628840042765-356cda07504e', desc: 'Healthy frying with Rapid Air technology.', specs: { Capacity:'4.1L', Wattage:'1400W' } },
    { cat: 'home-kitchen', name: 'Pigeon Polypropylene Mini Chopper', price: 299, rating: 4.3, reviews: 185000, thumb: 'https://images.unsplash.com/photo-1596755455948-43d99d14f4fb', desc: 'Effortlessly chops fruits and vegetables.', specs: { Material:'Plastic', Blades:'3 Stainless Steel' } },
    { cat: 'home-kitchen', name: 'Dyson V11 Absolute Pro Cord-Free Vacuum', price: 54900, rating: 4.6, reviews: 2300, thumb: 'https://images.unsplash.com/photo-1558317374-067fb5f30001', desc: 'Intelligently optimizes suction and run time.', specs: { Weight:'2.97kg', RunTime:'Up to 60 Mins' } },
    { cat: 'home-kitchen', name: 'Wakefit Orthopedic Memory Foam Mattress', price: 12499, rating: 4.5, reviews: 45000, thumb: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304', desc: 'High quality memory foam for excellent support.', specs: { Size:'Queen', Thickness:'8 Inches' } },
    { cat: 'home-kitchen', name: 'Amazon Basics Pre-Seasoned Cast Iron Skillet', price: 1199, rating: 4.4, reviews: 12000, thumb: 'https://images.unsplash.com/photo-1585868615965-0fc9b04928db', desc: 'Heavy-duty 12-inch cast-iron skillet.', specs: { Material:'Cast Iron', Diameter:'12 inch' } },
    { cat: 'home-kitchen', name: 'Eureka Forbes Aquaguard Water Purifier', price: 14999, rating: 4.1, reviews: 8000, thumb: 'https://images.unsplash.com/photo-1601002360567-ec6b50937a07', desc: 'RO+UV+MTDS technology for safe water.', specs: { Capacity:'7 Liters', Type:'Wall Mount' } },

    // Sports
    { cat: 'sports', name: 'Nivia Storm Football', price: 450, rating: 4.2, reviews: 31000, thumb: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab', desc: 'Rubber outer material football for hard ground.', specs: { Size:'5', Material:'Rubber' } },
    { cat: 'sports', name: 'Boldfit Yoga Mat for Men and Women', price: 399, rating: 4.3, reviews: 24000, thumb: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5', desc: 'Anti slip, thick yoga mat with carry strap.', specs: { Thickness:'6mm', Material:'EVA' } },
    { cat: 'sports', name: 'Yonex Mavis 350 Nylon Shuttlecocks', price: 1299, rating: 4.6, reviews: 45000, thumb: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea', desc: 'Precision designed nylon shuttlecocks.', specs: { Quantity:'6', Speed:'Slow/Medium' } },
    { cat: 'sports', name: 'Kore PVC 10Kg Home Gym Set', price: 1199, rating: 3.9, reviews: 12000, thumb: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61', desc: 'Perfect equipment for home workouts.', specs: { Weight:'10kg Component', Material:'PVC' } },
    { cat: 'sports', name: 'Cockatoo Motorized Treadmill', price: 18990, rating: 4.1, reviews: 3200, thumb: 'https://images.unsplash.com/photo-1576678927484-cc907957088c', desc: 'Space saving foldable running machine.', specs: { Motor:'2 HP', MaxUserWeight:'90 Kg' } },
    { cat: 'sports', name: 'Strauss Adjustable Hand Grip Strengthener', price: 199, rating: 4.3, reviews: 15400, thumb: 'https://images.unsplash.com/photo-1576615278693-f8e095e37e01', desc: 'Build hand strength and endurance.', specs: { Resistance:'10-40 Kg' } },

    // Beauty
    { cat: 'beauty', name: "L'Oreal Paris Revitalift Hyaluronic Acid Serum", price: 899, rating: 4.3, reviews: 25000, thumb: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', desc: 'Intensely hydrates and plumps skin.', specs: { Volume:'30ml', Ingredient:'Hyaluronic Acid' } },
    { cat: 'beauty', name: 'Maybelline New York Fit Me Matte Poreless Liquid Foundation', price: 499, rating: 4.4, reviews: 68000, thumb: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a', desc: 'Matches natural tone, blends seamlessly.', specs: { Shade:'128 Warm Nude', Type:'Liquid' } },
    { cat: 'beauty', name: 'CeraVe Moisturizing Cream', price: 1650, rating: 4.7, reviews: 110000, thumb: 'https://images.unsplash.com/photo-1611077543887-b6fcf0113dd8', desc: 'Developed with dermatologists. For normal to dry skin.', specs: { Volume:'16 oz', Features:'Ceramides' } },
    { cat: 'beauty', name: 'Neutrogena Ultra Sheer Dry Touch Sunblock SPF 50', price: 675, rating: 4.2, reviews: 45000, thumb: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571', desc: 'Broad spectrum UVA/UVB protection.', specs: { SPF:'50+', Volume:'88ml' } },
    { cat: 'beauty', name: 'Philips Essential Care Hair Dryer', price: 950, rating: 4.3, reviews: 31000, thumb: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702', desc: 'Compact design for easy handling.', specs: { Wattage:'1200W', Settings:'2 Speed' } },
    { cat: 'beauty', name: 'Minimalist 10% Niacinamide Face Serum', price: 599, rating: 4.4, reviews: 29000, thumb: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b', desc: 'Clarifying serum for blemishes and acne marks.', specs: { Volume:'30ml', Active:'Niacinamide' } },

    // Toys & Games
    { cat: 'toys-games', name: 'LEGO Classic Medium Creative Brick Box', price: 2999, rating: 4.8, reviews: 32000, thumb: 'https://images.unsplash.com/photo-1585366115515-e64e1c251421', desc: 'Build your own vehicles and much more.', specs: { Pieces:'484', Age:'4+' } },
    { cat: 'toys-games', name: 'Mattel Uno Playing Card Game', price: 149, rating: 4.7, reviews: 154000, thumb: 'https://images.unsplash.com/photo-1606167668511-b1e4277b06b9', desc: 'The classic card game of matching colors and numbers.', specs: { Players:'2-10', Age:'7+' } },
    { cat: 'toys-games', name: 'Hasbro Monopoly Classic Board Game', price: 999, rating: 4.6, reviews: 21000, thumb: 'https://images.unsplash.com/photo-1610890716175-3ad06bf181bb', desc: 'Fast-dealing property trading game.', specs: { Players:'2-6', Age:'8+' } },
    { cat: 'toys-games', name: 'Hot Wheels 5-Car Pack', price: 699, rating: 4.7, reviews: 48000, thumb: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f', desc: '1:64 scale die-cast vehicles.', specs: { Scale:'1:64', Brand:'Hot Wheels' } },
    { cat: 'toys-games', name: 'Rubiks 3x3 Cube', price: 349, rating: 4.4, reviews: 18000, thumb: 'https://images.unsplash.com/photo-1591991731833-b4807cf7ef94', desc: 'The original 3x3 Rubiks cube.', specs: { Type:'Puzzle', Dimensions:'3x3' } },
    { cat: 'toys-games', name: 'Nerf N-Strike Elite Disruptor', price: 1199, rating: 4.5, reviews: 16000, thumb: 'https://images.unsplash.com/photo-1614315264359-ac2ec757a3e7', desc: 'Quick-draw blaster with a rotating drum.', specs: { Capacity:'6 Darts', Range:'90ft' } },

    // Grocery Essentials
    { cat: 'grocery', name: 'Aashirvaad Atta 10kg Family Pack', price: 499, rating: 4.5, reviews: 52000, thumb: 'https://images.unsplash.com/photo-1586201375761-83865001e31c', desc: 'Whole wheat flour for daily cooking.', specs: { Weight:'10kg', Type:'Whole Wheat' } },
    { cat: 'grocery', name: 'Fortune Sunlite Refined Sunflower Oil 5L', price: 799, rating: 4.4, reviews: 33000, thumb: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5', desc: 'Light and healthy refined cooking oil.', specs: { Volume:'5L', Type:'Sunflower' } },
    { cat: 'grocery', name: 'Tata Salt Iodized 1kg', price: 28, rating: 4.8, reviews: 91000, thumb: 'https://images.unsplash.com/photo-1514996937319-344454492b37', desc: 'Vacuum evaporated iodized salt.', specs: { Weight:'1kg', Iodized:'Yes' } },
    { cat: 'grocery', name: 'Nescafe Classic Coffee 200g', price: 349, rating: 4.6, reviews: 47000, thumb: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', desc: 'Rich and bold instant coffee blend.', specs: { Weight:'200g', Type:'Instant Coffee' } },

    // Office Supplies
    { cat: 'office-supplies', name: 'Classmate Spiral Notebook Pack of 6', price: 399, rating: 4.5, reviews: 25000, thumb: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6', desc: 'Premium quality ruled notebooks for students and office use.', specs: { Quantity:'6', Pages:'180 each' } },
    { cat: 'office-supplies', name: 'HP 680 Black Ink Cartridge', price: 999, rating: 4.3, reviews: 14000, thumb: 'https://images.unsplash.com/photo-1611262588019-db6cc2032da3', desc: 'Original HP cartridge for sharp prints.', specs: { Color:'Black', Yield:'480 pages' } },
    { cat: 'office-supplies', name: 'Cello Signature Gel Pen Set (Pack of 20)', price: 220, rating: 4.4, reviews: 19000, thumb: 'https://images.unsplash.com/photo-1583484963886-cfe2bff2945f', desc: 'Smooth writing gel pens in assorted colors.', specs: { Quantity:'20', Ink:'Gel' } },
    { cat: 'office-supplies', name: 'Portronics Adjustable Laptop Stand', price: 1499, rating: 4.2, reviews: 9700, thumb: 'https://images.unsplash.com/photo-1484788984921-03950022c9ef', desc: 'Ergonomic stand for desks and WFH setup.', specs: { Material:'Aluminium', Adjustable:'Yes' } },

    // Pet Supplies
    { cat: 'pet-supplies', name: 'Pedigree Adult Dry Dog Food 3kg', price: 699, rating: 4.5, reviews: 27000, thumb: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119', desc: 'Complete and balanced nutrition for adult dogs.', specs: { Weight:'3kg', Breed:'All' } },
    { cat: 'pet-supplies', name: 'Whiskas Ocean Fish Adult Cat Food 1.2kg', price: 460, rating: 4.6, reviews: 22000, thumb: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba', desc: 'Tasty and nutritious food for adult cats.', specs: { Weight:'1.2kg', Flavor:'Ocean Fish' } },
    { cat: 'pet-supplies', name: 'Pet Grooming Brush for Dogs and Cats', price: 299, rating: 4.3, reviews: 8100, thumb: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b', desc: 'Removes loose fur and keeps coat healthy.', specs: { Type:'Deshedding Brush', Use:'Dogs/Cats' } },
    { cat: 'pet-supplies', name: 'Adjustable Pet Harness with Leash', price: 549, rating: 4.2, reviews: 6400, thumb: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1', desc: 'Comfortable harness with durable leash for daily walks.', specs: { Size:'M', Material:'Nylon' } },
  ];

  const fallbackMap = {
    'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
    'books': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d',
    'clothing': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
    'home-kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
    'sports': 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
    'beauty': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b',
    'toys-games': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1',
    'grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e',
    'office-supplies': 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
    'pet-supplies': 'https://images.unsplash.com/photo-1583512603806-077998240c7a'
  };

  for (const item of productsToSeed) {
    const validThumb = fallbackMap[item.cat] || item.thumb;
    const images = [
      validThumb + '?w=600&q=80',
      validThumb + '?w=800&q=80&sharp=1'
    ];
    await p({
      category_id: catIds[item.cat],
      name: item.name,
      price: item.price,
      stock_qty: Math.floor(Math.random() * 200) + 10,
      rating: item.rating,
      review_count: item.reviews,
      thumbnail: validThumb + '?w=500&q=80',
      images: images,
      description: item.desc,
      specs: item.specs,
      is_prime: item.reviews > 5000,
    });
  }

  console.log('✅ Mass Database seeded successfully!');
  console.log(`   👤 1 default user seeded (john.doe@amazon.in)`);
  console.log(`   📂 ${catData.length} categories seeded`);
  console.log(`   📦 ${productsToSeed.length} top-tier products seeded`);
  
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
