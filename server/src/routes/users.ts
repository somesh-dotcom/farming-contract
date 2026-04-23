import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Get all users (with role filter)
router.get('/', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const { role, search } = req.query;
    const filters: any = {};

    if (role) {
      filters.role = role;
    }

    if (search) {
      filters.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Get users by role (for finding farmers/buyers)
router.get('/by-role/:role', authenticate, async (req: AuthRequest, res) => {
  try {
    const { role } = req.params;
    const { search } = req.query;

    if (!Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const filters: any = { role: role as UserRole };

    if (search) {
      filters.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { city: { contains: search as string, mode: 'insensitive' } },
        { state: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pincode: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({ users });
  } catch (error: any) {
    console.error('Get users by role error:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Get user statistics
router.get('/stats/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    // Check permissions
    if (req.userRole !== UserRole.ADMIN && req.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        rating: true,
        totalRatings: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get contract statistics
    const contractStats = await prisma.contract.groupBy({
      by: ['status'],
      where: {
        OR: [
          { farmerId: userId },
          { buyerId: userId }
        ]
      },
      _count: true
    });

    // Get transaction statistics
    const transactionStats = await prisma.transaction.groupBy({
      by: ['status'],
      where: { userId },
      _count: true
    });

    res.json({
      user,
      contracts: contractStats,
      transactions: transactionStats
    });
  } catch (error: any) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Failed to fetch user statistics', error: error.message });
  }
});

// Get user profile with ratings
router.get('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        rating: true,
        totalRatings: true,
        createdAt: true,
        ratingsReceived: {
          include: {
            rater: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Last 10 ratings
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate rating distribution
    const allRatings = await prisma.farmerRating.findMany({
      where: { farmerId: userId },
      select: { rating: true }
    });

    const distribution = {
      5: allRatings.filter(r => r.rating === 5).length,
      4: allRatings.filter(r => r.rating === 4).length,
      3: allRatings.filter(r => r.rating === 3).length,
      2: allRatings.filter(r => r.rating === 2).length,
      1: allRatings.filter(r => r.rating === 1).length,
    };

    res.json({
      user: {
        ...user,
        ratingsReceived: undefined,
        averageRating: user.rating || 0,
        totalRatings: user.totalRatings || 0
      },
      ratings: user.ratingsReceived,
      distribution
    });
  } catch (error: any) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
});

// Update user (Admin only)
router.put('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Prevent updating sensitive fields
    const { password, ...allowedUpdates } = updates;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: allowedUpdates,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        createdAt: true
      }
    });

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// Delete user (Admin only) - Permanently deletes user and all related data
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === UserRole.ADMIN) {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    // Prevent admins from deleting themselves
    if (userId === req.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    console.log(`[Admin Delete] Starting permanent deletion of user: ${user.name} (${user.email})`);

    // Use a transaction to delete all related data
    await prisma.$transaction(async (tx) => {
      // 1. Delete all notifications where user is recipient or sender
      const deletedNotifications = await tx.notifications.deleteMany({
        where: {
          OR: [
            { recipientId: userId },
            { senderId: userId }
          ]
        }
      });
      console.log(`[Admin Delete] Deleted ${deletedNotifications.count} notifications`);

      // 2. Delete all ratings given and received
      const deletedRatings = await tx.farmerRating.deleteMany({
        where: {
          OR: [
            { farmerId: userId },
            { raterId: userId }
          ]
        }
      });
      console.log(`[Admin Delete] Deleted ${deletedRatings.count} ratings`);

      // 3. Delete all transactions
      const deletedTransactions = await tx.transaction.deleteMany({
        where: { userId }
      });
      console.log(`[Admin Delete] Deleted ${deletedTransactions.count} transactions`);

      // 4. Delete contract requests (as buyer or farmer)
      const deletedContractRequests = await tx.contractRequest.deleteMany({
        where: {
          OR: [
            { buyerId: userId },
            { farmerId: userId }
          ]
        }
      });
      console.log(`[Admin Delete] Deleted ${deletedContractRequests.count} contract requests`);

      // 5. Delete contracts (as buyer or farmer)
      // First delete transactions related to these contracts
      const contracts = await tx.contract.findMany({
        where: {
          OR: [
            { buyerId: userId },
            { farmerId: userId }
          ]
        },
        select: { id: true }
      });

      if (contracts.length > 0) {
        const contractIds = contracts.map(c => c.id);
        
        // Delete transactions for these contracts
        const deletedContractTransactions = await tx.transaction.deleteMany({
          where: { contractId: { in: contractIds } }
        });
        console.log(`[Admin Delete] Deleted ${deletedContractTransactions.count} contract-related transactions`);

        // Delete notifications related to these contracts
        const deletedContractNotifications = await tx.notifications.deleteMany({
          where: { contractId: { in: contractIds } }
        });
        console.log(`[Admin Delete] Deleted ${deletedContractNotifications.count} contract-related notifications`);

        // Delete the contracts
        const deletedContracts = await tx.contract.deleteMany({
          where: {
            OR: [
              { buyerId: userId },
              { farmerId: userId }
            ]
          }
        });
        console.log(`[Admin Delete] Deleted ${deletedContracts.count} contracts`);
      }

      // 6. Finally, delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    console.log(`[Admin Delete] Successfully deleted user ${user.name} and all related data`);

    res.json({ 
      message: `User ${user.name} and all associated data permanently deleted`,
      deletedUser: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// Change user password (Admin only)
router.put('/:id/password', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;
    const { password } = req.body;

    // Validate input
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing admin passwords
    if (user.role === UserRole.ADMIN && req.userId !== userId) {
      return res.status(403).json({ message: 'Cannot change other admin passwords' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
});

export default router;

