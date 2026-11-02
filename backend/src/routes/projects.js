const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/docs')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const STATUS_ORDER = [
  'advance_pending', 'advance_paid', 'survey_done', 'design_approved',
  'installation', 'net_metering', 'subsidy_applied', 'subsidy_credited', 'completed'
];

const STATUS_LABELS = {
  advance_pending: 'Advance Pending',
  advance_paid: 'Advance Paid',
  survey_done: 'Survey Done',
  design_approved: 'Design Approved',
  installation: 'Installation',
  net_metering: 'Net Metering',
  subsidy_applied: 'Subsidy Applied',
  subsidy_credited: 'Subsidy Credited',
  completed: 'Completed'
};

// Create project from lead
router.post('/', auth, requireRole('sales', 'admin'), async (req, res) => {
  const { leadId } = req.body;
  if (!leadId) return res.status(400).json({ error: 'leadId required' });

  const existing = await prisma.project.findUnique({ where: { leadId } });
  if (existing) return res.status(400).json({ error: 'Project already exists for this lead' });

  const project = await prisma.project.create({
    data: {
      projectId: 'PRJ-' + Date.now().toString().slice(-6),
      leadId,
      customerToken: uuidv4(),
      status: 'advance_pending'
    },
    include: { lead: true }
  });

  await prisma.lead.update({ where: { id: leadId }, data: { status: 'converted' } });
  res.status(201).json(project);
});

// Get all projects (sales/admin)
router.get('/', auth, requireRole('sales', 'admin'), async (req, res) => {
  const { status } = req.query;
  const projects = await prisma.project.findMany({
    where: status ? { status } : {},
    include: { lead: { include: { quotes: { take: 1, orderBy: { createdAt: 'desc' } } } }, documents: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(projects);
});

// Get project by id
router.get('/:id', auth, async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { lead: { include: { quotes: true } }, documents: true, statusHistory: { orderBy: { changedAt: 'desc' } } }
  });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json({ ...project, statusLabels: STATUS_LABELS, statusOrder: STATUS_ORDER });
});

// Public: customer status link
router.get('/status/:token', async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { customerToken: req.params.token },
    include: {
      lead: { select: { name: true, recommendedKw: true } },
      statusHistory: { orderBy: { changedAt: 'asc' } }
    }
  });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const currentIdx = STATUS_ORDER.indexOf(project.status);
  res.json({
    projectId: project.projectId,
    customerName: project.lead.name,
    systemKw: project.lead.recommendedKw,
    status: project.status,
    statusLabel: STATUS_LABELS[project.status],
    progress: Math.round(((currentIdx + 1) / STATUS_ORDER.length) * 100),
    statusOrder: STATUS_ORDER,
    statusLabels: STATUS_LABELS,
    history: project.statusHistory
  });
});

// Update project status
router.patch('/:id/status', auth, requireRole('sales', 'admin'), async (req, res) => {
  const { status, note } = req.body;
  if (!STATUS_ORDER.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'Not found' });

  const dateFields = {
    advance_paid: { advancePaid: true, advanceDate: new Date() },
    installation: { installDate: new Date() },
    net_metering: { netMeteringDate: new Date() },
    subsidy_applied: { subsidyApplied: true, subsidyDate: new Date() },
    subsidy_credited: { subsidyCredited: true, subsidyCreditDate: new Date() },
  };

  await prisma.statusHistory.create({
    data: { projectId: project.id, fromStatus: project.status, toStatus: status, note }
  });

  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: { status, notes: note, ...(dateFields[status] || {}) },
    include: { lead: true, documents: true, statusHistory: { orderBy: { changedAt: 'desc' } } }
  });

  res.json({ ...updated, statusLabels: STATUS_LABELS, statusOrder: STATUS_ORDER });
});

// Upload document
router.post('/:id/documents', auth, requireRole('sales', 'admin'), upload.single('file'), async (req, res) => {
  const { name, docType } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const doc = await prisma.document.create({
    data: { projectId: req.params.id, name, filePath: req.file.path, docType }
  });
  res.status(201).json(doc);
});

// Stuck projects (no status change in 7+ days)
router.get('/dashboard/stuck', auth, requireRole('sales', 'admin'), async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const stuck = await prisma.project.findMany({
    where: { updatedAt: { lt: sevenDaysAgo }, status: { notIn: ['completed', 'subsidy_credited'] } },
    include: { lead: { select: { name: true, phone: true } } },
    orderBy: { updatedAt: 'asc' }
  });
  res.json(stuck);
});

module.exports = router;
