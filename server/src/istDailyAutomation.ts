import { prisma } from './lib/prisma';

/**
 * IST Timezone Constants
 * IST = UTC + 5:30
 */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

/**
 * Get current date/time in IST
 */
export const getCurrentISTTime = (): Date => {
  const now = new Date();
  return new Date(now.getTime() + IST_OFFSET_MS);
};

/**
 * Get start of current IST day (midnight IST)
 * Returns the UTC timestamp that represents midnight IST
 */
export const getStartOfISTDay = (): Date => {
  const istNow = getCurrentISTTime();
  // Set to start of day in IST
  const istStartOfDay = new Date(istNow);
  istStartOfDay.setUTCHours(0, 0, 0, 0);
  
  // Convert back to UTC for storage
  return new Date(istStartOfDay.getTime() - IST_OFFSET_MS);
};

/**
 * Get end of current IST day (23:59:59.999 IST)
 * Returns the UTC timestamp that represents end of IST day
 */
export const getEndOfISTDay = (): Date => {
  const istNow = getCurrentISTTime();
  // Set to end of day in IST
  const istEndOfDay = new Date(istNow);
  istEndOfDay.setUTCHours(23, 59, 59, 999);
  
  // Convert back to UTC for storage
  return new Date(istEndOfDay.getTime() - IST_OFFSET_MS);
};

/**
 * Calculate milliseconds until next midnight IST
 */
export const getMsUntilMidnightIST = (): number => {
  const now = new Date();
  const istNow = getCurrentISTTime();
  
  // Calculate next midnight IST
  const nextMidnightIST = new Date(istNow);
  nextMidnightIST.setUTCDate(nextMidnightIST.getUTCDate() + 1);
  nextMidnightIST.setUTCHours(0, 0, 0, 0);
  
  // Convert to UTC
  const nextMidnightUTC = new Date(nextMidnightIST.getTime() - IST_OFFSET_MS);
  
  return nextMidnightUTC.getTime() - now.getTime();
};

/**
 * Update all market prices to current IST date
 * Creates new entries with today's IST date, keeping the same prices
 */
export const updateAllPricesToISTDate = async (): Promise<number> => {
  try {
    console.log('🔄 [IST Automation] Updating all market prices to current IST date...');
    
    const targetDate = getStartOfISTDay();
    const istNow = getCurrentISTTime();
    
    console.log(`📅 Current IST time: ${istNow.toISOString()}`);
    console.log(`📅 Target UTC date (midnight IST): ${targetDate.toISOString()}`);
    
    // Get all unique product-location combinations
    const marketPrices = await prisma.marketPrice.findMany({
      select: {
        productId: true,
        location: true,
        price: true,
        unit: true,
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Get unique combinations
    const uniqueCombinations = new Map<string, typeof marketPrices[0]>();
    for (const price of marketPrices) {
      const key = `${price.productId}-${price.location}`;
      if (!uniqueCombinations.has(key)) {
        uniqueCombinations.set(key, price);
      }
    }
    
    let updatedCount = 0;
    let skippedCount = 0;
    const dayEnd = getEndOfISTDay();
    
    // Process each unique combination
    for (const [key, latestPrice] of uniqueCombinations) {
      // Check if entry already exists for today (IST)
      const existingEntry = await prisma.marketPrice.findFirst({
        where: {
          productId: latestPrice.productId,
          location: latestPrice.location,
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
          productId: latestPrice.productId,
          price: latestPrice.price,
          unit: latestPrice.unit,
          location: latestPrice.location,
          date: targetDate
        }
      });
      
      updatedCount++;
      console.log(`✅ ${latestPrice.productId} @ ${latestPrice.location} - Updated to IST date`);
    }
    
    console.log(`✅ [IST Automation] Completed. Updated: ${updatedCount}, Skipped (already exists): ${skippedCount}`);
    
    return updatedCount;
  } catch (error) {
    console.error('❌ [IST Automation] Error updating prices to IST date:', error);
    throw error;
  }
};

/**
 * Initialize IST-based daily automation
 * This function:
 * 1. Updates prices immediately on startup
 * 2. Schedules daily updates at midnight IST
 */
export const startISTDailyAutomation = (): void => {
  console.log('🚀 [IST Automation] Starting IST-based daily market price date updates...');
  
  // Update dates immediately on startup
  updateAllPricesToISTDate().catch(err => {
    console.error('❌ [IST Automation] Initial update failed:', err);
  });
  
  // Calculate time until next midnight IST
  const msUntilMidnight = getMsUntilMidnightIST();
  const minutesUntilMidnight = Math.round(msUntilMidnight / 1000 / 60);
  const hoursUntilMidnight = Math.round(msUntilMidnight / 1000 / 60 / 60 * 10) / 10;
  
  console.log(`⏰ [IST Automation] Next update scheduled at midnight IST (${hoursUntilMidnight} hours / ${minutesUntilMidnight} minutes from now)`);
  
  // Schedule first update at next midnight IST
  setTimeout(() => {
    console.log('🔄 [IST Automation] Running scheduled midnight IST date update...');
    updateAllPricesToISTDate().catch(err => {
      console.error('❌ [IST Automation] Scheduled update failed:', err);
    });
    
    // Then update every 24 hours (86400000 ms)
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    setInterval(() => {
      console.log('🔄 [IST Automation] Running scheduled daily IST date update...');
      updateAllPricesToISTDate().catch(err => {
        console.error('❌ [IST Automation] Recurring update failed:', err);
      });
    }, TWENTY_FOUR_HOURS);
  }, msUntilMidnight);
  
  console.log('✅ [IST Automation] Daily automation scheduler initialized successfully');
};
