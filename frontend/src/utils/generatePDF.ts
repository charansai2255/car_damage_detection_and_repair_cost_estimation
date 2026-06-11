import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BASE_URL } from '../api';

interface PartEstimate {
  count: number;
  price: number;
  total: number;
}

interface PDFReportData {
  originalImage: string;   // URL e.g. /static/uploads/xxx_uploaded.jpg
  detectedImage: string;   // URL e.g. /static/uploads/xxx_detected.jpg
  partPrices: Record<string, PartEstimate>;
  userName?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleId?: string;
  detectedAt?: string;
}

// Uses dynamic BASE_URL imported from API config

/** Loads an image URL and returns a base64 data-URL (bypasses CORS via canvas) */
async function loadImageAsBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(null);
    img.src = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  });
}

export async function generateDamageReport(data: PDFReportData): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;

  // ── Background ────────────────────────────────────────────────────────────
  pdf.setFillColor(8, 9, 13);
  pdf.rect(0, 0, pageW, pageH, 'F');

  // ── Header Bar ────────────────────────────────────────────────────────────
  pdf.setFillColor(22, 22, 35);
  pdf.roundedRect(margin, 10, contentW, 22, 3, 3, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(192, 132, 252); // purple
  pdf.text('🔍 Vehicle Damage Report', margin + 6, 24);

  const now = data.detectedAt ? new Date(data.detectedAt) : new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    '  ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128); // muted
  pdf.text(dateStr, pageW - margin - 6, 24, { align: 'right' });

  // ── Vehicle / User Info ───────────────────────────────────────────────────
  let y = 40;
  pdf.setFillColor(15, 16, 21);
  pdf.roundedRect(margin, y, contentW, 22, 2, 2, 'F');
  pdf.setDrawColor(255, 255, 255, 0.07);
  pdf.roundedRect(margin, y, contentW, 22, 2, 2, 'S');

  const infoItems = [
    ['Owner', data.userName || '—'],
    ['Vehicle', `${data.vehicleBrand || ''} ${data.vehicleModel || ''}`.trim() || '—'],
    ['Vehicle ID', data.vehicleId || '—'],
  ];
  const colW = contentW / infoItems.length;
  infoItems.forEach(([label, value], i) => {
    const x = margin + i * colW + 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(107, 114, 128);
    pdf.text(label.toUpperCase(), x, y + 8);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(243, 244, 246);
    pdf.text(value, x, y + 16);
  });

  // ── Images ────────────────────────────────────────────────────────────────
  y += 30;
  const imgAreaH = 68;
  const imgW = (contentW - 8) / 2;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(192, 132, 252);
  pdf.text('ORIGINAL PHOTO', margin, y - 2);
  pdf.text('SCAN OUTPUT', margin + imgW + 8, y - 2);

  // Draw image placeholders
  pdf.setFillColor(15, 16, 21);
  pdf.roundedRect(margin, y, imgW, imgAreaH, 2, 2, 'F');
  pdf.roundedRect(margin + imgW + 8, y, imgW, imgAreaH, 2, 2, 'F');

  // Load both images in parallel
  const [origB64, detB64] = await Promise.all([
    loadImageAsBase64(data.originalImage),
    loadImageAsBase64(data.detectedImage),
  ]);

  if (origB64) {
    pdf.addImage(origB64, 'JPEG', margin, y, imgW, imgAreaH, undefined, 'FAST');
  } else {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(107, 114, 128);
    pdf.text('Image unavailable', margin + imgW / 2, y + imgAreaH / 2, { align: 'center' });
  }
  if (detB64) {
    pdf.addImage(detB64, 'JPEG', margin + imgW + 8, y, imgW, imgAreaH, undefined, 'FAST');
  } else {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(107, 114, 128);
    pdf.text('Image unavailable', margin + imgW + 8 + imgW / 2, y + imgAreaH / 2, { align: 'center' });
  }

  // ── Parts Breakdown Table ─────────────────────────────────────────────────
  y += imgAreaH + 12;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(243, 244, 246);
  pdf.text('Repair Cost Breakdown', margin, y);
  y += 5;

  const entries = Object.entries(data.partPrices);
  const totalCost = entries.reduce((s, [, v]) => s + v.total, 0);
  const totalQty  = entries.reduce((s, [, v]) => s + v.count, 0);

  if (entries.length === 0) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128);
    pdf.text('No damaged parts detected.', margin, y + 10);
    y += 20;
  } else {
    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Damaged Part', 'Qty', 'Price / Unit (₹)', 'Total (₹)']],
      body: entries.map(([part, v]) => [
        part,
        v.count.toString(),
        v.price > 0 ? v.price.toLocaleString('en-IN') : 'N/A',
        v.total > 0 ? v.total.toLocaleString('en-IN') : '—',
      ]),
      foot: [['Total', totalQty.toString(), '', totalCost > 0 ? `₹ ${totalCost.toLocaleString('en-IN')}` : '—']],
      styles: {
        font: 'helvetica',
        fontSize: 9,
        textColor: [243, 244, 246],
        fillColor: [15, 16, 21],
        lineColor: [255, 255, 255],
        lineWidth: 0.05,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [30, 30, 50],
        textColor: [192, 132, 252],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      footStyles: {
        fillColor: [22, 22, 35],
        textColor: [16, 185, 129],
        fontStyle: 'bold',
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [12, 13, 18],
      },
    } as any);

    y = (pdf as any).lastAutoTable.finalY + 8;
  }

  // ── Total Cost Highlight Banner ───────────────────────────────────────────
  if (totalCost > 0) {
    pdf.setFillColor(16, 30, 20);
    pdf.roundedRect(margin, y, contentW, 18, 3, 3, 'F');
    pdf.setDrawColor(16, 185, 129);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(margin, y, contentW, 18, 3, 3, 'S');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128);
    pdf.text('ESTIMATED TOTAL REPAIR COST', margin + 6, y + 8);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(16, 185, 129);
    pdf.text(`₹ ${totalCost.toLocaleString('en-IN')}`, pageW - margin - 6, y + 12, { align: 'right' });

    y += 26;
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(75, 85, 99);
  pdf.text(
    'This report is auto-generated by the Accident Damage Detection System. Costs are estimates and may vary by workshop.',
    pageW / 2, pageH - 8,
    { align: 'center' }
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  const fileName = `damage_report_${now.toISOString().slice(0,10)}.pdf`;
  pdf.save(fileName);
}
