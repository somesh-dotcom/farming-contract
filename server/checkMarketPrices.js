const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMarketPrices() {
  try {
    const prices = await prisma.marketPrice.findMany({ 
      take: 10, 
      include: { product: true } 
    });
    
    console.log('Market Prices:');
    if (prices.length === 0) {
      console.log('No market prices found in database');
      return;
    }
    
    prices.forEach(p => {
      console.log(`  ${p.product?.name}: ₹${p.price}/${p.unit} - ${p.location || 'No location'}`);
    });
    
    // Check if there are Bangalore-specific prices
    const bangalorePrices = await prisma.marketPrice.findMany({
      where: {
        location: {
          contains: 'Bangalore'
        }
      },
      include: { product: true }
    });
    
    console.log(`\nBangalore-specific prices: ${bangalorePrices.length}`);
    bangalorePrices.slice(0, 5).forEach(p => {
      console.log(`  ${p.product?.name}: ₹${p.price}/${p.unit} - ${p.location}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMarketPrices();