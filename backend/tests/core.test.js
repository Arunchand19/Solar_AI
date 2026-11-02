const { scoreLead, calcRecommendedKw } = require('../src/services/aiService');
const { calcSubsidy } = require('../src/services/quoteService');

describe('Lead Scoring', () => {
  test('tenant always scores Low', () => {
    const result = scoreLead({ ownerOrTenant: 'tenant', monthlyBill: 5000, avgUnits: 500 });
    expect(result.score).toBe('Low');
    expect(result.recommendedKw).toBeNull();
  });

  test('bill < 1000 scores Low', () => {
    const result = scoreLead({ ownerOrTenant: 'owner', monthlyBill: 650, avgUnits: 85 });
    expect(result.score).toBe('Low');
  });

  test('bill >= 2500 scores High', () => {
    const result = scoreLead({ ownerOrTenant: 'owner', monthlyBill: 3200, avgUnits: 340 });
    expect(result.score).toBe('High');
  });

  test('medium bill scores Medium', () => {
    const result = scoreLead({ ownerOrTenant: 'owner', monthlyBill: 1800, avgUnits: 190 });
    expect(result.score).toBe('Medium');
  });
});

describe('Recommended kW Calculation', () => {
  test('340 units/month → ~3 kW', () => {
    const kw = calcRecommendedKw(340);
    expect(kw).toBeCloseTo(3, 0);
  });

  test('null units returns null', () => {
    expect(calcRecommendedKw(null)).toBeNull();
  });

  test('minimum 1 kW', () => {
    expect(calcRecommendedKw(50)).toBeGreaterThanOrEqual(1);
  });
});

describe('Subsidy Calculation (PM Surya Ghar)', () => {
  const slabs = [{ upToKw: 2, ratePerKw: 30000 }, { upToKw: 1, ratePerKw: 18000 }];
  const maxSubsidy = 78000;

  test('1 kW system → ₹30,000', () => {
    expect(calcSubsidy(1, slabs, maxSubsidy)).toBe(30000);
  });

  test('2 kW system → ₹60,000', () => {
    expect(calcSubsidy(2, slabs, maxSubsidy)).toBe(60000);
  });

  test('3 kW system → ₹78,000', () => {
    expect(calcSubsidy(3, slabs, maxSubsidy)).toBe(78000);
  });

  test('5 kW system → capped at ₹78,000', () => {
    expect(calcSubsidy(5, slabs, maxSubsidy)).toBe(78000);
  });

  test('0.5 kW system → ₹15,000', () => {
    expect(calcSubsidy(0.5, slabs, maxSubsidy)).toBe(15000);
  });
});
