#!/usr/bin/env node

/**
 * IST Daily Date Update Script
 * This script updates all market prices to the current IST date
 * Can be run manually or scheduled via cron job
 * 
 * Usage:
 *   npm run update-ist-daily
 *   node scripts/updatePricesToISTDaily.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// IST = UTC + 5:30
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Get current date/time in IST
 */
function getCurrentISTTime() {
  const now = new Date();
  return new Date(now.getTime() + IST_OFFSET_MS);
}

/**
 * Get start of current IST day (midnight IST)
 * Returns the UTC timestamp that represents midnight IST
 */
function getStartOfISTDay() {
  const istNow = getCurrentISTTime();
  // Set to start of day in IST
  const istStartOfDay = new Date(istNow);
  istStartOfDay.setUTCHours(0, 0, 0, 0);
  
  // Convert back to UTC for storage
  return new Date(istStartOfDay.getTime() - IST_OFFSET_MS);
}

/**
 * Get end of current IST day (23:59:59.999 IST)
 */
function getEndOfISTDay() {
  const istNow = getCurrentISTTime();
  // Set to end of day in IST
  const istEndOfDay = new Date(istNow);
  istEndOfDay.setUTCHours(23, 59, 59, 999);
  
  // Convert back to UTC for storage
  return new Date(istEndOfDay.getTime() - IST_OFFSET_MS);
}

async function updatePricesToISTDaily() {
  try {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     IST Daily Market Price Date Update                   ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    
    const targetDate = getStartOfISTDay();
    const istNow = getCurrentISTTime();
    const dayEnd = getEndOfISTDay();
    
    console.log('🕐 Current IST time:', istNow.toISOString());
    console.log('📅 Target IST date:', targetDate.toISOString().split('T')[0]);
    console.log('📊 Fetching market prices...\n');
    
    // Get all market prices
    const marketPrices = await prisma.marketPrice.findMany({
      orderBy: { date: 'desc' }
    });
    
    console.log(`📊 Found ${marketPrices.length} total price records\n`);
    
    // Get unique product-location combinations
    const uniqueCombinations = new Map();
    for (const price of marketPrices) {
      const key = `${price.productId}-${price.location}`;
      if (!uniqueCombinations.has(key)) {
        uniqueCombinations.set(key, price);
      }
    }
    
    console.log(`📦 Found ${uniqueCombinations.size} unique product-location combinations\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each unique combination
    for (const [key, latestPrice] of uniqueCombinations) {
      try {
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
          console.log(`⏭️  ${latestPrice.productId} @ ${latestPrice.location} - Already updated for today`);
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
        console.log(`✅ ${latestPrice.productId} @ ${latestPrice.location} - Updated to IST date (₹${latestPrice.price})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating ${key}:`, error.message);
      }
    }
    
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    Update Summary                        ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`⏭️  Skipped (already exists): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${updatedCount + skippedCount + errorCount}`);
    console.log(`📅 Date set to IST: ${targetDate.toISOString().split('T')[0]}`);
    console.log('\n🎉 IST daily date update completed successfully!\n');
    
    return updatedCount;
  } catch (error) {
    console.error('\n❌ Fatal error during IST daily update:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updatePricesToISTDaily()
  .then((count) => {
    console.log(`\n✅ Done! Updated ${count} records to IST date`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
