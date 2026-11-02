const router = require('express').Router();
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const { calculateQuote } = require('../services/quoteService');
const { generateQuotePDF } = require('../services/pdfService');

const prisma = new PrismaClient();

function genQuoteNumber() {
  return 'QT-' + Date.now().toString().slice(-8);
}

// Create quote for a lead
router.post('/', auth, requireRole('sales', 'admin'), async (req, res) => {
  const { leadId, systemSizeKw, category } = req.body;
  if (!leadId || !systemSizeKw) return res.status(400).json({ error: 'leadId and systemSizeKw required' });

  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const calc = await calculateQuote(parseFloat(systemSizeKw), category || 'residential');

    const quote = await prisma.quote.create({
      data: {
        quoteNumber: genQuoteNumber(),
        leadId,
        createdById: req.user.id,
        systemSizeKw: calc.systemSizeKw,
        panelCount: calc.panelCount,
        panelWatt: calc.panelWatt,
        inverterKw: calc.inverterKw,
        baseCost: calc.baseCost,
        subsidyAmount: calc.subsidyAmount,
        netCost: calc.netCost,
        yearlyGeneration: calc.yearlyGeneration,
        yearlyBillSaving: calc.yearlyBillSaving,
        paybackYears: calc.paybackYears,
        subsidyRuleId: calc.subsidyRule?.id || null,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    // Generate PDF
    const pdfPath = path.join(__dirname, '../../uploads/quotes', `${quote.quoteNumber}.pdf`);
    await generateQuotePDF({ ...quote, createdAt: new Date() }, lead, pdfPath);

    const updated = await prisma.quote.update({
      where: { id: quote.id },
      data: { pdfPath, status: 'sent' }
    });

    await prisma.lead.update({ where: { id: leadId }, data: { status: 'quoted' } });

    res.status(201).json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get quote by id
router.get('/:id', auth, async (req, res) => {
  const quote = await prisma.quote.findUnique({
    where: { id: req.params.id },
    include: { lead: true, subsidyRule: true }
  });
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  res.json(quote);
});

// Get quotes for a lead
router.get('/lead/:leadId', auth, async (req, res) => {
  const quotes = await prisma.quote.findMany({
    where: { leadId: req.params.leadId },
    include: { subsidyRule: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(quotes);
});

// Preview quote calculation (no save)
router.post('/preview', auth, requireRole('sales', 'admin'), async (req, res) => {
  const { systemSizeKw, category } = req.body;
  if (!systemSizeKw) return res.status(400).json({ error: 'systemSizeKw required' });
  try {
    const calc = await calculateQuote(parseFloat(systemSizeKw), category || 'residential');
    res.json(calc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Download PDF
router.get('/:id/pdf', async (req, res) => {
  const quote = await prisma.quote.findUnique({ where: { id: req.params.id } });
  if (!quote?.pdfPath) return res.status(404).json({ error: 'PDF not found' });
  res.download(quote.pdfPath, `Quote-${quote.quoteNumber}.pdf`);
});

module.exports = router;
