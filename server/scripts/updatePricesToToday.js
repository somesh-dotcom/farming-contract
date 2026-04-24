const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePricesToToday() {
  try {
    console.log('🔄 Updating market prices to today (April 24, 2026)...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Today:', today.toISOString());
    
    // Get all market prices
    const prices = await prisma.marketPrice.findMany();
    console.log(`📊 Found ${prices.length} market price records`);
    
    let updatedCount = 0;
    
    // Update each price record to today's date
    for (const price of prices) {
      await prisma.marketPrice.update({
        where: { id: price.id },
        data: {
          date: today
        }
      });
      updatedCount++;
    }
    
    console.log(`✅ Successfully updated ${updatedCount} price records to today's date`);
    console.log('🎉 Market prices now show current date!');
    
    return updatedCount;
  } catch (error) {
    console.error('❌ Error updating prices:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updatePricesToToday()
  .then((count) => {
    console.log(`\n✅ Done! Updated ${count} records`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
