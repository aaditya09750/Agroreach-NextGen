declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  export interface AutoTableOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: any;
    bodyStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: any;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    [key: string]: any;
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}
