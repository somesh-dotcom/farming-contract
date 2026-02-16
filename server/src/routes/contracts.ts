import express from 'express';
import { prisma } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import { UserRole, ContractStatus } from '@prisma/client';

const router = express.Router();

// Get all contracts (with filters)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status, farmerId, buyerId, productId } = req.query;
    const filters: any = {};

    // Apply filters based on user role
    if (req.userRole === UserRole.FARMER) {
      filters.farmerId = req.userId;
    } else if (req.userRole === UserRole.BUYER) {
      filters.buyerId = req.userId;
    }

    if (status) filters.status = status;
    if (farmerId && req.userRole === UserRole.ADMIN) filters.farmerId = farmerId;
    if (buyerId && req.userRole === UserRole.ADMIN) filters.buyerId = buyerId;
    if (productId) filters.productId = productId;

    const contracts = await prisma.contract.findMany({
      where: filters,
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            state: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            state: true
          }
        },
        product: true,
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ contracts });
  } catch (error: any) {
    console.error('Get contracts error:', error);
    res.status(500).json({ message: 'Failed to fetch contracts', error: error.message });
  }
});

// Get single contract
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            pincode: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            pincode: true
          }
        },
        product: true,
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Check access permission
    if (
      req.userRole !== UserRole.ADMIN &&
      contract.farmerId !== req.userId &&
      contract.buyerId !== req.userId
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ contract });
  } catch (error: any) {
    console.error('Get contract error:', error);
    res.status(500).json({ message: 'Failed to fetch contract', error: error.message });
  }
});

// Create contract
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { buyerId, productId, quantity, unit, pricePerUnit, startDate, deliveryDate, terms, location } = req.body;

    // Validation
    if (!buyerId || !productId || !quantity || !unit || !pricePerUnit || !startDate || !deliveryDate) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Only farmers can create contracts
    if (req.userRole !== UserRole.FARMER) {
      return res.status(403).json({ message: 'Only farmers can create contracts' });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify buyer exists
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId, role: UserRole.BUYER }
    });

    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }

    const totalValue = quantity * pricePerUnit;

    const contract = await prisma.contract.create({
      data: {
        farmerId: req.userId!,
        buyerId,
        productId,
        quantity,
        unit,
        pricePerUnit,
        totalValue,
        startDate: new Date(startDate),
        deliveryDate: new Date(deliveryDate),
        terms,
        location,
        status: ContractStatus.DRAFT
      },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        product: true
      }
    });

    res.status(201).json({ message: 'Contract created successfully', contract });
  } catch (error: any) {
    console.error('Create contract error:', error);
    res.status(500).json({ message: 'Failed to create contract', error: error.message });
  }
});

// Update contract status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const contractId = req.params.id;

    if (!Object.values(ContractStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId }
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Check permissions
    const canUpdate =
      req.userRole === UserRole.ADMIN ||
      contract.farmerId === req.userId ||
      contract.buyerId === req.userId;

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: { status },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: true
      }
    });

    res.json({ message: 'Contract status updated', contract: updatedContract });
  } catch (error: any) {
    console.error('Update contract error:', error);
    res.status(500).json({ message: 'Failed to update contract', error: error.message });
  }
});

// Update contract
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const contractId = req.params.id;
    const updates = req.body;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId }
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Only farmer who created or admin can update
    if (req.userRole !== UserRole.ADMIN && contract.farmerId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Recalculate total if quantity or price changed
    if (updates.quantity || updates.pricePerUnit) {
      const quantity = updates.quantity || contract.quantity;
      const pricePerUnit = updates.pricePerUnit || contract.pricePerUnit;
      updates.totalValue = quantity * pricePerUnit;
    }

    // Convert date strings to Date objects
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.deliveryDate) updates.deliveryDate = new Date(updates.deliveryDate);

    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: updates,
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: true
      }
    });

    res.json({ message: 'Contract updated successfully', contract: updatedContract });
  } catch (error: any) {
    console.error('Update contract error:', error);
    res.status(500).json({ message: 'Failed to update contract', error: error.message });
  }
});

export default router;

