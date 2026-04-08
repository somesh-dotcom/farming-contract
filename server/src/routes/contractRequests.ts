import express from 'express';
import { prisma } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole, ContractRequestStatus, ContractStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all contract requests (filtered by role)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status, buyerId, farmerId } = req.query;
    const filters: any = {};

    // Apply filters based on user role - users can only see their own requests
    if (req.userRole === UserRole.BUYER) {
      // Buyers see only requests they sent
      filters.buyerId = req.userId;
      console.log(`[Buyer Request] Fetching requests for buyer ID: ${req.userId}`);
    } else if (req.userRole === UserRole.FARMER) {
      // Farmers see only requests sent to them
      filters.farmerId = req.userId;
      console.log(`[Farmer Request] Fetching requests for farmer ID: ${req.userId}`);
    } else if (req.userRole === UserRole.ADMIN) {
      // Admins can see all requests
      if (buyerId) filters.buyerId = buyerId;
      if (farmerId) filters.farmerId = farmerId;
      console.log(`[Admin Request] Fetching all requests with filters:`, filters);
    }

    if (status) filters.status = status;

    const requests = await prisma.contractRequest.findMany({
      where: filters,
      include: {
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
        product: true,
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
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ requests });
  } catch (error: any) {
    console.error('Get contract requests error:', error);
    res.status(500).json({ message: 'Failed to fetch contract requests', error: error.message });
  }
});

// Get single contract request
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const request = await prisma.contractRequest.findUnique({
      where: { id: req.params.id },
      include: {
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
        product: true,
        contract: true
      }
    });

    if (!request) {
      return res.status(404).json({ message: 'Contract request not found' });
    }

    // Check access permission
    if (
      req.userRole !== UserRole.ADMIN &&
      request.buyerId !== req.userId &&
      request.farmerId !== req.userId
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ request });
  } catch (error: any) {
    console.error('Get contract request error:', error);
    res.status(500).json({ message: 'Failed to fetch contract request', error: error.message });
  }
});

// Create contract request (Buyers only)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { 
      farmerId, 
      productId, 
      quantity, 
      unit, 
      proposedPrice, 
      startDate, 
      deliveryDate, 
      terms, 
      location,
      area 
    } = req.body;

    // Validation
    if (!farmerId || !productId || !quantity || !unit || !proposedPrice || !startDate || !deliveryDate) {
      console.error('[ContractRequest] Missing required fields:', { 
        farmerId, 
        productId, 
        quantity, 
        unit, 
        proposedPrice, 
        startDate, 
        deliveryDate 
      });
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Only buyers can create contract requests
    if (req.userRole !== UserRole.BUYER) {
      console.error('[ContractRequest] User is not a buyer. Role:', req.userRole);
      return res.status(403).json({ message: 'Only buyers can create contract requests' });
    }

    console.log('[ContractRequest] Creating request with data:', {
      buyerId: req.userId,
      farmerId,
      productId,
      quantity,
      unit,
      proposedPrice,
      startDate,
      deliveryDate,
      location,
      area
    });

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      console.error('[ContractRequest] Product not found:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify farmer exists and is actually a farmer
    const farmer = await prisma.user.findUnique({
      where: { id: farmerId, role: UserRole.FARMER }
    });

    if (!farmer) {
      console.error('[ContractRequest] Farmer not found or not a farmer role:', farmerId);
      return res.status(404).json({ message: 'Farmer not found or invalid role' });
    }

    // Get buyer name for notification
    const buyer = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { name: true }
    });

    const totalValue = quantity * proposedPrice;

    console.log('[ContractRequest] Creating contract request in database...');
    
    const request = await prisma.contractRequest.create({
      data: {
        buyerId: req.userId!,
        farmerId,
        productId,
        quantity,
        unit,
        proposedPrice,
        startDate: new Date(startDate),
        deliveryDate: new Date(deliveryDate),
        terms,
        location,
        area,
        status: ContractRequestStatus.PENDING
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        farmer: {
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

    console.log('[ContractRequest] Contract request created successfully:', request.id);

    // Create notification for farmer
    await prisma.notifications.create({
      data: {
        id: uuidv4(),
        type: 'CONTRACT_REQUESTED',
        title: 'New Contract Request',
        message: `You have received a new contract request from ${buyer?.name || 'a buyer'} for ${product.name}`,
        recipientId: farmerId,
        senderId: req.userId!,
        metadata: JSON.stringify({ requestId: request.id }),
        updatedAt: new Date()
      }
    });

    res.status(201).json({ 
      message: 'Contract request sent successfully. Waiting for farmer approval.', 
      request 
    });
  } catch (error: any) {
    console.error('[ContractRequest] CREATE ERROR:', error);
    console.error('[ContractRequest] Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A similar request already exists' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ message: 'Invalid reference data' });
    }
    
    res.status(500).json({ 
      message: 'Failed to create contract request. Please try again.', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Accept contract request (Farmer or Admin only) - Creates actual contract
router.patch('/:id/accept', authenticate, async (req: AuthRequest, res) => {
  try {
    const requestId = req.params.id;

    const request = await prisma.contractRequest.findUnique({
      where: { id: requestId },
      include: {
        buyer: true,
        farmer: true,
        product: true
      }
    });

    if (!request) {
      return res.status(404).json({ message: 'Contract request not found' });
    }

    if (request.status !== ContractRequestStatus.PENDING) {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    // Only farmers (owner) or admins can accept
    if (req.userRole !== UserRole.ADMIN && request.farmerId !== req.userId) {
      return res.status(403).json({ message: 'Only the farmer or admin can accept this request' });
    }

    // Create the actual contract
    const contract = await prisma.contract.create({
      data: {
        farmerId: request.farmerId,
        buyerId: request.buyerId,
        productId: request.productId,
        quantity: request.quantity,
        unit: request.unit,
        pricePerUnit: request.proposedPrice,
        totalValue: request.quantity * request.proposedPrice,
        startDate: request.startDate,
        deliveryDate: request.deliveryDate,
        terms: request.terms,
        location: request.location,
        status: ContractStatus.PENDING
      },
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

    // Update the request status and link contract
    const updatedRequest = await prisma.contractRequest.update({
      where: { id: requestId },
      data: {
        status: ContractRequestStatus.ACCEPTED,
        contractId: contract.id
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        farmer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: true,
        contract: true
      }
    });

    // Create notification for buyer
    await prisma.notifications.create({
      data: {
        id: uuidv4(),
        type: 'CONTRACT_REQUEST_ACCEPTED',
        title: 'Contract Request Accepted',
        message: `Your contract request for ${request.product.name} has been accepted by ${request.farmer.name}`,
        recipientId: request.buyerId,
        senderId: request.farmerId,
        metadata: JSON.stringify({ requestId: request.id, contractId: contract.id }),
        updatedAt: new Date()
      }
    });

    res.json({ 
      message: 'Contract request accepted and contract created successfully', 
      request: updatedRequest,
      contract 
    });
  } catch (error: any) {
    console.error('Accept contract request error:', error);
    res.status(500).json({ message: 'Failed to accept contract request', error: error.message });
  }
});

// Reject contract request (Farmer or Admin only)
router.patch('/:id/reject', authenticate, async (req: AuthRequest, res) => {
  try {
    const requestId = req.params.id;
    const { reason } = req.body;

    const request = await prisma.contractRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return res.status(404).json({ message: 'Contract request not found' });
    }

    if (request.status !== ContractRequestStatus.PENDING) {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    // Only farmers (owner) or admins can reject
    if (req.userRole !== UserRole.ADMIN && request.farmerId !== req.userId) {
      return res.status(403).json({ message: 'Only the farmer or admin can reject this request' });
    }

    const updatedRequest = await prisma.contractRequest.update({
      where: { id: requestId },
      data: {
        status: ContractRequestStatus.REJECTED,
        rejectionReason: reason || null
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        farmer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: true
      }
    });

    // Create notification for buyer
    await prisma.notifications.create({
      data: {
        id: uuidv4(),
        type: 'CONTRACT_REQUEST_REJECTED',
        title: 'Contract Request Rejected',
        message: `Your contract request has been rejected${reason ? ': ' + reason : ''}`,
        recipientId: request.buyerId,
        senderId: request.farmerId,
        metadata: JSON.stringify({ requestId: request.id, reason }),
        updatedAt: new Date()
      }
    });

    res.json({ message: 'Contract request rejected', request: updatedRequest });
  } catch (error: any) {
    console.error('Reject contract request error:', error);
    res.status(500).json({ message: 'Failed to reject contract request', error: error.message });
  }
});

// Cancel contract request (Buyer only, if pending)
router.patch('/:id/cancel', authenticate, async (req: AuthRequest, res) => {
  try {
    const requestId = req.params.id;

    const request = await prisma.contractRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return res.status(404).json({ message: 'Contract request not found' });
    }

    if (request.status !== ContractRequestStatus.PENDING) {
      return res.status(400).json({ message: 'Only pending requests can be cancelled' });
    }

    // Only buyers can cancel their own requests
    if (request.buyerId !== req.userId) {
      return res.status(403).json({ message: 'Only the buyer can cancel this request' });
    }

    const updatedRequest = await prisma.contractRequest.update({
      where: { id: requestId },
      data: {
        status: ContractRequestStatus.CANCELLED
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        farmer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: true
      }
    });

    res.json({ message: 'Contract request cancelled', request: updatedRequest });
  } catch (error: any) {
    console.error('Cancel contract request error:', error);
    res.status(500).json({ message: 'Failed to cancel contract request', error: error.message });
  }
});

export default router;
