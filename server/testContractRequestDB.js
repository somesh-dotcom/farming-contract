const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testContractRequest() {
  try {
    console.log('=== Testing Contract Request Directly in Database ===\n');

    // Get a buyer
    const buyer = await prisma.user.findFirst({
      where: { role: 'BUYER' }
    });

    if (!buyer) {
      console.log('❌ No buyer found!');
      return;
    }

    console.log('✓ Buyer:', buyer.name, '(', buyer.id, ')');

    // Get a farmer
    const farmer = await prisma.user.findFirst({
      where: { role: 'FARMER' }
    });

    if (!farmer) {
      console.log('❌ No farmer found!');
      return;
    }

    console.log('✓ Farmer:', farmer.name, '(', farmer.id, ')');

    // Get a product
    const product = await prisma.product.findFirst();

    if (!product) {
      console.log('❌ No products found!');
      return;
    }

    console.log('✓ Product:', product.name, '(', product.id, ')');

    // Create contract request
    console.log('\nCreating contract request...');
    const request = await prisma.contractRequest.create({
      data: {
        buyerId: buyer.id,
        farmerId: farmer.id,
        productId: product.id,
        quantity: 100,
        unit: 'kg',
        proposedPrice: 25.5,
        startDate: new Date(Date.now() + 86400000),
        deliveryDate: new Date(Date.now() + 1209600000),
        location: 'Bangalore',
        area: 'Indiranagar',
        terms: 'Test from direct database test',
        status: 'PENDING'
      },
      include: {
        buyer: true,
        farmer: true,
        product: true
      }
    });

    console.log('\n✅ SUCCESS! Contract request created!');
    console.log('ID:', request.id);
    console.log('Status:', request.status);
    console.log('Buyer:', request.buyer.name);
    console.log('Farmer:', request.farmer.name);
    console.log('Product:', request.product.name);
    console.log('Quantity:', request.quantity, request.unit);
    console.log('Price: ₹', request.proposedPrice, '/', request.unit);
    console.log('Total: ₹', (request.quantity * request.proposedPrice).toLocaleString());

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testContractRequest();
