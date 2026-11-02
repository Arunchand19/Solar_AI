const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const { readBillWithAI, scoreLead, calcRecommendedKw } = require('../services/aiService');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/bills')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  }
});

function genLeadId() {
  return 'LD-' + Math.floor(10000 + Math.random() * 90000);
}

// Public: submit lead form
router.post('/', upload.single('billPhoto'), [
  body('name').notEmpty().trim(),
  body('phone').matches(/^[6-9]\d{9}$/),
  body('pincode').matches(/^\d{6}$/),
  body('ownerOrTenant').isIn(['owner', 'tenant']),
  body('roofType').isIn(['flat', 'sloped', 'mixed']),
  body('roofArea').isFloat({ min: 50 }),
  body('monthlyBill').isFloat({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, phone, pincode, ownerOrTenant, roofType, roofArea, monthlyBill, avgUnits } = req.body;

  try {
    let aiData = null;
    let billPhotoPath = null;

    if (req.file) {
      billPhotoPath = req.file.path;
      aiData = await readBillWithAI(req.file.path);
    }

    const units = aiData?.avgUnits || parseFloat(avgUnits) || null;
    const recommendedKw = calcRecommendedKw(units || parseFloat(monthlyBill) / 9.5);
    const scoreResult = scoreLead({ ownerOrTenant, monthlyBill: parseFloat(monthlyBill), avgUnits: units, recommendedKw });

    const lead = await prisma.lead.create({
      data: {
        leadId: genLeadId(),
        name, email, phone, pincode,
        ownerOrTenant, roofType,
        roofArea: parseFloat(roofArea),
        monthlyBill: parseFloat(monthlyBill),
        avgUnits: units,
        billPhotoPath,
        consumerNumber: aiData?.consumerNumber,
        tariff: aiData?.tariff,
        sanctionedLoad: aiData?.sanctionedLoad,
        aiUnits: aiData?.avgUnits,
        aiConfidence: aiData?.confidence,
        aiRawResponse: aiData ? JSON.stringify(aiData) : null,
        aiConfirmed: false,
        score: scoreResult.score,
        scoreReason: scoreResult.reason,
        recommendedKw: scoreResult.recommendedKw,
        status: 'new',
        userId: req.user?.id || null
      }
    });

    res.status(201).json({
      lead,
      aiData: aiData?.error ? null : aiData,
      aiError: aiData?.error || null,
      needsConfirmation: aiData && !aiData.error && aiData.confidence < 0.75
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Sales: get all leads
router.get('/', auth, requireRole('sales', 'admin'), async (req, res) => {
  const { status, score, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  if (score) where.score = score;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      include: { quotes: { select: { id: true, status: true, netCost: true } } }
    }),
    prisma.lead.count({ where })
  ]);

  res.json({ leads, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// Get single lead
router.get('/:id', auth, async (req, res) => {
  const lead = await prisma.lead.findUnique({
    where: { id: req.params.id },
    include: { quotes: true, project: true }
  });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  if (req.user.role === 'homeowner' && lead.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  res.json(lead);
});

// Confirm AI data
router.patch('/:id/confirm-ai', auth, requireRole('sales', 'admin'), async (req, res) => {
  const { consumerNumber, tariff, sanctionedLoad, aiUnits, avgUnits } = req.body;
  const units = aiUnits || avgUnits;
  const recommendedKw = calcRecommendedKw(units);

  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  const scoreResult = scoreLead({ ownerOrTenant: lead.ownerOrTenant, monthlyBill: lead.monthlyBill, avgUnits: units, recommendedKw });

  const updated = await prisma.lead.update({
    where: { id: req.params.id },
    data: { consumerNumber, tariff, sanctionedLoad: parseFloat(sanctionedLoad), aiUnits: parseFloat(units), avgUnits: parseFloat(units), aiConfirmed: true, recommendedKw, score: scoreResult.score, scoreReason: scoreResult.reason }
  });
  res.json(updated);
});

// Update lead status
router.patch('/:id/status', auth, requireRole('sales', 'admin'), async (req, res) => {
  const { status, notes } = req.body;
  const updated = await prisma.lead.update({
    where: { id: req.params.id },
    data: { status, notes, updatedAt: new Date() }
  });
  res.json(updated);
});

// Dashboard stats
router.get('/stats/summary', auth, requireRole('sales', 'admin'), async (req, res) => {
  const [total, high, medium, low, converted] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { score: 'High' } }),
    prisma.lead.count({ where: { score: 'Medium' } }),
    prisma.lead.count({ where: { score: 'Low' } }),
    prisma.lead.count({ where: { status: 'converted' } }),
  ]);
  res.json({ total, high, medium, low, converted });
});

module.exports = router;
