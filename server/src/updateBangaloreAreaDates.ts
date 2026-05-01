import { prisma } from './lib/prisma';

// Bangalore areas list
const BANGALORE_AREAS = [
  'Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'BTM Layout',
  'Jayanagar', 'Malleshwaram', 'Electronic City', 'Marathahalli', 'Bannerghatta',
  'Hebbal', 'Yelahanka', 'Frazer Town', 'RT Nagar', 'Peenya',
  'Banashankari', 'Basavanagudi', 'Wilson Garden', 'Ulsoor', 'KR Puram'
];

/**
 * Updates market price dates for all Bangalore areas
 * Keeps the same price values, only updates the date to today
 */
export const updateBangaloreAreaDates = async () => {
  try {
    console.log('🔄 Updating Bangalore area market price dates to today...');
    
    const now = new Date();
    let updatedCount = 0;
    
    // Get all products
    const products = await prisma.product.findMany();
    
    if (products.length === 0) {
      console.log('No products found');
      return;
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
        
        // If no price exists for this area, skip
        if (!latestPrice) continue;
        
        // Check if we already have an entry for today
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        
        const existingTodayEntry = await prisma.marketPrice.findFirst({
          where: {
            productId: product.id,
            location: location,
            date: {
              gte: todayStart,
              lte: todayEnd
            }
          }
        });
        
        // Skip if today's entry already exists
        if (existingTodayEntry) {
          console.log(`✓ ${product.name} in ${area} - Already has today's date`);
          continue;
        }
        
        // Update the existing entry with today's date
        await prisma.marketPrice.update({
          where: { id: latestPrice.id },
          data: {
            date: now  // Update to current date/time
          }
        });
        
        updatedCount++;
        console.log(`📅 ${product.name} in ${area} - Date updated to today - Price: ₹${latestPrice.price}`);
      }
    }
    
    console.log(`✅ Bangalore area date update completed. Updated ${updatedCount} area-product combinations to today's date.`);
    
  } catch (error) {
    console.error('❌ Error updating Bangalore area dates:', error);
  }
};

/**
 * Initialize daily date updates for Bangalore areas
 * Runs once at startup, then schedules daily updates at midnight
 */
export const startBangaloreAreaDateUpdates = () => {
  console.log('🚀 Starting daily Bangalore area market price date updates...');
  
  // Update dates immediately on startup
  updateBangaloreAreaDates();
  
  // Calculate time until next midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const msUntilMidnight = tomorrow.getTime() - now.getTime();
  const minutesUntilMidnight = Math.round(msUntilMidnight / 1000 / 60);
  
  console.log(`⏰ Next Bangalore area date update scheduled at midnight (${minutesUntilMidnight} minutes from now)`);
  
  // First update at next midnight
  setTimeout(() => {
    console.log('🔄 Running scheduled Bangalore area date update...');
    updateBangaloreAreaDates();
    
    // Then update every 24 hours
    setInterval(() => {
      console.log('🔄 Running scheduled Bangalore area date update...');
      updateBangaloreAreaDates();
    }, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
};
