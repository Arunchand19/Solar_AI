const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Users
  const adminPass = await bcrypt.hash('admin123', 10);
  const salesPass = await bcrypt.hash('sales123', 10);
  const homePass = await bcrypt.hash('home123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@solarsmart.in' },
    update: {},
    create: { name: 'Admin User', email: 'admin@solarsmart.in', password: adminPass, role: 'admin', phone: '9876543210' }
  });

  const sales = await prisma.user.upsert({
    where: { email: 'sales@solarsmart.in' },
    update: {},
    create: { name: 'Rahul Sharma', email: 'sales@solarsmart.in', password: salesPass, role: 'sales', phone: '9876543211' }
  });

  const homeowner = await prisma.user.upsert({
    where: { email: 'prashant@example.com' },
    update: {},
    create: { name: 'Prashant Wankhede', email: 'prashant@example.com', password: homePass, role: 'homeowner', phone: '9876543212' }
  });

  // Subsidy rule (PM Surya Ghar)
  const subsidyRule = await prisma.subsidyRule.upsert({
    where: { id: 'subsidy-pm-surya-ghar' },
    update: {},
    create: {
      id: 'subsidy-pm-surya-ghar',
      name: 'PM Surya Ghar Muft Bijli Yojana',
      category: 'residential',
      effectiveFrom: new Date('2024-02-13'),
      slabs: JSON.stringify([
        { upToKw: 2, ratePerKw: 30000 },
        { upToKw: 1, ratePerKw: 18000 }
      ]),
      maxSubsidy: 78000,
      isActive: true
    }
  });

  // Price config
  const priceItems = [
    { itemName: 'Solar Panel (550W)', category: 'panel', pricePerUnit: 28000, unit: 'per kW' },
    { itemName: 'String Inverter', category: 'inverter', pricePerUnit: 8000, unit: 'per kW' },
    { itemName: 'Balance of System (BOS)', category: 'bos', pricePerUnit: 5000, unit: 'per kW' },
    { itemName: 'Installation & Civil', category: 'installation', pricePerUnit: 4000, unit: 'per kW' },
  ];

  for (const item of priceItems) {
    await prisma.priceConfig.upsert({
      where: { id: `price-${item.category}` },
      update: {},
      create: { id: `price-${item.category}`, ...item, effectiveFrom: new Date('2024-01-01') }
    });
  }

  // Generation config
  await prisma.generationConfig.upsert({
    where: { id: 'gen-default' },
    update: {},
    create: { id: 'gen-default', unitsPerKwPerYear: 1400, effectiveFrom: new Date('2024-01-01') }
  });

  // Sample leads
  const sampleLeads = [
    {
      leadId: 'LD-30881', name: 'Prashant Wankhede', email: 'prashant@example.com',
      phone: '9876543212', pincode: '440001', ownerOrTenant: 'owner',
      roofType: 'flat', roofArea: 400, monthlyBill: 3200, avgUnits: 340,
      score: 'High', scoreReason: 'High consumption, excellent solar candidate',
      recommendedKw: 3, status: 'new', userId: homeowner.id,
      consumerNumber: 'MSEDCL-1234567', tariff: 'LT-1 Residential', sanctionedLoad: 5.0,
      aiUnits: 340, aiConfidence: 0.92, aiConfirmed: true
    },
    {
      leadId: 'LD-30902', name: 'Rohit Meshram', email: 'rohit@example.com',
      phone: '9876543213', pincode: '440010', ownerOrTenant: 'tenant',
      roofType: 'flat', roofArea: 200, monthlyBill: 1900, avgUnits: 210,
      score: 'Low', scoreReason: 'Tenant cannot install solar panels',
      recommendedKw: null, status: 'contacted'
    },
    {
      leadId: 'LD-30915', name: 'Ayesha Siddiqui', email: 'ayesha@example.com',
      phone: '9876543214', pincode: '440012', ownerOrTenant: 'owner',
      roofType: 'sloped', roofArea: 150, monthlyBill: 650, avgUnits: 85,
      score: 'Low', scoreReason: 'Monthly bill too low for viable solar installation',
      recommendedKw: 1, status: 'new'
    },
    {
      leadId: 'LD-30920', name: 'Vijay Deshmukh', email: 'vijay@example.com',
      phone: '9876543215', pincode: '440015', ownerOrTenant: 'owner',
      roofType: 'flat', roofArea: 600, monthlyBill: 5500, avgUnits: 580,
      score: 'High', scoreReason: 'High consumption, excellent solar candidate',
      recommendedKw: 5, status: 'surveyed',
      consumerNumber: 'MSEDCL-7654321', tariff: 'LT-2 Commercial', sanctionedLoad: 10.0,
      aiUnits: 580, aiConfidence: 0.88, aiConfirmed: true
    },
    {
      leadId: 'LD-30935', name: 'Sunita Patil', email: 'sunita@example.com',
      phone: '9876543216', pincode: '440022', ownerOrTenant: 'owner',
      roofType: 'flat', roofArea: 300, monthlyBill: 2800, avgUnits: 295,
      score: 'Medium', scoreReason: 'Moderate consumption, good solar candidate',
      recommendedKw: 2.5, status: 'quoted',
      consumerNumber: 'MSEDCL-9876543', tariff: 'LT-1 Residential', sanctionedLoad: 5.0,
      aiUnits: 295, aiConfidence: 0.79, aiConfirmed: true
    },
  ];

  const createdLeads = [];
  for (const lead of sampleLeads) {
    const created = await prisma.lead.upsert({
      where: { leadId: lead.leadId },
      update: {},
      create: lead
    });
    createdLeads.push(created);
  }

  // Create a quote for Prashant
  const prashantLead = createdLeads[0];
  const existingQuote = await prisma.quote.findFirst({ where: { leadId: prashantLead.id } });
  if (!existingQuote) {
    await prisma.quote.create({
      data: {
        quoteNumber: 'QT-30881001',
        leadId: prashantLead.id,
        createdById: sales.id,
        systemSizeKw: 3,
        panelCount: 6,
        panelWatt: 550,
        inverterKw: 3,
        baseCost: 135000,
        subsidyAmount: 78000,
        netCost: 57000,
        yearlyGeneration: 4200,
        yearlyBillSaving: 31500,
        paybackYears: 1.8,
        subsidyRuleId: subsidyRule.id,
        status: 'sent',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // Create a project for Vijay
  const vijayLead = createdLeads[3];
  const existingProject = await prisma.project.findUnique({ where: { leadId: vijayLead.id } });
  if (!existingProject) {
    const project = await prisma.project.create({
      data: {
        projectId: 'PRJ-30920',
        leadId: vijayLead.id,
        customerToken: uuidv4(),
        status: 'installation',
        advancePaid: true,
        advanceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      }
    });

    await prisma.statusHistory.createMany({
      data: [
        { projectId: project.id, fromStatus: 'advance_pending', toStatus: 'advance_paid', note: 'Advance of ₹25,000 received', changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { projectId: project.id, fromStatus: 'advance_paid', toStatus: 'survey_done', note: 'Roof survey completed', changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { projectId: project.id, fromStatus: 'survey_done', toStatus: 'design_approved', note: 'Design approved by customer', changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { projectId: project.id, fromStatus: 'design_approved', toStatus: 'installation', note: 'Installation started', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      ]
    });
  }

  console.log('✅ Seed complete!');
  console.log('Demo logins:');
  console.log('  Admin:    admin@solarsmart.in / admin123');
  console.log('  Sales:    sales@solarsmart.in / sales123');
  console.log('  Customer: prashant@example.com / home123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
