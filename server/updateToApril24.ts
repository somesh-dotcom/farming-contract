import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Bangalore areas list
const BANGALORE_AREAS = [
  'Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'BTM Layout',
  'Jayanagar', 'Malleshwaram', 'Electronic City', 'Marathahalli', 'Bannerghatta',
  'Hebbal', 'Yelahanka', 'Frazer Town', 'RT Nagar', 'Peenya',
  'Banashankari', 'Basavanagudi', 'Wilson Garden', 'Ulsoor', 'KR Puram'
];

async function updateDatesToApril24() {
  console.log('🔄 Updating all Bangalore area prices to April 24, 2026...');
  
  // Set date to April 24, 2026 at noon IST (6:30 AM UTC)
  const targetDate = new Date('2026-04-24T06:30:00.000Z');
  
  let updatedCount = 0;
  
  try {
    // Get all products
    const products = await prisma.product.findMany();
    console.log(`📦 Found ${products.length} products`);
    
    // For each product
    for (const product of products) {
      // For each Bangalore area
      for (const area of BANGALORE_AREAS) {
        const location = `Bangalore - ${area}`;
        
        // Get the latest price for this product in this area
        const latestPrice = await prisma.marketPrice.findFirst({
          where: { 
            productId: product.id,
            location: location
          },
          orderBy: { date: 'desc' }
        });
        
        if (!latestPrice) continue;
        
        // Check if we already have an entry for April 24
        const dayStart = new Date('2026-04-24T00:00:00.000Z');
        const dayEnd = new Date('2026-04-24T23:59:59.999Z');
        
        const existingEntry = await prisma.marketPrice.findFirst({
          where: {
            productId: product.id,
            location: location,
            date: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        });
        
        if (existingEntry) {
          console.log(`✓ ${product.name} in ${area} - Already has April 24 date`);
          continue;
        }
        
        // Create new entry with April 24 date but SAME price
        await prisma.marketPrice.create({
          data: {
            productId: product.id,
            price: latestPrice.price,  // Keep the same price
            unit: latestPrice.unit,
            location: location,
            date: targetDate  // Set to April 24, 2026
          }
        });
        
        updatedCount++;
        console.log(`📅 ${product.name} in ${area} - Updated to April 24 - Price: ₹${latestPrice.price}`);
      }
    }
    
    console.log(`\n✅ Date update completed!`);
    console.log(`✅ Updated ${updatedCount} area-product combinations to April 24, 2026`);
    console.log(`✅ Prices remain the same, only dates changed`);
    
  } catch (error) {
    console.error('❌ Error updating dates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDatesToApril24();
