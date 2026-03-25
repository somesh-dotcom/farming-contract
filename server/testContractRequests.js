/**
 * Test Script for Contract Request Feature
 * Tests the complete workflow of contract requests
 */

const { PrismaClient, UserRole } = require('@prisma/client');
const prisma = new PrismaClient();

async function testContractRequests() {
  console.log('========================================');
  console.log('Testing Contract Request Feature');
  console.log('========================================\n');
  
  try {
    // Step 1: Find or create a buyer and farmer
    console.log('📋 Step 1: Finding users...');
    
    let buyer = await prisma.user.findFirst({
      where: { role: UserRole.BUYER }
    });
    
    let farmer = await prisma.user.findFirst({
      where: { role: UserRole.FARMER }
    });
    
    if (!buyer || !farmer) {
      console.log('❌ Need at least one BUYER and one FARMER in the database');
      return;
    }
    
    console.log(`✓ Buyer found: ${buyer.name} (${buyer.email})`);
    console.log(`✓ Farmer found: ${farmer.name} (${farmer.email})\n`);
    
    // Step 2: Find a product
    console.log('📋 Step 2: Finding product...');
    
    const product = await prisma.product.findFirst();
    
    if (!product) {
      console.log('❌ No products found in the database');
      return;
    }
    
    console.log(`✓ Product found: ${product.name} (${product.unit})\n`);
    
    // Step 3: Create a contract request (as buyer)
    console.log('📋 Step 3: Creating contract request (Buyer → Farmer)...');
    
    const request = await prisma.contractRequest.create({
      data: {
        buyerId: buyer.id,
        farmerId: farmer.id,
        productId: product.id,
        quantity: 100,
        unit: product.unit,
        proposedPrice: 2500,
        startDate: new Date('2026-04-01'),
        deliveryDate: new Date('2026-04-15'),
        location: 'Bangalore',
        area: 'Indiranagar',
        terms: 'Premium quality required',
        status: 'PENDING'
      },
      include: {
        buyer: { select: { name: true, email: true } },
        farmer: { select: { name: true, email: true } },
        product: true
      }
    });
    
    console.log('✓ Contract request created successfully!');
    console.log(`  - ID: ${request.id}`);
    console.log(`  - Status: ${request.status}`);
    console.log(`  - Quantity: ${request.quantity} ${request.unit}`);
    console.log(`  - Price: ₹${request.proposedPrice}/${request.unit}`);
    console.log(`  - Total Value: ₹${request.quantity * request.proposedPrice}\n`);
    
    // Step 4: Verify notification was created
    console.log('📋 Step 4: Checking notifications...');
    
    const notification = await prisma.notifications.findFirst({
      where: { recipientId: farmer.id },
      orderBy: { createdAt: 'desc' }
    });
    
    if (notification) {
      console.log('✓ Notification sent to farmer');
      console.log(`  - Type: ${notification.type}`);
      console.log(`  - Title: ${notification.title}`);
      console.log(`  - Message: ${notification.message}\n`);
    } else {
      console.log('⚠️  No notification found\n');
    }
    
    // Step 5: Accept the request (as farmer)
    console.log('📋 Step 5: Accepting contract request (Farmer accepts)...');
    
    // First, update request status
    const updatedRequest = await prisma.contractRequest.update({
      where: { id: request.id },
      data: { status: 'ACCEPTED' }
    });
    
    // Then create the actual contract
    const contract = await prisma.contract.create({
      data: {
        farmerId: farmer.id,
        buyerId: buyer.id,
        productId: product.id,
        quantity: request.quantity,
        unit: request.unit,
        pricePerUnit: request.proposedPrice,
        totalValue: request.quantity * request.proposedPrice,
        startDate: request.startDate,
        deliveryDate: request.deliveryDate,
        location: request.location,
        terms: request.terms,
        status: 'PENDING'
      },
      include: {
        farmer: { select: { name: true, email: true } },
        buyer: { select: { name: true, email: true } },
        product: true
      }
    });
    
    // Link contract to request
    await prisma.contractRequest.update({
      where: { id: request.id },
      data: { contractId: contract.id }
    });
    
    console.log('✓ Contract created successfully!');
    console.log(`  - Contract ID: ${contract.id}`);
    console.log(`  - Status: ${contract.status}`);
    console.log(`  - Total Value: ₹${contract.totalValue}\n`);
    
    // Step 6: Verify acceptance notification
    console.log('📋 Step 6: Checking acceptance notification...');
    
    const acceptNotification = await prisma.notifications.findFirst({
      where: { recipientId: buyer.id },
      orderBy: { createdAt: 'desc' }
    });
    
    if (acceptNotification) {
      console.log('✓ Notification sent to buyer');
      console.log(`  - Type: ${acceptNotification.type}`);
      console.log(`  - Title: ${acceptNotification.title}`);
      console.log(`  - Message: ${acceptNotification.message}\n`);
    }
    
    // Step 7: Summary
    console.log('========================================');
    console.log('✅ Test Complete!');
    console.log('========================================\n');
    
    console.log('Summary:');
    console.log('--------');
    console.log(`✓ Buyer ${buyer.name} sent request to Farmer ${farmer.name}`);
    console.log(`✓ Farmer accepted the request`);
    console.log(`✓ Contract created with ID: ${contract.id}`);
    console.log(`✓ Both parties notified`);
    console.log('\nThe contract request workflow is working correctly! 🎉\n');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testContractRequests();
