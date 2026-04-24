import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Bangalore areas list
const BANGALORE_AREAS = [
  'Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'BTM Layout',
  'Jayanagar', 'Malleshwaram', 'Electronic City', 'Marathahalli', 'Bannerghatta',
  'Hebbal', 'Yelahanka', 'Frazer Town', 'RT Nagar', 'Peenya',
  'Banashankari', 'Basavanagudi', 'Wilson Garden', 'Ulsoor', 'KR Puram'
];

export default async function handler(req: any, res: any) {
  // Allow only GET requests (can be triggered by cron)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Auto-update: Updating Bangalore area dates to IST current date...');
    
    // Get current date in IST (UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istTime = new Date(now.getTime() + istOffset);
    
    // Set to start of IST day
    const istDayStart = new Date(istTime);
    istDayStart.setUTCHours(0, 0, 0, 0);
    
    // Adjust back to UTC for storage
    const targetDate = new Date(istDayStart.getTime() - istOffset);
    
    console.log(`📅 Current IST time: ${istTime.toISOString()}`);
    console.log(`📅 Target date (start of IST day): ${targetDate.toISOString()}`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Get all products
    const products = await prisma.product.findMany();
    
    if (products.length === 0) {
      return res.json({ message: 'No products found', updated: 0 });
    }
    
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
        
        // Check if we already have an entry for today (IST)
        const dayEnd = new Date(targetDate);
        dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
        
        const existingEntry = await prisma.marketPrice.findFirst({
          where: {
            productId: product.id,
            location: location,
            date: {
              gte: targetDate,
              lt: dayEnd
            }
          }
        });
        
        // Skip if today's entry already exists
        if (existingEntry) {
          skippedCount++;
          continue;
        }
        
        // Create new entry with today's IST date but SAME price
        await prisma.marketPrice.create({
          data: {
            productId: product.id,
            price: latestPrice.price,  // Keep the same price
            unit: latestPrice.unit,
            location: location,
            date: targetDate  // Set to start of IST day
          }
        });
        
        updatedCount++;
      }
    }
    
    await prisma.$disconnect();
    
    return res.json({
      message: 'Daily IST date update completed successfully',
      timestamp: new Date().toISOString(),
      istTime: istTime.toISOString(),
      updated: updatedCount,
      skipped: skippedCount,
      total: updatedCount + skippedCount
    });
    
  } catch (error: any) {
    console.error('❌ Error in auto-update:', error);
    await prisma.$disconnect();
    return res.status(500).json({ 
      error: 'Failed to update dates',
      message: error.message 
    });
  }
}
