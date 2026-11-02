const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateQuotePDF(quote, lead, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.rect(0, 0, 595, 80).fill('#1a6b3c');
    doc.fillColor('white').fontSize(22).font('Helvetica-Bold')
      .text('SolarSmart', 50, 20);
    doc.fontSize(10).font('Helvetica')
      .text('Rooftop Solar Solutions | Nagpur, Vidarbha', 50, 48);
    doc.text(`Quote #${quote.quoteNumber}`, 400, 20, { align: 'right' });
    doc.text(new Date(quote.createdAt).toLocaleDateString('en-IN'), 400, 38, { align: 'right' });

    doc.fillColor('#1a1a1a').moveDown(3);

    // Customer info
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a6b3c').text('Customer Details', 50, 100);
    doc.moveTo(50, 118).lineTo(545, 118).strokeColor('#e0e0e0').stroke();
    doc.fontSize(11).font('Helvetica').fillColor('#333');
    doc.text(`Name: ${lead.name}`, 50, 125);
    doc.text(`Phone: ${lead.phone}`, 50, 142);
    doc.text(`Pincode: ${lead.pincode}`, 300, 125);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 300, 142);

    // System Summary - Hero section
    doc.rect(50, 170, 495, 90).fill('#f0f9f4').stroke('#1a6b3c');
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#1a6b3c').text('Your Solar System', 70, 182);
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#1a6b3c')
      .text(`${quote.systemSizeKw} kW`, 70, 200);
    doc.fontSize(11).font('Helvetica').fillColor('#555')
      .text(`${quote.panelCount} panels × ${quote.panelWatt}W`, 70, 232);

    doc.fontSize(13).font('Helvetica-Bold').fillColor('#333').text('Net Cost After Subsidy', 280, 182);
    doc.fontSize(26).font('Helvetica-Bold').fillColor('#e65c00')
      .text(`₹${quote.netCost.toLocaleString('en-IN')}`, 280, 200);
    doc.fontSize(11).font('Helvetica').fillColor('#555')
      .text(`Payback in ${quote.paybackYears} years`, 280, 232);

    // Cost Breakdown
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a6b3c').text('Cost Breakdown', 50, 280);
    doc.moveTo(50, 298).lineTo(545, 298).strokeColor('#e0e0e0').stroke();

    const rows = [
      ['System Cost (before subsidy)', `₹${quote.baseCost.toLocaleString('en-IN')}`],
      ['Central Govt. Subsidy (PM Surya Ghar)', `-₹${quote.subsidyAmount.toLocaleString('en-IN')}`],
      ['Net Cost to You', `₹${quote.netCost.toLocaleString('en-IN')}`],
    ];

    let y = 305;
    rows.forEach(([label, value], i) => {
      if (i === rows.length - 1) {
        doc.rect(50, y - 3, 495, 22).fill('#f0f9f4');
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a6b3c');
      } else {
        doc.fontSize(11).font('Helvetica').fillColor('#333');
      }
      doc.text(label, 60, y);
      doc.text(value, 400, y, { width: 135, align: 'right' });
      y += 25;
    });

    // Generation & Savings
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a6b3c').text('Annual Benefits', 50, y + 15);
    doc.moveTo(50, y + 33).lineTo(545, y + 33).strokeColor('#e0e0e0').stroke();
    y += 40;

    const benefits = [
      ['Yearly Energy Generation', `${quote.yearlyGeneration.toLocaleString('en-IN')} units`],
      ['Yearly Bill Savings (est.)', `₹${quote.yearlyBillSaving.toLocaleString('en-IN')}`],
      ['Payback Period', `${quote.paybackYears} years`],
      ['System Lifespan', '25 years'],
    ];

    benefits.forEach(([label, value]) => {
      doc.fontSize(11).font('Helvetica').fillColor('#333');
      doc.text(label, 60, y);
      doc.text(value, 400, y, { width: 135, align: 'right' });
      y += 22;
    });

    // Subsidy note
    y += 10;
    doc.rect(50, y, 495, 45).fill('#fff8e1');
    doc.fontSize(9).font('Helvetica').fillColor('#666')
      .text('* Subsidy as per PM Surya Ghar Muft Bijli Yojana: ₹30,000/kW up to 2kW + ₹18,000 for 3rd kW, max ₹78,000. Subject to DISCOM approval.', 60, y + 8, { width: 475 });

    // Footer
    doc.rect(0, 760, 595, 82).fill('#1a6b3c');
    doc.fontSize(9).font('Helvetica').fillColor('white')
      .text('This quote is valid for 30 days. Generation estimate: 1,400 units/kW/year. Actual may vary ±10%.', 50, 770, { width: 495, align: 'center' });
    doc.text('SolarSmart | Nagpur | support@solarsmart.in | +91-XXXXXXXXXX', 50, 790, { width: 495, align: 'center' });

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

module.exports = { generateQuotePDF };
