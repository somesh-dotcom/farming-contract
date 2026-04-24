const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePricesToISTDate() {
  try {
    // Get current time in IST (UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istDate = new Date(now.getTime() + istOffset);
    
    // Set to start of day in IST
    const istDateOnly = new Date(istDate);
    istDateOnly.setUTCHours(0, 0, 0, 0);
    
    console.log('🕐 Current IST time:', istDate.toISOString());
    console.log('📅 IST Date (start of day):', istDateOnly.toISOString());
    
    console.log('\n🔄 Updating market prices to IST date...');
    
    // Get all market prices
    const prices = await prisma.marketPrice.findMany();
    console.log(`📊 Found ${prices.length} market price records`);
    
    let updatedCount = 0;
    
    // Update each price record to IST date
    for (const price of prices) {
      await prisma.marketPrice.update({
        where: { id: price.id },
        data: {
          date: istDateOnly
        }
      });
      updatedCount++;
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} price records`);
    console.log(`📍 Date set to IST: ${istDateOnly.toISOString().split('T')[0]}`);
    console.log('🎉 Market prices now show current IST date!');
    
    return updatedCount;
  } catch (error) {
    console.error('❌ Error updating prices:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updatePricesToISTDate()
  .then((count) => {
    console.log(`\n✅ Done! Updated ${count} records to IST date`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
