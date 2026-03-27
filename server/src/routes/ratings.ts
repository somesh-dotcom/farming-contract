import express from 'express';
import { prisma } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Get farmer's ratings and reviews
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    // Get farmer with rating stats
    const farmer = await prisma.user.findUnique({
      where: { id: farmerId },
      select: {
        id: true,
        name: true,
        rating: true,
        totalRatings: true,
        role: true
      }
    });
    
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    
    // Get all ratings for this farmer
    const ratings = await prisma.farmerRating.findMany({
      where: { farmerId },
      include: {
        rater: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Calculate rating distribution
    const distribution = {
      5: ratings.filter(r => r.rating === 5).length,
      4: ratings.filter(r => r.rating === 4).length,
      3: ratings.filter(r => r.rating === 3).length,
      2: ratings.filter(r => r.rating === 2).length,
      1: ratings.filter(r => r.rating === 1).length,
    };
    
    res.json({
      farmer,
      ratings,
      distribution,
      averageRating: farmer.rating || 0,
      totalRatings: farmer.totalRatings || 0
    });
  } catch (error: any) {
    console.error('Get farmer ratings error:', error);
    res.status(500).json({ message: 'Failed to fetch ratings', error: error.message });
  }
});

// Create rating for farmer (after contract completion)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { farmerId, rating, comment, contractId } = req.body;
    
    // Validation
    if (!farmerId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating (1-5) is required' });
    }
    
    // Only buyers can rate farmers
    if (req.userRole !== UserRole.BUYER) {
      return res.status(403).json({ message: 'Only buyers can rate farmers' });
    }
    
    // Verify farmer exists
    const farmer = await prisma.user.findUnique({
      where: { id: farmerId, role: UserRole.FARMER }
    });
    
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    
    // Check if there's a completed contract between this buyer and farmer
    const completedContract = await prisma.contract.findFirst({
      where: {
        farmerId,
        buyerId: req.userId,
        status: 'COMPLETED'
      }
    });
    
    if (!completedContract) {
      return res.status(403).json({ 
        message: 'Can only rate farmers after completing a contract' 
      });
    }
    
    // Check if user already rated this farmer
    const existingRating = await prisma.farmerRating.findFirst({
      where: {
        farmerId,
        raterId: req.userId
      }
    });
    
    if (existingRating) {
      return res.status(400).json({ 
        message: 'You have already rated this farmer. Rating can be updated instead.' 
      });
    }
    
    // Create the rating
    const newRating = await prisma.farmerRating.create({
      data: {
        farmerId,
        raterId: req.userId!,
        rating,
        comment: comment || null
      },
      include: {
        rater: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });
    
    // Get rater name for notification
    const rater = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { name: true }
    });
    
    // Update farmer's overall rating
    const allRatings = await prisma.farmerRating.findMany({
      where: { farmerId }
    });
    
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    
    await prisma.user.update({
      where: { id: farmerId },
      data: {
        rating: parseFloat(averageRating.toFixed(2)),
        totalRatings: allRatings.length
      }
    });
    
    // Create notification for farmer
    await prisma.notifications.create({
      data: {
        type: 'FARMER_RATED',
        title: 'New Rating Received',
        message: `You received a ${rating}-star rating from ${rater?.name || 'a buyer'}${comment ? ': ' + comment : ''}`,
        recipientId: farmerId,
        senderId: req.userId!,
        metadata: JSON.stringify({ ratingId: newRating.id, contractId })
      } as any
    });
    
    res.status(201).json({ 
      message: 'Rating submitted successfully',
      rating: newRating 
    });
  } catch (error: any) {
    console.error('Create rating error:', error);
    res.status(500).json({ message: 'Failed to submit rating', error: error.message });
  }
});

// Update rating (user can update their own rating)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    // Validation
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Find existing rating
    const existingRating = await prisma.farmerRating.findUnique({
      where: { id }
    });
    
    if (!existingRating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Only the person who gave the rating can update it
    if (existingRating.raterId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update rating
    const updatedRating = await prisma.farmerRating.update({
      where: { id },
      data: {
        ...(rating && { rating }),
        ...(comment !== undefined && { comment })
      },
      include: {
        rater: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });
    
    // Recalculate farmer's overall rating
    const allRatings = await prisma.farmerRating.findMany({
      where: { farmerId: existingRating.farmerId }
    });
    
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    
    await prisma.user.update({
      where: { id: existingRating.farmerId },
      data: {
        rating: parseFloat(averageRating.toFixed(2)),
        totalRatings: allRatings.length
      }
    });
    
    res.json({ 
      message: 'Rating updated successfully',
      rating: updatedRating 
    });
  } catch (error: any) {
    console.error('Update rating error:', error);
    res.status(500).json({ message: 'Failed to update rating', error: error.message });
  }
});

// Delete rating (admin only or rating owner)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const rating = await prisma.farmerRating.findUnique({
      where: { id }
    });
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Check permissions: admin or rating owner
    const canDelete = 
      req.userRole === UserRole.ADMIN || 
      rating.raterId === req.userId;
    
    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Delete the rating
    await prisma.farmerRating.delete({
      where: { id }
    });
    
    // Recalculate farmer's overall rating
    const allRatings = await prisma.farmerRating.findMany({
      where: { farmerId: rating.farmerId }
    });
    
    const averageRating = allRatings.length > 0 
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length 
      : 0;
    
    await prisma.user.update({
      where: { id: rating.farmerId },
      data: {
        rating: parseFloat(averageRating.toFixed(2)),
        totalRatings: allRatings.length
      }
    });
    
    res.json({ message: 'Rating deleted successfully' });
  } catch (error: any) {
    console.error('Delete rating error:', error);
    res.status(500).json({ message: 'Failed to delete rating', error: error.message });
  }
});

export default router;
