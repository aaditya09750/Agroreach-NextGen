/**
 * Seeds the Product collection from /products/ image folder + seedData.js.
 *
 * Usage (run locally with .env pointing at production MongoDB and Cloudinary):
 *   npm run create-admin   # one-time, creates the admin User this script attributes products to
 *   npm run seed-products  # uploads images to Cloudinary, inserts products
 *
 * Idempotent: rerunning skips products already inserted (matched by name) and
 * Cloudinary uploads use a stable public_id so they overwrite cleanly rather
 * than duplicating.
 */

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const cloudinary = require('../src/config/cloudinary');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
const PRODUCTS = require('./seedData');

const productsDir = path.resolve(__dirname, '../../products');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set.');
    process.exit(1);
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary credentials are not fully configured.');
    process.exit(1);
  }
  if (!fs.existsSync(productsDir)) {
    console.error(`Products folder not found at ${productsDir}`);
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('No admin user found. Run `npm run create-admin` first.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`Attributing seeded products to admin ${admin.email}\n`);

  let inserted = 0;
  let skipped = 0;
  const missingFiles = [];

  for (const p of PRODUCTS) {
    const exists = await Product.findOne({ name: p.name });
    if (exists) {
      skipped++;
      console.log(`-  skip (exists): ${p.name}`);
      continue;
    }

    const imageUrls = [];
    for (const file of p.images) {
      const filePath = path.join(productsDir, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(`${p.name} -> ${file}`);
        continue;
      }
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'agroreach/products',
          public_id: file.replace(/\.[^.]+$/, ''),
          overwrite: true,
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        });
        imageUrls.push(result.secure_url);
        console.log(`     uploaded ${file}`);
      } catch (err) {
        console.error(`     failed ${file}: ${err.message}`);
      }
    }

    if (imageUrls.length === 0) {
      console.warn(`!  skip ${p.name}: no images uploaded`);
      continue;
    }

    await Product.create({
      name: p.name,
      price: p.price,
      oldPrice: Math.round(p.price * 1.15),
      description: p.description,
      category: p.category,
      tags: p.tags,
      images: imageUrls,
      stockQuantity: 100,
      stockUnit: p.stockUnit,
      seller: admin._id,
      isActive: true,
      rating: 0,
      reviewCount: 0,
      discount: 0,
    });
    inserted++;
    console.log(`+  inserted ${p.name} (${imageUrls.length} image${imageUrls.length === 1 ? '' : 's'})\n`);
  }

  console.log('\n=== Summary ===');
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped (already existed): ${skipped}`);
  if (missingFiles.length) {
    console.warn(`\nMissing files (${missingFiles.length}):`);
    missingFiles.forEach((m) => console.warn(`  - ${m}`));
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
