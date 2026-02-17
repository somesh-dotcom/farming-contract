import express from 'express';
import { prisma } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth';
import { TransactionStatus } from '@prisma/client';

const router = express.Router();

// Get all transactions
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { contractId, status, paymentMethod, paymentType, search } = req.query;
    const filters: any = {};

    if (contractId) filters.contractId = contractId;
    if (status) filters.status = status;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (paymentType) filters.paymentType = paymentType;
    
    // Add search functionality
    if (search) {
      const searchStr = search as string;
      
      // Check if search term is a number for amount search
      const isNumeric = !isNaN(Number(searchStr));
      
      // Check if search term matches contract ID (order ID)
      const isContractId = searchStr.length >= 8 && searchStr.length <= 36; // UUID length range
      
      // Create a copy of existing filters to avoid recursion
      const existingFilters = { ...filters };
      delete existingFilters.AND; // Remove any existing AND to avoid nesting
      
      if (isContractId) {
        // If it looks like a contract ID, search by exact match
        filters.contractId = searchStr;
      } else {
        // Otherwise, do general search
        filters.AND = [
          existingFilters,
          {
            OR: [
              { id: { contains: searchStr, mode: 'insensitive' } },
              { status: { contains: searchStr, mode: 'insensitive' } },
              { paymentMethod: { contains: searchStr, mode: 'insensitive' } },
              { paymentType: { contains: searchStr, mode: 'insensitive' } },
              ...(isNumeric ? [{ amount: { equals: Number(searchStr) } }] : []),
              {
                contract: {
                  product: {
                    name: { contains: searchStr, mode: 'insensitive' }
                  }
                }
              },
              {
                contract: {
                  farmer: {
                    name: { contains: searchStr, mode: 'insensitive' }
                  }
                }
              },
              {
                contract: {
                  buyer: {
                    name: { contains: searchStr, mode: 'insensitive' }
                  }
                }
              }
            ]
          }
        ];
      }
    }

    // Filter by user unless admin
    // For non-admin users, show transactions for contracts they're part of (as farmer or buyer)
    if (req.userRole !== 'ADMIN') {
      filters.OR = [
        { userId: req.userId },
        { contract: { farmerId: req.userId } },
        { contract: { buyerId: req.userId } }
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where: filters,
      include: {
        contract: {
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
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ transactions });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
});

// Create transaction
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { contractId, amount, paymentMethod, paymentType } = req.body;

    if (!contractId || !amount) {
      return res.status(400).json({ message: 'Contract ID and amount are required' });
    }

    // Verify contract exists
    const contract = await prisma.contract.findUnique({
      where: { id: contractId }
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Verify user is part of the contract
    if (contract.farmerId !== req.userId && contract.buyerId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        contractId,
        userId: req.userId!,
        amount: parseFloat(amount),
        paymentMethod,
        paymentType,
        status: TransactionStatus.PENDING
      },
      include: {
        contract: {
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
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Check if all transactions for this contract are completed
    const allTransactions = await prisma.transaction.findMany({
      where: { contractId: transaction.contractId }
    });
    
    const allCompleted = allTransactions.every(t => t.status === 'COMPLETED');
    
    if (allCompleted && allTransactions.length > 0) {
      // Update contract status to COMPLETED
      await prisma.contract.update({
        where: { id: contractId },
        data: { status: 'COMPLETED' }
      });
    }
    
    res.status(201).json({ message: 'Transaction created successfully', transaction });
  } catch (error: any) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Failed to create transaction', error: error.message });
  }
});

// Update transaction status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const transactionId = req.params.id;

    if (!Object.values(TransactionStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        contract: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check permissions
    const canUpdate =
      req.userRole === 'ADMIN' ||
      transaction.contract.farmerId === req.userId ||
      transaction.contract.buyerId === req.userId;

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
      include: {
        contract: {
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
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Check if all transactions for this contract are completed
    const allTransactions = await prisma.transaction.findMany({
      where: { contractId: updatedTransaction.contractId }
    });
    
    const allCompleted = allTransactions.every(t => t.status === 'COMPLETED');
    
    if (allCompleted && allTransactions.length > 0) {
      // Update contract status to COMPLETED
      await prisma.contract.update({
        where: { id: updatedTransaction.contractId },
        data: { status: 'COMPLETED' }
      });
    }
    
    res.json({ message: 'Transaction status updated', transaction: updatedTransaction });
  } catch (error: any) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Failed to update transaction', error: error.message });
  }
});

// Delete transaction
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const transactionId = req.params.id;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        contract: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check permissions - only admin can delete transactions
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.transaction.delete({
      where: { id: transactionId }
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Failed to delete transaction', error: error.message });
  }
});

export default router;

