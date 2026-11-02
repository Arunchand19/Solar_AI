const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function readBillWithAI(imagePath) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return getMockBillData();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString('base64');
    const ext = imagePath.split('.').pop().toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/jpeg';

    const prompt = `You are reading an Indian electricity bill. Extract these fields exactly:
1. consumer_number: the consumer/account number
2. tariff_category: the tariff category (e.g., LT-1, LT-2, Residential, Commercial)
3. sanctioned_load_kw: sanctioned/connected load in kW (number only)
4. avg_monthly_units: average monthly units consumed (kWh, number only)
5. bill_amount: total bill amount in rupees (number only)
6. billing_name: name on the bill
7. address: billing address

Respond ONLY with valid JSON like:
{
  "consumer_number": "...",
  "tariff_category": "...",
  "sanctioned_load_kw": 5.0,
  "avg_monthly_units": 340,
  "bill_amount": 3200,
  "billing_name": "...",
  "address": "...",
  "confidence": 0.9
}
If a field is not found, use null. confidence is 0-1 based on image quality.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType } }
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const data = JSON.parse(jsonMatch[0]);
    return {
      consumerNumber: data.consumer_number,
      tariff: data.tariff_category,
      sanctionedLoad: data.sanctioned_load_kw,
      avgUnits: data.avg_monthly_units,
      billAmount: data.bill_amount,
      billingName: data.billing_name,
      address: data.address,
      confidence: data.confidence || 0.8,
      error: null
    };
  } catch (e) {
    if (e.message?.includes('image') || e.message?.includes('quality')) {
      return { error: 'poor_image', message: 'Image quality too low. Please re-upload a clearer photo.' };
    }
    return { error: 'parse_error', message: e.message, ...getMockBillData() };
  }
}

function getMockBillData() {
  return {
    consumerNumber: 'MSEDCL-' + Math.floor(Math.random() * 9000000 + 1000000),
    tariff: 'LT-1 Residential',
    sanctionedLoad: 5.0,
    avgUnits: 340,
    billAmount: 3200,
    billingName: 'Sample Customer',
    address: 'Nagpur, Maharashtra',
    confidence: 0.85,
    error: null,
    isMock: true
  };
}

function scoreLead({ ownerOrTenant, monthlyBill, avgUnits, recommendedKw }) {
  if (ownerOrTenant === 'tenant') {
    return { score: 'Low', reason: 'Tenant cannot install solar panels', recommendedKw: null };
  }
  if (monthlyBill < 1000 || (avgUnits && avgUnits < 100)) {
    return { score: 'Low', reason: 'Monthly bill too low for viable solar installation', recommendedKw: recommendedKw || 1 };
  }
  if (monthlyBill >= 2500 || (avgUnits && avgUnits >= 250)) {
    return { score: 'High', reason: 'High consumption, excellent solar candidate', recommendedKw: recommendedKw || Math.ceil((avgUnits || monthlyBill / 8) / 120) };
  }
  return { score: 'Medium', reason: 'Moderate consumption, good solar candidate', recommendedKw: recommendedKw || Math.ceil((avgUnits || monthlyBill / 8) / 120) };
}

function calcRecommendedKw(avgUnits) {
  if (!avgUnits) return null;
  // 1400 units/kW/year = ~116.7 units/kW/month
  return Math.max(1, Math.round((avgUnits / 116.7) * 2) / 2); // round to nearest 0.5
}

module.exports = { readBillWithAI, scoreLead, calcRecommendedKw };
