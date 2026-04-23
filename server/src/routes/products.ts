import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filters: any = {};

    if (category) {
      filters.category = category;
    }

    if (search) {
      filters.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where: filters,
      include: {
        _count: {
          select: { contracts: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ products });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        contracts: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            quantity: true,
            pricePerUnit: true,
            deliveryDate: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
});

// Create product (Admin only)
router.post('/', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const { name, category, description, unit } = req.body;

    if (!name || !category || !unit) {
      return res.status(400).json({ message: 'Name, category, and unit are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        description,
        unit
      }
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});

// Update product (Admin only)
router.put('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updates
    });

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const productId = req.params.id;

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is used in any contracts
    const contractCount = await prisma.contract.count({
      where: { productId }
    });

    if (contractCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete product that is used in contracts. Delete associated contracts first.' 
      });
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

export default router;

