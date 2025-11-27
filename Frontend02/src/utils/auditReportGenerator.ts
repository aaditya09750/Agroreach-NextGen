import { AuditData } from '../services/farmerProductService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAuditReport = (data: AuditData): void => {
  try {
    generatePDFReport(data);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw error;
  }
};

const generatePDFReport = (data: AuditData): void => {
  const doc = new jsPDF() as any;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 0;

  // Colors matching UI
  const primaryGreen = [34, 197, 94]; // #22c55e
  const darkGray = [31, 41, 55]; // #1f2937
  const lightGray = [243, 244, 246]; // #f3f4f6
  const textGray = [107, 114, 128]; // #6b7280
  const white = [255, 255, 255];

  // Header with green background
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Logo Circle with leaf emoji
  doc.setFillColor(white[0], white[1], white[2]);
  doc.circle(25, 22, 10, 'F');
  doc.setFontSize(18);
  doc.text('🌱', 19, 27);

  // Title - centered better
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Audit Report', 42, 24);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('AgroReach NextGen Platform', 42, 32);

  yPosition = 55;

  // Farmer Information Card with better spacing
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(15, yPosition, pageWidth - 30, 32, 3, 3, 'F');
  
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Farmer Information', 20, yPosition + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  
  // Info in a row format for better balance
  const farmerInfoY = yPosition + 21;
  doc.text(`Name: ${data.farmer.name}`, 20, farmerInfoY);
  doc.text(`Email: ${data.farmer.email}`, 80, farmerInfoY);
  doc.text(`Phone: ${data.farmer.phone}`, 145, farmerInfoY);

  yPosition += 42;

  // Statistics Cards Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Summary Statistics', 20, yPosition);
  yPosition += 10;

  const statsCardWidth = (pageWidth - 40) / 4;
  const statsCardHeight = 28;
  const statsData = [
    { label: 'Total Products', value: data.summary.totalProducts, color: [34, 197, 94] },
    { label: 'In Stock', value: data.summary.inStock, color: [59, 130, 246] },
    { label: 'Out of Stock', value: data.summary.outOfStock, color: [239, 68, 68] },
    { label: 'Total Value', value: `₹${data.summary.totalValue}`, color: [168, 85, 247] }
  ];

  statsData.forEach((stat, index) => {
    const xPos = 15 + (index * statsCardWidth);
    
    // Card background with subtle border
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(xPos, yPosition, statsCardWidth - 6, statsCardHeight, 2, 2, 'F');
    
    // Colored top border indicator
    doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.roundedRect(xPos, yPosition, statsCardWidth - 6, 3, 2, 2, 'F');
    
    // Value - larger and centered
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    const valueStr = String(stat.value);
    const valueWidth = doc.getTextWidth(valueStr);
    doc.text(valueStr, xPos + (statsCardWidth - 6) / 2 - valueWidth / 2, yPosition + 15);
    
    // Label - better positioned
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    const labelWidth = doc.getTextWidth(stat.label);
    doc.text(stat.label, xPos + (statsCardWidth - 6) / 2 - labelWidth / 2, yPosition + 23);
  });

  yPosition += statsCardHeight + 10;

  // Product Details Table Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Product Details', 20, yPosition);
  yPosition += 6;

  // Table data
  const tableData = data.products.map(product => [
    product.name,
    product.category,
    `₹${product.price.toFixed(2)}`,
    `${product.stock} ${product.unit}`,
    product.status,
    `${product.discount}%`,
    formatDateTime(product.createdAt)
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Product', 'Category', 'Price', 'Stock', 'Status', 'Discount', 'Created']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryGreen,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkGray,
      cellPadding: 3,
      lineColor: [220, 220, 220],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    columnStyles: {
      0: { cellWidth: 36, halign: 'left' },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 24, halign: 'right' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 24, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 30, halign: 'center', fontSize: 7 }
    },
    margin: { left: 15, right: 15 }
  });

  // Footer Section
  const finalY = (doc as any).lastAutoTable.finalY + 12;
  
  // Footer box with light background
  const footerBoxHeight = 20;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(15, finalY, pageWidth - 30, footerBoxHeight, 2, 2, 'F');
  
  // Footer content with better layout
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  
  // Left side - Report generated time
  doc.text(`Report Generated: ${formatDateTime(data.generatedAt)}`, 20, finalY + 8);
  
  // Right side - Platform branding
  doc.text('Powered by AgroReach NextGen Platform', pageWidth - 20, finalY + 8, { align: 'right' });

  // Bottom row - Average Price Info
  if (data.summary.averagePrice) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`Average Price: ₹${data.summary.averagePrice}`, 20, finalY + 15);
  }

  // Save PDF
  doc.save(`Product_Audit_Report_${formatDate(new Date())}.pdf`);
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
