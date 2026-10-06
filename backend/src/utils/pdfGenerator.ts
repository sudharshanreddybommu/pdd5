import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/index.js';

export interface ScreeningReportData {
  patientName: string;
  patientId: string;
  age: string | number;
  gender: string;
  screeningId: string;
  screeningNumber: string;
  dateTime: string;
  images: { front?: string; left?: string; right?: string };
  symptoms: Array<{ symptomName: string; response: string; duration?: string; severity?: string }>;
  prediction: {
    riskCategory: string;
    probability: number;
    confidence: number;
    modelVersion: string;
  };
}

export async function generateScreeningPdf(data: ScreeningReportData): Promise<string> {
  const reportsDir = path.join(config.uploadsDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const fileName = `Report-${data.screeningNumber || Date.now()}.pdf`;
  const filePath = path.join(reportsDir, fileName);

  const riskBadgeColor = 
    data.prediction.riskCategory === 'HIGHER RISK' ? '#e11d48' :
    data.prediction.riskCategory === 'REQUIRES PROFESSIONAL EVALUATION' ? '#d97706' : '#059669';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>OPMD Care - Screening Report</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; margin: 0; padding: 30px; background: #fff; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0891b2; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #0891b2; }
        .report-title { font-size: 18px; color: #475569; }
        .section { margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
        .section-title { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
        .grid { display: flex; flex-wrap: wrap; gap: 15px; }
        .grid-item { flex: 1 1 45%; }
        .label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .value { font-size: 14px; color: #0f172a; font-weight: 500; }
        .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; color: #fff; font-weight: bold; font-size: 14px; background: ${riskBadgeColor}; }
        .images-container { display: flex; gap: 12px; justify-content: space-around; }
        .image-box { text-align: center; width: 30%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; }
        .image-box img { width: 100%; height: 130px; object-fit: cover; border-radius: 4px; }
        .symptom-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .symptom-table th, .symptom-table td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 13px; }
        .symptom-table th { background: #f8fafc; color: #475569; }
        .disclaimer-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin-top: 20px; }
        .disclaimer-title { color: #991b1b; font-weight: bold; font-size: 13px; margin-bottom: 4px; }
        .disclaimer-text { color: #b91c1c; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">OPMD Care</div>
          <div style="font-size: 12px; color: #64748b;">Oral Potentially Malignant Disorders Screening Platform</div>
        </div>
        <div style="text-align: right;">
          <div class="report-title">CLINICAL SCREENING REPORT</div>
          <div style="font-size: 12px; color: #64748b;">Screening ID: ${data.screeningNumber}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">1. PATIENT DETAILS</div>
        <div class="grid">
          <div class="grid-item"><div class="label">Patient Name</div><div class="value">${data.patientName}</div></div>
          <div class="grid-item"><div class="label">Patient ID</div><div class="value">${data.patientId}</div></div>
          <div class="grid-item"><div class="label">Age / Gender</div><div class="value">${data.age || 'N/A'} / ${data.gender || 'N/A'}</div></div>
          <div class="grid-item"><div class="label">Assessment Date & Time</div><div class="value">${data.dateTime}</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">2. AI SCREENING ASSESSMENT (MULTIMODAL ENSEMBLE)</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <div class="label">Estimated Risk Classification</div>
            <div style="margin-top: 6px;"><span class="badge">${data.prediction.riskCategory}</span></div>
          </div>
          <div>
            <div class="label">Calculated Probability</div>
            <div class="value" style="font-size: 18px; color: #0891b2;">${(data.prediction.probability * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div class="label">Inference Confidence</div>
            <div class="value" style="font-size: 18px; color: #0891b2;">${(data.prediction.confidence * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div class="label">Model Version</div>
            <div class="value">${data.prediction.modelVersion} (EfficientNetB0 + XGBoost)</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">3. ORAL CAVITY IMAGING VIEWS</div>
        <div class="images-container">
          <div class="image-box">
            <div class="label" style="margin-bottom: 6px;">Front View</div>
            <img src="${data.images.front || 'https://placehold.co/300x200?text=Front+View'}" alt="Front View" />
          </div>
          <div class="image-box">
            <div class="label" style="margin-bottom: 6px;">Left View</div>
            <img src="${data.images.left || 'https://placehold.co/300x200?text=Left+View'}" alt="Left View" />
          </div>
          <div class="image-box">
            <div class="label" style="margin-bottom: 6px;">Right View</div>
            <img src="${data.images.right || 'https://placehold.co/300x200?text=Right+View'}" alt="Right View" />
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">4. REPORTED SYMPTOMS & CLINICAL INDICATORS</div>
        <table class="symptom-table">
          <thead>
            <tr>
              <th>Symptom</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            ${data.symptoms.map(s => `
              <tr>
                <td><strong>${s.symptomName}</strong></td>
                <td><span style="color: ${s.response === 'YES' ? '#e11d48' : '#64748b'}; font-weight: 600;">${s.response}</span></td>
                <td>${s.duration || 'N/A'}</td>
                <td>${s.severity || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="disclaimer-box">
        <div class="disclaimer-title">IMPORTANT CLINICAL DISCLAIMER:</div>
        <p class="disclaimer-text">
          This AI-based result is a screening assessment and is not a confirmed medical diagnosis.
          Please consult a qualified dental/oral-health professional for clinical evaluation, biopsy, and personalized diagnosis.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    });
    await browser.close();
    return `/uploads/reports/${fileName}`;
  } catch (err) {
    console.warn('Puppeteer generation fallback to HTML-based report viewer', err);
    // Write HTML file for fallback download
    const htmlFilePath = filePath.replace('.pdf', '.html');
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
    return `/uploads/reports/${path.basename(htmlFilePath)}`;
  }
}
