const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// Subsidy rules
router.get('/subsidy-rules', auth, requireRole('admin', 'sales'), async (req, res) => {
  const rules = await prisma.subsidyRule.findMany({ orderBy: { effectiveFrom: 'desc' } });
  res.json(rules);
});

router.post('/subsidy-rules', auth, requireRole('admin'), async (req, res) => {
  const { name, category, effectiveFrom, effectiveTo, slabs, maxSubsidy } = req.body;
  const rule = await prisma.subsidyRule.create({
    data: { name, category, effectiveFrom: new Date(effectiveFrom), effectiveTo: effectiveTo ? new Date(effectiveTo) : null, slabs: JSON.stringify(slabs), maxSubsidy: parseFloat(maxSubsidy) }
  });
  res.status(201).json(rule);
});

router.patch('/subsidy-rules/:id', auth, requireRole('admin'), async (req, res) => {
  const { isActive, effectiveTo } = req.body;
  const rule = await prisma.subsidyRule.update({
    where: { id: req.params.id },
    data: { isActive, effectiveTo: effectiveTo ? new Date(effectiveTo) : undefined }
  });
  res.json(rule);
});

// Price config
router.get('/prices', auth, requireRole('admin', 'sales'), async (req, res) => {
  const prices = await prisma.priceConfig.findMany({ orderBy: { effectiveFrom: 'desc' } });
  res.json(prices);
});

router.post('/prices', auth, requireRole('admin'), async (req, res) => {
  const { itemName, category, pricePerUnit, unit, effectiveFrom } = req.body;
  const price = await prisma.priceConfig.create({
    data: { itemName, category, pricePerUnit: parseFloat(pricePerUnit), unit, effectiveFrom: new Date(effectiveFrom) }
  });
  res.status(201).json(price);
});

router.patch('/prices/:id', auth, requireRole('admin'), async (req, res) => {
  const { isActive, pricePerUnit } = req.body;
  const price = await prisma.priceConfig.update({
    where: { id: req.params.id },
    data: { isActive, pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined }
  });
  res.json(price);
});

// Generation config
router.get('/generation-config', auth, requireRole('admin', 'sales'), async (req, res) => {
  const config = await prisma.generationConfig.findFirst({ where: { isActive: true }, orderBy: { effectiveFrom: 'desc' } });
  res.json(config || { unitsPerKwPerYear: 1400 });
});

router.post('/generation-config', auth, requireRole('admin'), async (req, res) => {
  const { unitsPerKwPerYear } = req.body;
  await prisma.generationConfig.updateMany({ where: { isActive: true }, data: { isActive: false } });
  const config = await prisma.generationConfig.create({
    data: { unitsPerKwPerYear: parseFloat(unitsPerKwPerYear), effectiveFrom: new Date() }
  });
  res.status(201).json(config);
});

// Users list
router.get('/users', auth, requireRole('admin'), async (req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
  res.json(users);
});

module.exports = router;
