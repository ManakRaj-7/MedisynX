const diagnosisService = require('../ai-service/diagnosisService');
const fsSync = require('fs');
const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');

const reportsRoot = path.join(__dirname, '..', 'ai-service', 'reports');

const safeText = (value) => String(value || '').replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');

const markdownToPlainText = (markdown) => {
  return safeText(markdown)
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '- ');
};

const pruneOldReports = async (doctorId) => {
  const doctorDir = path.join(reportsRoot, doctorId);
  const entries = await fs.readdir(doctorDir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.pdf'))
      .map(async (entry) => {
        const filePath = path.join(doctorDir, entry.name);
        const stat = await fs.stat(filePath);
        return { filePath, mtimeMs: stat.mtimeMs };
      })
  );

  const staleFiles = files
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .slice(5);

  await Promise.all(staleFiles.map((file) => fs.unlink(file.filePath)));
};

exports.diagnose = async (req, res, next) => {
  try {
    const { symptoms, age, gender, history } = req.body;
    if (!symptoms) {
      return res.status(400).json({ message: 'Symptoms are required for diagnosis.' });
    }

    const result = await diagnosisService.getDiagnosis({ symptoms, age, gender, history });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.downloadDiagnosisPdf = async (req, res, next) => {
  try {
    const { symptoms, age, gender, history, result } = req.body;
    const doctorId = req.user.id;

    if (!result?.content) {
      return res.status(400).json({ message: 'Clinical AI result is required to generate a PDF.' });
    }

    const doctorDir = path.join(reportsRoot, doctorId);
    await fs.mkdir(doctorDir, { recursive: true });

    const reportId = `clinical-ai-${Date.now()}`;
    const filePath = path.join(doctorDir, `${reportId}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    const fileStream = fsSync.createWriteStream(filePath);

    doc.on('data', (chunk) => chunks.push(chunk));

    const finished = new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
    });

    const fileWritten = new Promise((resolve, reject) => {
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });

    doc.pipe(fileStream);

    doc.fillColor('#0284c7').fontSize(24).text('MedisynX Clinical AI Report', { align: 'center' });
    doc.fillColor('#64748b').fontSize(11).text(new Date().toLocaleString(), { align: 'center' });
    doc.moveDown(1.5);

    doc.fillColor('#0f172a').fontSize(13).text('Patient Context', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11)
      .text(`Symptoms: ${safeText(symptoms) || 'Not provided'}`)
      .text(`Age: ${safeText(age) || 'Not provided'}`)
      .text(`Biological Sex: ${safeText(gender) || 'Not provided'}`)
      .text(`Medical History: ${safeText(history) || 'None reported'}`);
    doc.moveDown(1);

    doc.fontSize(13).text('AI Metadata', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11)
      .text(`Source: ${safeText(result.source) || 'Unknown'}`)
      .text(`Confidence: ${result.confidence ?? 'N/A'}%`);
    doc.moveDown(1);

    doc.fontSize(13).text('Clinical Insight', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(markdownToPlainText(result.content), {
      align: 'left',
      lineGap: 3,
    });

    if (result.disclaimer) {
      doc.moveDown(1);
      doc.fillColor('#64748b').fontSize(9).text(safeText(result.disclaimer), { oblique: true });
    }

    doc.end();
    await Promise.all([finished, fileWritten]);
    await pruneOldReports(doctorId);

    const pdf = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportId}.pdf"`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
};
