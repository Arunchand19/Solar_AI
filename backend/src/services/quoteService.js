const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getActiveSubsidyRule(category = 'residential') {
  const rule = await prisma.subsidyRule.findFirst({
    where: {
      category,
      isActive: true,
      effectiveFrom: { lte: new Date() },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }]
    },
    orderBy: { effectiveFrom: 'desc' }
  });
  return rule;
}

async function getActivePrices() {
  return prisma.priceConfig.findMany({
    where: {
      isActive: true,
      effectiveFrom: { lte: new Date() },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }]
    }
  });
}

async function getGenerationRate() {
  const config = await prisma.generationConfig.findFirst({
    where: { isActive: true },
    orderBy: { effectiveFrom: 'desc' }
  });
  return config?.unitsPerKwPerYear || 1400;
}

function calcSubsidy(systemKw, slabs, maxSubsidy) {
  const slabData = typeof slabs === 'string' ? JSON.parse(slabs) : slabs;
  let subsidy = 0;
  let remaining = systemKw;

  for (const slab of slabData) {
    if (remaining <= 0) break;
    const slabKw = Math.min(remaining, slab.upToKw);
    subsidy += slabKw * slab.ratePerKw;
    remaining -= slabKw;
  }

  return Math.min(subsidy, maxSubsidy);
}

async function calculateQuote(systemKw, category = 'residential') {
  const prices = await getActivePrices();
  const subsidyRule = await getActiveSubsidyRule(category);
  const unitsPerKwPerYear = await getGenerationRate();

  // Cost calculation from price config
  const panelPrice = prices.find(p => p.category === 'panel')?.pricePerUnit || 28000; // per kW
  const inverterPrice = prices.find(p => p.category === 'inverter')?.pricePerUnit || 8000; // per kW
  const bosPrice = prices.find(p => p.category === 'bos')?.pricePerUnit || 5000; // per kW
  const installPrice = prices.find(p => p.category === 'installation')?.pricePerUnit || 4000; // per kW

  const baseCost = systemKw * (panelPrice + inverterPrice + bosPrice + installPrice);

  let subsidyAmount = 0;
  if (subsidyRule) {
    subsidyAmount = calcSubsidy(systemKw, subsidyRule.slabs, subsidyRule.maxSubsidy);
  }

  const netCost = baseCost - subsidyAmount;
  const yearlyGeneration = systemKw * unitsPerKwPerYear;
  const avgTariff = 7.5; // ₹/unit average Maharashtra tariff
  const yearlyBillSaving = yearlyGeneration * avgTariff;
  const paybackYears = netCost / yearlyBillSaving;

  const panelWatt = 550;
  const panelCount = Math.ceil((systemKw * 1000) / panelWatt);

  return {
    systemSizeKw: systemKw,
    panelCount,
    panelWatt,
    inverterKw: systemKw,
    baseCost: Math.round(baseCost),
    subsidyAmount: Math.round(subsidyAmount),
    netCost: Math.round(netCost),
    yearlyGeneration: Math.round(yearlyGeneration),
    yearlyBillSaving: Math.round(yearlyBillSaving),
    paybackYears: Math.round(paybackYears * 10) / 10,
    subsidyRule
  };
}

module.exports = { calculateQuote, getActiveSubsidyRule, calcSubsidy };
