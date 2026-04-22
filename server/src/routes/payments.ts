import express from 'express';
import { prisma } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Process mock payment - Simulates payment success/failure
 * Creates both Payment record and Transaction record
 */
router.post('/process', authenticate, async (req: AuthRequest, res) => {
  try {
    const { contractId, amount } = req.body;

    if (!contractId || !amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Contract ID and amount are required' 
      });
    }

    // Verify contract exists
    const contract = await prisma.contract.findUnique({
      where: { id: contractId }
    });

    if (!contract) {
      return res.status(404).json({ 
        success: false,
        message: 'Contract not found' 
      });
    }

    // Check if already paid
    const existingTransactions = await prisma.transaction.findMany({
      where: { 
        contractId,
        status: 'COMPLETED'
      }
    });

    if (existingTransactions.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Contract is already paid' 
      });
    }

    // Simulate payment processing (80% success rate)
    const paymentSuccess = Math.random() < 0.8;

    if (!paymentSuccess) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment failed - Insufficient funds',
        errorCode: 'PAYMENT_FAILED'
      });
    }

    // Generate mock payment ID
    const paymentId = 'PAY_' + Math.random().toString(36).substring(2, 17).toUpperCase();

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        contractId,
        userId: req.userId!,
        amount: parseFloat(amount),
        paymentMethod: 'mock_payment',
        paymentType: 'FINAL',
        status: 'COMPLETED'
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

    // Update contract status to ACTIVE (paid)
    await prisma.contract.update({
      where: { id: contractId },
      data: { status: 'ACTIVE' }
    });

    res.json({ 
      success: true,
      message: 'Payment successful',
      paymentId,
      amount: parseFloat(amount),
      transaction
    });

  } catch (error: any) {
    console.error('Payment processing error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Payment processing failed'
    });
  }
});

/**
 * Get payment/transaction details for a contract
 */
router.get('/contract/:contractId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { contractId } = req.params;

    const transactions = await prisma.transaction.findMany({
      where: { contractId },
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

    res.json({ 
      success: true,
      transactions,
      count: transactions.length
    });

  } catch (error: any) {
    console.error('Get payment details error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to fetch payment details'
    });
  }
});

export default router;
