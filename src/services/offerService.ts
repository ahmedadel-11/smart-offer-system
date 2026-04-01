import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ProjectDetail, PanelItemTypeLabels, PanelItemType } from '../types';

interface OfferOptions {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  validityDays?: number;
  includeTerms?: boolean;
  termsAndConditions?: string;
}

function getStoredSettings(): Partial<OfferOptions> {
  try {
    const raw = localStorage.getItem('smartoffer_settings');
    if (!raw) return {};
    const s = JSON.parse(raw);
    return {
      companyName: s.companyName,
      companyAddress: s.companyAddress,
      companyPhone: s.companyPhone,
      companyEmail: s.companyEmail,
      validityDays: s.defaultValidityDays,
      includeTerms: true,
      termsAndConditions: s.termsAndConditions,
    };
  } catch {
    return {};
  }
}

const defaultOptions: OfferOptions = {
  companyName: 'Electric Technology',
  companyAddress: '5 Fawzy Moaaz Street – Semouha - Alexandria',
  companyPhone: '(03) 4248224',
  companyEmail: 'info@electech.com',
  validityDays: 30,
  includeTerms: true,
};

export const offerService = {
  // Generate Commercial Offer PDF
  generateCommercialOfferPdf(project: ProjectDetail, options: OfferOptions = {}): jsPDF {
    const opts = { ...defaultOptions, ...getStoredSettings(), ...options };
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(25, 118, 210);
    doc.text(opts.companyName || 'SmartOffer', 20, yPos);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    yPos += 8;
    doc.text(opts.companyAddress || '', 20, yPos);
    yPos += 5;
    doc.text(`Tel: ${opts.companyPhone} | Email: ${opts.companyEmail}`, 20, yPos);

    // Title
    yPos += 20;
    doc.setFontSize(24);
    doc.setTextColor(0);
    doc.text('COMMERCIAL OFFER', pageWidth / 2, yPos, { align: 'center' });

    // Offer number and date
    yPos += 15;
    doc.setFontSize(10);
    const offerNumber = `SO-${new Date().getFullYear()}-${String(project.projectId).padStart(4, '0')}`;
    const createdDate = new Date(project.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const validUntil = new Date(
      new Date(project.createdAt).getTime() + (opts.validityDays || 30) * 24 * 60 * 60 * 1000
    ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    doc.text(`Offer No: ${offerNumber}`, 20, yPos);
    doc.text(`Date: ${createdDate}`, pageWidth - 70, yPos);
    yPos += 5;
    doc.text(`Valid Until: ${validUntil}`, pageWidth - 70, yPos);

    // Project Info Box
    yPos += 15;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos - 5, pageWidth - 40, 25, 'F');
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Project: ${project.projectName}`, 25, yPos + 3);
    doc.text(`Customer: ${project.customer}`, 25, yPos + 10);
    doc.text(`Currency: ${project.currency}`, 25, yPos + 17);

    // Panel Summary Table
    yPos += 35;
    doc.setFontSize(14);
    doc.text('SUMMARY BY PANEL', 20, yPos);
    yPos += 5;

    const panelTableData = project.panels.map((panel, index) => [
      index + 1,
      panel.panelName,
      panel.items?.length || 0,
      `${panel.margin}%`,
      formatCurrency(panel.summary?.totalPrice || 0, project.currency),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Panel', 'Items', 'Margin', 'Total']],
      body: panelTableData,
      theme: 'striped',
      headStyles: { fillColor: [25, 118, 210], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 15 },
        4: { halign: 'right', fontStyle: 'bold' },
      },
    });

    // Grand Total
    yPos = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(25, 118, 210);
    doc.rect(pageWidth - 90, yPos, 70, 20, 'F');
    doc.setTextColor(255);
    doc.setFontSize(12);
    doc.text('GRAND TOTAL', pageWidth - 85, yPos + 8);
    doc.setFontSize(14);
    doc.text(
      formatCurrency(project.totalPrice || 0, project.currency),
      pageWidth - 85,
      yPos + 16
    );

    // Terms & Conditions
    if (opts.includeTerms) {
      yPos += 35;
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text('TERMS & CONDITIONS', 20, yPos);
      yPos += 8;
      doc.setFontSize(9);

      const terms = opts.termsAndConditions
        ? opts.termsAndConditions.split('\n').filter(Boolean)
        : [
            `1. Prices valid for ${opts.validityDays} days from date of offer.`,
            '2. Delivery: 4-6 weeks from order confirmation.',
            '3. Payment terms: 50% advance, 50% before delivery.',
            "4. Warranty: As per manufacturer's standard warranty.",
            '5. Prices exclude installation and commissioning.',
          ];
      terms.forEach((term) => {
        doc.text(term, 20, yPos);
        yPos += 5;
      });
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This is a computer-generated document.', pageWidth / 2, pageHeight - 10, {
      align: 'center',
    });

    return doc;
  },

  // Generate Technical Offer PDF
  generateTechnicalOfferPdf(project: ProjectDetail, options: OfferOptions = {}): jsPDF {
    const opts = { ...defaultOptions, ...getStoredSettings(), ...options };
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(25, 118, 210);
    doc.text(opts.companyName || 'SmartOffer', 20, yPos);

    // Title
    yPos += 20;
    doc.setFontSize(24);
    doc.setTextColor(0);
    doc.text('TECHNICAL OFFER', pageWidth / 2, yPos, { align: 'center' });

    // Project Info
    yPos += 15;
    doc.setFontSize(10);
    const offerNumber = `SO-${new Date().getFullYear()}-${String(project.projectId).padStart(4, '0')}`;
    doc.text(`Project: ${project.projectName}`, 20, yPos);
    doc.text(`Reference: ${offerNumber}`, pageWidth - 70, yPos);
    yPos += 5;
    doc.text(`Customer: ${project.customer}`, 20, yPos);

    // Panels with Items
    project.panels.forEach((panel, panelIndex) => {
      yPos += 15;
      
      // Check if we need a new page
      if (yPos > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(25, 118, 210);
      doc.text(`${panelIndex + 1}. ${panel.panelName}`, 20, yPos);
      yPos += 8;

      // Group items by type
      const itemsByType: Record<number, typeof panel.items> = {};
      panel.items?.forEach((item) => {
        const type = item.itemType || 0;
        if (!itemsByType[type]) itemsByType[type] = [];
        itemsByType[type].push(item);
      });

      // Create table for each type
      Object.entries(itemsByType).forEach(([typeStr, items]) => {
        const type = parseInt(typeStr) as PanelItemType;
        const typeName = type ? PanelItemTypeLabels[type] : 'Unassigned';

        if (yPos > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(typeName, 25, yPos);
        yPos += 3;

        const tableData = items.map((item) => [
          item.itemCode,
          item.description.substring(0, 50),
          item.brand,
          item.ratedCurrent ? `${item.ratedCurrent}A` : '-',
          item.isc ? `${item.isc}kA` : '-',
          item.noOfPoles ?? item.poles ?? '-',
          item.quantity,
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Code', 'Description', 'Brand', 'Current', 'Isc', 'Poles', 'Qty']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [100, 100, 100], textColor: 255, fontSize: 8 },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 50 },
            6: { halign: 'center' },
          },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      });
    });

    return doc;
  },

  // Export to Excel
  exportToExcel(project: ProjectDetail): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Project Summary'],
      [],
      ['Project Name', project.projectName],
      ['Customer', project.customer],
      ['Currency', project.currency],
      ['Created', new Date(project.createdAt).toLocaleDateString()],
      ['Total Panels', project.panels.length],
      ['Total Items', project.totalItems],
      ['Total Price', project.totalPrice],
      [],
      ['Panel Summary'],
      ['Panel Name', 'Items', 'Cost', 'Margin', 'Price'],
      ...project.panels.map((p) => [
        p.panelName,
        p.items?.length || 0,
        p.summary?.totalCost || 0,
        `${p.margin}%`,
        p.summary?.totalPrice || 0,
      ]),
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Detail Sheet
    const detailHeaders = [
      'Panel',
      'Type',
      'Item Code',
      'Description',
      'Brand',
      'Rated Current',
      'Isc',
      'Poles',
      'Quantity',
      'Base Price',
      'Discount %',
      'Unit Cost',
      'Total Price',
    ];
    const detailData = [detailHeaders];

    project.panels.forEach((panel) => {
      panel.items?.forEach((item) => {
        detailData.push([
          panel.panelName,
          item.itemType ? PanelItemTypeLabels[item.itemType] : 'Unassigned',
          item.itemCode,
          item.description,
          item.brand,
          item.ratedCurrent?.toString() || '',
          item.isc?.toString() || '',
          (item.noOfPoles ?? item.poles)?.toString() || '',
          item.quantity.toString(),
          item.basePrice.toString(),
          item.discount.toString(),
          item.unitCost.toString(),
          item.totalPrice.toString(),
        ]);
      });
    });

    const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Details');

    return workbook;
  },

  // Download PDF
  downloadPdf(doc: jsPDF, filename: string): void {
    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  },

  // Download Excel
  downloadExcel(workbook: XLSX.WorkBook, filename: string): void {
    XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
  },
};

// Helper function
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: currency || 'EGP',
    minimumFractionDigits: 2,
  }).format(amount);
}

export default offerService;
