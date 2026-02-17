const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBangaloreAreas() {
  try {
    // List of all Bangalore areas the system should have
    const allBangaloreAreas = [
      'Bangalore - Indiranagar', 'Bangalore - Koramangala', 'Bangalore - Whitefield', 
      'Bangalore - HSR Layout', 'Bangalore - BTM Layout', 'Bangalore - Jayanagar', 
      'Bangalore - Malleshwaram', 'Bangalore - Electronic City', 'Bangalore - Marathahalli', 
      'Bangalore - Bannerghatta', 'Bangalore - Hebbal', 'Bangalore - Yelahanka', 
      'Bangalore - Frazer Town', 'Bangalore - RT Nagar', 'Bangalore - Peenya',
      'Bangalore - Banashankari', 'Bangalore - Basavanagudi', 'Bangalore - Wilson Garden', 
      'Bangalore - Ulsoor', 'Bangalore - KR Puram', 'Bangalore' // General Bangalore
    ];
    
    console.log('Checking prices for each Bangalore area:');
    console.log('====================================');
    
    for (const area of allBangaloreAreas) {
      const count = await prisma.marketPrice.count({
        where: { location: area }
      });
      
      const latestPrice = await prisma.marketPrice.findFirst({
        where: { location: area },
        include: { product: true },
        orderBy: { date: 'desc' }
      });
      
      console.log(`${area}: ${count} prices`);
      if (latestPrice) {
        console.log(`  Latest: ${latestPrice.product?.name} - ₹${latestPrice.price}/${latestPrice.unit}`);
      }
    }
    
    // Check if there are any prices with just "Bangalore" (no specific area)
    const generalBangaloreCount = await prisma.marketPrice.count({
      where: { 
        location: 'Bangalore' 
      }
    });
    console.log(`\nGeneral Bangalore (no area): ${generalBangaloreCount} prices`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBangaloreAreas();