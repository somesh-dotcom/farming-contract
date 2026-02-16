import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function analyzePrices() {
  console.log('🔍 Analyzing current market prices...');
  
  // Get sample of market prices
  const samplePrices = await prisma.marketPrice.findMany({
    take: 20,
    include: {
      product: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  console.log('\n📋 Sample of current prices:');
  console.log('----------------------------------------');
  for (const price of samplePrices) {
    console.log(`${price.product?.name || 'Unknown'}: ₹${price.price.toFixed(2)}/${price.unit} (${price.location})`);
  }
  
  // Get price statistics
  const priceStats = await prisma.marketPrice.aggregate({
    _avg: {
      price: true
    },
    _min: {
      price: true
    },
    _max: {
      price: true
    },
    _count: {
      price: true
    }
  });
  
  console.log('\n📊 Price Statistics:');
  console.log('----------------------------------------');
  console.log(`Average Price: ₹${priceStats._avg.price?.toFixed(2)}`);
  console.log(`Minimum Price: ₹${priceStats._min.price?.toFixed(2)}`);
  console.log(`Maximum Price: ₹${priceStats._max.price?.toFixed(2)}`);
  console.log(`Total Records: ${priceStats._count.price}`);
  
  // Get product-specific statistics
  console.log('\n📈 Product-wise Price Ranges:');
  console.log('----------------------------------------');
  
  const products = await prisma.product.findMany();
  for (const product of products) {
    const productStats = await prisma.marketPrice.aggregate({
      _avg: {
        price: true
      },
      _min: {
        price: true
      },
      _max: {
        price: true
      },
      where: {
        productId: product.id
      }
    });
    
    console.log(`${product.name} (${product.category}):`);
    console.log(`  Avg: ₹${productStats._avg.price?.toFixed(2)}/${product.unit}`);
    console.log(`  Min: ₹${productStats._min.price?.toFixed(2)}/${product.unit}`);
    console.log(`  Max: ₹${productStats._max.price?.toFixed(2)}/${product.unit}`);
    console.log('');
  }
}

async function main() {
  try {
    await analyzePrices();
  } catch (error) {
    console.error('❌ Error analyzing prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();