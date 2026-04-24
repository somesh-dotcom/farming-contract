import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const bangaloreAreas = [
  'Bangalore - Indiranagar', 'Bangalore - Koramangala', 'Bangalore - Whitefield', 
  'Bangalore - HSR Layout', 'Bangalore - BTM Layout', 'Bangalore - Jayanagar', 
  'Bangalore - Malleshwaram', 'Bangalore - Electronic City', 'Bangalore - Marathahalli', 
  'Bangalore - Bannerghatta', 'Bangalore - Hebbal', 'Bangalore - Yelahanka', 
  'Bangalore - Frazer Town', 'Bangalore - RT Nagar', 'Bangalore - Peenya',
  'Bangalore - Banashankari', 'Bangalore - Basavanagudi', 'Bangalore - Wilson Garden', 
  'Bangalore - Ulsoor', 'Bangalore - KR Puram'
];

// Base prices for products (per unit)
const basePrices: Record<string, number> = {
  'Wheat': 2500,
  'Rice': 3000,
  'Tomato': 40,
  'Potato': 30,
  'Mango': 80,
  'Onion': 35,
  'Turmeric': 500,
  'Lentil': 120
};

function getRandomVariation(base: number, percentage: number = 0.2): number {
  const variation = base * percentage;
  const randomOffset = (Math.random() - 0.5) * 2 * variation;
  return Math.round((base + randomOffset) * 100) / 100;
}

async function seedBangaloreAreaPrices() {
  console.log('🌱 Adding random prices for all Bangalore areas...');

  try {
    // Get all products
    const products = await prisma.product.findMany();
    console.log(`📦 Found ${products.length} products`);

    const pricesToCreate = [];

    for (const product of products) {
      const basePrice = basePrices[product.name] || 100;

      for (const area of bangaloreAreas) {
        const price = getRandomVariation(basePrice, 0.15); // ±15% variation

        pricesToCreate.push({
          productId: product.id,
          price: price,
          unit: product.unit,
          location: area,
          date: new Date()
        });
      }
    }

    console.log(`📦 Inserting ${pricesToCreate.length} prices...`);

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < pricesToCreate.length; i += batchSize) {
      const batch = pricesToCreate.slice(i, i + batchSize);
      await prisma.marketPrice.createMany({
        data: batch
      });
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log(`✅ Successfully added prices for ${bangaloreAreas.length} Bangalore areas`);
    console.log(`✅ Total prices created: ${pricesToCreate.length}`);

  } catch (error) {
    console.error('Error seeding Bangalore area prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBangaloreAreaPrices();
