import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '@/middleware/auth.middleware';
import { HotOffer, OfferStatus } from '@/models/HotOffer.model';
import { User } from '@/models/User.model';
import { UserRole } from 'shared';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all active offers (for businesses)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = { status: OfferStatus.ACTIVE };

    // Filter by category
    if (req.query.category) {
      filter.targetCategories = req.query.category;
    }

    // Filter by platform
    if (req.query.platform) {
      filter.platforms = req.query.platform;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseInt(req.query.minPrice as string);
      if (req.query.maxPrice) filter.price.$lte = parseInt(req.query.maxPrice as string);
    }

    const [offers, total] = await Promise.all([
      HotOffer.find(filter)
        .populate('influencerId', 'firstName lastName avatar socialMediaProfiles')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      HotOffer.countDocuments(filter),
    ]);

    res.json({
      offers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get my offers (for influencers)
router.get('/my-offers', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user || user.role !== UserRole.INFLUENCER) {
      return res.status(403).json({ error: 'Only influencers can access their offers' });
    }

    const offers = await HotOffer.find({ influencerId: req.user!.id })
      .sort({ createdAt: -1 });

    res.json({ offers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single offer
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const offer = await HotOffer.findById(req.params.id)
      .populate('influencerId', 'firstName lastName avatar bio socialMediaProfiles');

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Increment view count if viewer is not the owner
    if (offer.influencerId._id.toString() !== req.user!.id) {
      offer.viewCount += 1;
      await offer.save();
    }

    res.json({ offer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new offer (influencers only)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user || user.role !== UserRole.INFLUENCER) {
      return res.status(403).json({ error: 'Only influencers can create offers' });
    }

    const offer = new HotOffer({
      ...req.body,
      influencerId: req.user!.id,
    });

    await offer.save();
    res.status(201).json({ offer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update offer (influencers only - their own offers)
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const offer = await HotOffer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    if (offer.influencerId.toString() !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to update this offer' });
    }

    // Don't allow changing influencerId
    delete req.body.influencerId;

    Object.assign(offer, req.body);
    await offer.save();

    res.json({ offer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete offer (influencers only - their own offers)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const offer = await HotOffer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    if (offer.influencerId.toString() !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to delete this offer' });
    }

    await offer.deleteOne();
    res.json({ message: 'Offer deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Express interest in an offer (businesses only)
router.post('/:id/interest', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user || user.role !== UserRole.BUSINESS) {
      return res.status(403).json({ error: 'Only businesses can express interest in offers' });
    }

    const offer = await HotOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Check if already interested
    if (offer.interestedBusinesses.includes(req.user!.id as any)) {
      return res.status(400).json({ error: 'Already expressed interest' });
    }

    offer.interestedBusinesses.push(req.user!.id as any);
    await offer.save();

    res.json({ message: 'Interest expressed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get interested businesses (influencers only - their own offers)
router.get('/:id/interested', async (req: AuthRequest, res: Response) => {
  try {
    const offer = await HotOffer.findById(req.params.id)
      .populate('interestedBusinesses', 'firstName lastName avatar companyName');

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    if (offer.influencerId.toString() !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ businesses: offer.interestedBusinesses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
