import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';
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
    if (req.userId !== userId && req.userRole !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [contracts, transactions, totalContractValue, totalTransactionAmount] = await Promise.all([
      prisma.contract.count({
        where: user.role === UserRole.FARMER
          ? { farmerId: userId }
          : user.role === UserRole.BUYER
          ? { buyerId: userId }
          : {}
      }),
      prisma.transaction.count({
        where: { userId }
      }),
      prisma.contract.aggregate({
        where: user.role === UserRole.FARMER
          ? { farmerId: userId }
          : user.role === UserRole.BUYER
          ? { buyerId: userId }
          : {},
        _sum: { totalValue: true }
      }),
      prisma.transaction.aggregate({
        where: { userId, status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ]);

    res.json({
      user,
      stats: {
        totalContracts: contracts,
        totalTransactions: transactions,
        totalContractValue: totalContractValue._sum.totalValue || 0,
        totalTransactionAmount: totalTransactionAmount._sum.amount || 0
      }
    });
  } catch (error: any) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Failed to fetch user statistics', error: error.message });
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

// Delete user (Admin only)
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

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });
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

