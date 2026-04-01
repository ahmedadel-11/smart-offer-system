# SmartOffer Frontend - Offer Generation

## ?? Overview

This document describes the commercial and technical offer generation system. Users can generate professional PDF and Excel documents after completing panel design.

---

## ?? Offer Types

### Commercial Offer
- **Purpose**: Price quotation for customers
- **Focus**: Pricing, totals, discounts, terms
- **Audience**: Customers, procurement teams
- **Format**: Professional business document

### Technical Offer
- **Purpose**: Technical specifications document
- **Focus**: Product specs, ratings, standards
- **Audience**: Engineers, technical reviewers
- **Format**: Detailed technical datasheet

---

## ?? Data Preparation

### Offer Data Interface
```typescript
// src/types/offer.ts

interface OfferData {
  // Project Info
  project: {
    id: number;
    name: string;
    customer: string;
    currency: string;
    defaultMargin: number;
    createdDate: string;
    status: string;
  };
  
  // Company Info (from settings)
  company: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
  };
  
  // Panels with items grouped by type
  panels: PanelOfferData[];
  
  // Totals
  summary: {
    totalItems: number;
    subtotal: number;
    discountAmount: number;
    discountPercentage: number;
    taxAmount: number;
    taxPercentage: number;
    grandTotal: number;
  };
  
  // Offer metadata
  offer: {
    number: string;           // e.g., "SO-2024-0001"
    date: string;
    validUntil: string;
    preparedBy: string;
    approvedBy?: string;
  };
  
  // Terms and conditions
  terms: string[];
  notes: string;
}

interface PanelOfferData {
  panelId: number;
  panelName: string;
  description: string;
  margin: number;
  
  // Items by category
  incoming: OfferItemData[];
  outgoing: OfferItemData[];
  enclosure: OfferItemData[];
  busbarAndCables: OfferItemData[];
  
  // Panel totals
  itemCount: number;
  subtotal: number;
  total: number;
}

interface OfferItemData {
  // Identification
  itemCode: string;
  description: string;
  
  // Technical specs
  brand: string;
  reference: string;
  ratedCurrent: string;
  isc: string;
  noOfPoles: number;
  
  // Pricing
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}
```

---

## ?? Offer Service

```typescript
// src/services/offerService.ts

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const offerService = {
  // Prepare offer data from project
  async prepareOfferData(projectId: number): Promise<OfferData> {
    const project = await projectService.getById(projectId);
    const company = await settingsService.getCompanyInfo();
    
    const panels: PanelOfferData[] = [];
    
    for (const panel of project.panels) {
      const panelDetail = await panelService.getById(panel.panelId);
      
      const panelData: PanelOfferData = {
        panelId: panel.panelId,
        panelName: panel.panelName,
        description: panel.description || '',
        margin: panel.overrideMargin || project.defaultMargin,
        incoming: [],
        outgoing: [],
        enclosure: [],
        busbarAndCables: [],
        itemCount: 0,
        subtotal: 0,
        total: 0
      };
      
      // Group items by type
      panelDetail.items.forEach(item => {
        const offerItem: OfferItemData = {
          itemCode: item.itemCode,
          description: item.description,
          brand: item.brand || '',
          reference: '',
          ratedCurrent: '',
          isc: '',
          noOfPoles: 0,
          quantity: item.quantity,
          unitPrice: item.basePrice,
          discount: item.discount,
          lineTotal: item.totalPrice
        };
        
        switch (item.itemType) {
          case PanelItemType.Incoming:
            panelData.incoming.push(offerItem);
            break;
          case PanelItemType.Outgoing:
            panelData.outgoing.push(offerItem);
            break;
          case PanelItemType.Enclosure:
            panelData.enclosure.push(offerItem);
            break;
          case PanelItemType.BusbarAndCables:
            panelData.busbarAndCables.push(offerItem);
            break;
        }
        
        panelData.itemCount++;
        panelData.subtotal += item.totalCost;
        panelData.total += item.totalPrice;
      });
      
      panels.push(panelData);
    }
    
    // Calculate totals
    const subtotal = panels.reduce((sum, p) => sum + p.subtotal, 0);
    const grandTotal = panels.reduce((sum, p) => sum + p.total, 0);
    
    return {
      project: {
        id: project.projectId,
        name: project.projectName,
        customer: project.customer,
        currency: project.currency,
        defaultMargin: project.defaultMargin,
        createdDate: project.createdDate,
        status: project.status
      },
      company,
      panels,
      summary: {
        totalItems: panels.reduce((sum, p) => sum + p.itemCount, 0),
        subtotal,
        discountAmount: 0,
        discountPercentage: 0,
        taxAmount: 0,
        taxPercentage: 0,
        grandTotal
      },
      offer: {
        number: `SO-${new Date().getFullYear()}-${String(project.projectId).padStart(4, '0')}`,
        date: new Date().toISOString(),
        validUntil: addDays(new Date(), 30).toISOString(),
        preparedBy: 'System User'
      },
      terms: [
        'Prices valid for 30 days from date of offer.',
        'Delivery: 4-6 weeks from order confirmation.',
        'Payment terms: 50% advance, 50% before delivery.',
        'Warranty: As per manufacturer\'s standard warranty.',
        'Prices exclude installation and commissioning.'
      ],
      notes: ''
    };
  },
  
  // Generate Commercial Offer PDF
  async generateCommercialPDF(data: OfferData): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = margin;
    
    // ============ HEADER ============
    // Company logo (if available)
    if (data.company.logo) {
      doc.addImage(data.company.logo, 'PNG', margin, yPos, 40, 20);
    }
    
    // Company info (right aligned)
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(data.company.name, pageWidth - margin, yPos, { align: 'right' });
    doc.text(data.company.address, pageWidth - margin, yPos + 5, { align: 'right' });
    doc.text(`Tel: ${data.company.phone}`, pageWidth - margin, yPos + 10, { align: 'right' });
    doc.text(data.company.email, pageWidth - margin, yPos + 15, { align: 'right' });
    
    yPos += 30;
    
    // ============ TITLE ============
    doc.setFontSize(20);
    doc.setTextColor(25, 118, 210); // Primary color
    doc.text('COMMERCIAL OFFER', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    
    // Offer number and date
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Offer No: ${data.offer.number}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;
    
    // ============ PROJECT & CUSTOMER INFO ============
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');
    
    doc.setFontSize(10);
    yPos += 7;
    doc.text(`Project: ${data.project.name}`, margin + 5, yPos);
    doc.text(`Date: ${formatDate(data.offer.date)}`, pageWidth - margin - 5, yPos, { align: 'right' });
    yPos += 6;
    doc.text(`Customer: ${data.project.customer}`, margin + 5, yPos);
    doc.text(`Valid Until: ${formatDate(data.offer.validUntil)}`, pageWidth - margin - 5, yPos, { align: 'right' });
    yPos += 6;
    doc.text(`Currency: ${data.project.currency}`, margin + 5, yPos);
    
    yPos += 15;
    
    // ============ PANELS SUMMARY TABLE ============
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Summary by Panel', margin, yPos);
    yPos += 5;
    
    const panelTableData = data.panels.map((panel, index) => [
      index + 1,
      panel.panelName,
      panel.description,
      panel.itemCount,
      `${panel.margin}%`,
      formatCurrency(panel.total, data.project.currency)
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Panel', 'Description', 'Items', 'Margin', 'Total']],
      body: panelTableData,
      theme: 'striped',
      headStyles: { fillColor: [25, 118, 210] },
      margin: { left: margin, right: margin }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // ============ TOTALS ============
    doc.setFillColor(25, 118, 210);
    doc.rect(pageWidth - margin - 80, yPos, 80, 20, 'F');
    doc.setTextColor(255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('GRAND TOTAL', pageWidth - margin - 75, yPos + 8);
    doc.setFontSize(14);
    doc.text(
      formatCurrency(data.summary.grandTotal, data.project.currency),
      pageWidth - margin - 5,
      yPos + 15,
      { align: 'right' }
    );
    
    yPos += 30;
    
    // ============ TERMS & CONDITIONS ============
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Terms & Conditions:', margin, yPos);
    yPos += 5;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    data.terms.forEach((term, index) => {
      doc.text(`${index + 1}. ${term}`, margin, yPos);
      yPos += 5;
    });
    
    // ============ FOOTER ============
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('This is a computer-generated document.', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Page 1 of 1 | Generated on ${formatDate(new Date())}`, pageWidth / 2, footerY + 5, { align: 'center' });
    
    return doc.output('blob');
  },
  
  // Generate Technical Offer PDF
  async generateTechnicalPDF(data: OfferData): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = margin;
    
    // ============ HEADER ============
    if (data.company.logo) {
      doc.addImage(data.company.logo, 'PNG', margin, yPos, 40, 20);
    }
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(data.company.name, pageWidth - margin, yPos, { align: 'right' });
    yPos += 25;
    
    // ============ TITLE ============
    doc.setFontSize(20);
    doc.setTextColor(76, 175, 80); // Green
    doc.text('TECHNICAL OFFER', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Project info
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Project: ${data.project.name}`, margin, yPos);
    doc.text(`Reference: ${data.offer.number}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;
    doc.text(`Customer: ${data.project.customer}`, margin, yPos);
    doc.text(`Date: ${formatDate(data.offer.date)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 15;
    
    // ============ PANELS WITH TECHNICAL DETAILS ============
    for (const panel of data.panels) {
      // Check if need new page
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }
      
      // Panel header
      doc.setFillColor(76, 175, 80);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      doc.setTextColor(255);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(11);
      doc.text(panel.panelName, margin + 3, yPos + 6);
      doc.text(`${panel.itemCount} items`, pageWidth - margin - 3, yPos + 6, { align: 'right' });
      yPos += 12;
      
      // Panel description
      if (panel.description) {
        doc.setTextColor(100);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.text(panel.description, margin, yPos);
        yPos += 8;
      }
      
      // Items by category
      const categories = [
        { name: 'INCOMING', items: panel.incoming, color: [76, 175, 80] },
        { name: 'OUTGOING', items: panel.outgoing, color: [33, 150, 243] },
        { name: 'ENCLOSURE', items: panel.enclosure, color: [255, 152, 0] },
        { name: 'BUSBAR & CABLES', items: panel.busbarAndCables, color: [156, 39, 176] }
      ];
      
      for (const category of categories) {
        if (category.items.length === 0) continue;
        
        // Category header
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(category.color[0], category.color[1], category.color[2]);
        doc.text(category.name, margin, yPos);
        yPos += 3;
        
        // Items table
        const tableData = category.items.map(item => [
          item.itemCode,
          item.description,
          item.brand,
          item.ratedCurrent || '-',
          item.isc || '-',
          item.noOfPoles || '-',
          item.quantity
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Code', 'Description', 'Brand', 'In', 'Isc', 'Poles', 'Qty']],
          body: tableData,
          theme: 'grid',
          headStyles: { 
            fillColor: category.color,
            fontSize: 8
          },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 50 },
            2: { cellWidth: 25 },
            3: { cellWidth: 15 },
            4: { cellWidth: 15 },
            5: { cellWidth: 12 },
            6: { cellWidth: 12 }
          },
          margin: { left: margin, right: margin }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 5;
      }
      
      yPos += 10;
    }
    
    // ============ TECHNICAL NOTES ============
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0);
    doc.text('Technical Notes:', margin, yPos);
    yPos += 6;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const techNotes = [
      '• All components comply with IEC standards.',
      '• Enclosure rating as per project specifications.',
      '• Busbars sized according to design calculations.',
      '• Cable sizing to be verified during detailed engineering.'
    ];
    
    techNotes.forEach(note => {
      doc.text(note, margin, yPos);
      yPos += 5;
    });
    
    return doc.output('blob');
  },
  
  // Generate Excel Export
  async generateExcel(data: OfferData, type: 'commercial' | 'technical'): Promise<Blob> {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['PROJECT INFORMATION'],
      ['Project Name', data.project.name],
      ['Customer', data.project.customer],
      ['Currency', data.project.currency],
      ['Date', formatDate(data.offer.date)],
      ['Offer Number', data.offer.number],
      [],
      ['SUMMARY'],
      ['Total Panels', data.panels.length],
      ['Total Items', data.summary.totalItems],
      ['Grand Total', data.summary.grandTotal]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Panel sheets
    data.panels.forEach((panel, index) => {
      const panelData: any[][] = [
        [panel.panelName],
        [panel.description],
        [],
        ['Code', 'Description', 'Brand', 'Category', 'Qty', 'Unit Price', 'Total']
      ];
      
      const allItems = [
        ...panel.incoming.map(i => ({ ...i, category: 'Incoming' })),
        ...panel.outgoing.map(i => ({ ...i, category: 'Outgoing' })),
        ...panel.enclosure.map(i => ({ ...i, category: 'Enclosure' })),
        ...panel.busbarAndCables.map(i => ({ ...i, category: 'Busbar & Cables' }))
      ];
      
      allItems.forEach(item => {
        panelData.push([
          item.itemCode,
          item.description,
          item.brand,
          item.category,
          item.quantity,
          item.unitPrice,
          item.lineTotal
        ]);
      });
      
      panelData.push([]);
      panelData.push(['', '', '', '', '', 'Panel Total:', panel.total]);
      
      const panelSheet = XLSX.utils.aoa_to_sheet(panelData);
      XLSX.utils.book_append_sheet(workbook, panelSheet, `Panel ${index + 1}`);
    });
    
    // Generate blob
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }
};

// Helper functions
function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
```

---

## ??? Offer Preview Component

```typescript
// src/components/offers/OfferPreview/OfferPreview.tsx

interface OfferPreviewProps {
  projectId: number;
  onClose: () => void;
}

export function OfferPreview({ projectId, onClose }: OfferPreviewProps) {
  const [offerData, setOfferData] = useState<OfferData | null>(null);
  const [offerType, setOfferType] = useState<'commercial' | 'technical'>('commercial');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    loadOfferData();
  }, [projectId]);
  
  useEffect(() => {
    if (offerData) {
      generatePreview();
    }
  }, [offerData, offerType]);
  
  async function loadOfferData() {
    const data = await offerService.prepareOfferData(projectId);
    setOfferData(data);
  }
  
  async function generatePreview() {
    if (!offerData) return;
    
    setIsGenerating(true);
    
    try {
      const blob = offerType === 'commercial'
        ? await offerService.generateCommercialPDF(offerData)
        : await offerService.generateTechnicalPDF(offerData);
      
      // Create URL for preview
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(URL.createObjectURL(blob));
    } finally {
      setIsGenerating(false);
    }
  }
  
  async function handleExportPDF() {
    if (!offerData) return;
    
    const blob = offerType === 'commercial'
      ? await offerService.generateCommercialPDF(offerData)
      : await offerService.generateTechnicalPDF(offerData);
    
    const filename = `${offerData.offer.number}_${offerType}.pdf`;
    downloadBlob(blob, filename);
  }
  
  async function handleExportExcel() {
    if (!offerData) return;
    
    const blob = await offerService.generateExcel(offerData, offerType);
    const filename = `${offerData.offer.number}_${offerType}.xlsx`;
    downloadBlob(blob, filename);
  }
  
  function handlePrint() {
    if (pdfUrl) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfUrl;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    }
  }
  
  return (
    <div className="offer-preview">
      <div className="preview-header">
        <div className="offer-type-toggle">
          <button
            className={offerType === 'commercial' ? 'active' : ''}
            onClick={() => setOfferType('commercial')}
          >
            ?? Commercial Offer
          </button>
          <button
            className={offerType === 'technical' ? 'active' : ''}
            onClick={() => setOfferType('technical')}
          >
            ?? Technical Offer
          </button>
        </div>
        
        <div className="export-actions">
          <Button variant="outline" onClick={handleExportPDF} icon={<PDFIcon />}>
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel} icon={<ExcelIcon />}>
            Export Excel
          </Button>
          <Button variant="outline" onClick={handlePrint} icon={<PrintIcon />}>
            Print
          </Button>
        </div>
      </div>
      
      <div className="preview-content">
        {isGenerating ? (
          <Loading message="Generating preview..." />
        ) : pdfUrl ? (
          <iframe
            src={`${pdfUrl}#view=FitH`}
            className="pdf-viewer"
            title="Offer Preview"
          />
        ) : (
          <EmptyState
            title="No Preview Available"
            description="Select an offer type to generate preview"
          />
        )}
      </div>
    </div>
  );
}
```

---

## ?? Offer Preview Styles

```css
/* src/components/offers/OfferPreview/OfferPreview.css */

.offer-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.offer-type-toggle {
  display: flex;
  gap: 8px;
}

.offer-type-toggle button {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.offer-type-toggle button:hover {
  border-color: var(--primary-color);
}

.offer-type-toggle button.active {
  border-color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 10%, white);
  color: var(--primary-color);
}

.export-actions {
  display: flex;
  gap: 8px;
}

.preview-content {
  flex: 1;
  padding: 24px;
  overflow: hidden;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
```

---

## ?? Commercial Offer Template (Visual Reference)

```
???????????????????????????????????????????????????????????????????
?                                                                  ?
?  [COMPANY LOGO]                           Company Name           ?
?                                           123 Business Street    ?
?                                           City, Country          ?
?                                           Tel: +1 234 567 8900   ?
?                                           email@company.com      ?
?                                                                  ?
?  ?????????????????????????????????????????????????????????????  ?
?                                                                  ?
?                     COMMERCIAL OFFER                             ?
?                     Offer No: SO-2024-0001                       ?
?                                                                  ?
?  ????????????????????????????????????????????????????????????????
?  ? Project: Office Building Main Distribution                  ??
?  ? Customer: ABC Corporation Ltd.                              ??
?  ? Currency: USD                                                ??
?  ? Date: January 15, 2024     Valid Until: February 14, 2024   ??
?  ????????????????????????????????????????????????????????????????
?                                                                  ?
?  SUMMARY BY PANEL                                                ?
?  ?????????????????????????????????????????????????????????????? ?
?  ? #  ? Panel                 ? Items     ? Margin ? Total    ? ?
?  ?????????????????????????????????????????????????????????????? ?
?  ? 1  ? Main Distribution     ? 12        ? 20%    ? $2,538   ? ?
?  ? 2  ? Sub-Distribution 1    ? 8         ? 20%    ? $1,245   ? ?
?  ? 3  ? Sub-Distribution 2    ? 8         ? 20%    ? $1,180   ? ?
?  ? 4  ? Lighting Panel        ? 15        ? 20%    ? $890     ? ?
?  ? 5  ? Emergency Panel       ? 6         ? 20%    ? $650     ? ?
?  ?????????????????????????????????????????????????????????????? ?
?                                                                  ?
?                                        ????????????????????????  ?
?                                        ?    GRAND TOTAL       ?  ?
?                                        ?    $6,503.00 USD     ?  ?
?                                        ????????????????????????  ?
?                                                                  ?
?  TERMS & CONDITIONS                                              ?
?  1. Prices valid for 30 days from date of offer.                ?
?  2. Delivery: 4-6 weeks from order confirmation.                ?
?  3. Payment terms: 50% advance, 50% before delivery.            ?
?  4. Warranty: As per manufacturer's standard warranty.          ?
?  5. Prices exclude installation and commissioning.              ?
?                                                                  ?
?  ?????????????????????????????????????????????????????????????  ?
?                                                                  ?
?  Prepared by: Sales Team          Signature: ________________   ?
?                                                                  ?
?  Page 1 of 1        This is a computer-generated document.      ?
?                                                                  ?
???????????????????????????????????????????????????????????????????
```

---

## ?? Technical Offer Template (Visual Reference)

```
???????????????????????????????????????????????????????????????????
?                                                                  ?
?  [COMPANY LOGO]                           Company Name           ?
?                                                                  ?
?                     TECHNICAL OFFER                              ?
?                                                                  ?
?  Project: Office Building          Reference: SO-2024-0001      ?
?  Customer: ABC Corporation         Date: January 15, 2024       ?
?                                                                  ?
?  ????????????????????????????????????????????????????????????????
?                                                                  ?
?  ? PANEL 1 - MAIN DISTRIBUTION                        12 items  ?
?  ????????????????????????????????????????????????????????????????
?  400A Main Distribution Panel for building power supply          ?
?                                                                  ?
?  INCOMING                                                        ?
?  ?????????????????????????????????????????????????????????????  ?
?  ? Code     ? Description             ? Brand  ? In ? Isc?Qty?  ?
?  ?????????????????????????????????????????????????????????????  ?
?  ? MCCB-400A? Main Circuit Breaker    ?Schneider?400A?50kA? 1 ?  ?
?  ? MCB-100A ? Incoming Switch         ?ABB     ?100A?25kA? 2 ?  ?
?  ?????????????????????????????????????????????????????????????  ?
?                                                                  ?
?  OUTGOING                                                        ?
?  ?????????????????????????????????????????????????????????????  ?
?  ? Code     ? Description             ? Brand  ? In ? Isc?Qty?  ?
?  ?????????????????????????????????????????????????????????????  ?
?  ? MCB-63A  ? Circuit Breaker 63A     ?Schneider?63A ?25kA? 3 ?  ?
?  ? MCB-32A  ? Circuit Breaker 32A     ?ABB     ?32A ?10kA? 5 ?  ?
?  ? CONT-25A ? Contactor 25A           ?Schneider?25A ? -  ? 2 ?  ?
?  ?????????????????????????????????????????????????????????????  ?
?                                                                  ?
?  ENCLOSURE                                                       ?
?  ?????????????????????????????????????????????????????????????  ?
?  ? ENC-IP55 ? Enclosure IP55 Floor    ?Rittal  ? -  ? -  ? 1 ?  ?
?  ?????????????????????????????????????????????????????????????  ?
?                                                                  ?
?  BUSBAR & CABLES                                                 ?
?  ?????????????????????????????????????????????????????????????  ?
?  ? BB-400A  ? Copper Busbar 400A      ?Generic ?400A? -  ? 1 ?  ?
?  ? CBL-SET  ? Cable Connection Set    ?Generic ? -  ? -  ? 1 ?  ?
?  ?????????????????????????????????????????????????????????????  ?
?                                                                  ?
?  ????????????????????????????????????????????????????????????????
?                                                                  ?
?  TECHNICAL NOTES                                                 ?
?  • All components comply with IEC standards.                    ?
?  • Enclosure rating: IP55, suitable for indoor installation.    ?
?  • Busbars sized according to design calculations.              ?
?  • Cable sizing to be verified during detailed engineering.     ?
?                                                                  ?
?  Page 1 of 3                                                     ?
?                                                                  ?
???????????????????????????????????????????????????????????????????
```

---

## ? Implementation Checklist

- [ ] Offer data preparation service
- [ ] Commercial offer PDF generation
- [ ] Technical offer PDF generation
- [ ] Excel export for both types
- [ ] Preview component with iframe viewer
- [ ] Type toggle (Commercial/Technical)
- [ ] Export buttons (PDF, Excel, Print)
- [ ] Company settings integration
- [ ] Custom terms and conditions
- [ ] Additional discount support
- [ ] Multi-page handling
- [ ] Responsive preview
- [ ] Loading states
- [ ] Error handling

---

**Congratulations!** ?? You have completed the frontend documentation. You can now implement the SmartOffer frontend application using these specifications.
