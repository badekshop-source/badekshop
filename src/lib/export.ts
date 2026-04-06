// src/lib/export.ts
import ExcelJS from 'exceljs';

export interface ExportColumn {
  key: string;
  header: string;
  format?: 'date' | 'currency' | 'number' | 'link';
  width?: number;
}

interface StatusColor {
  bg: string;
  font: string;
}

const statusColors: Record<string, StatusColor> = {
  pending: { bg: 'FFF3CD', font: '856404' },
  paid: { bg: 'CCE5FF', font: '004085' },
  processing: { bg: 'D4EDDA', font: '155724' },
  approved: { bg: '28A745', font: 'FFFFFF' },
  completed: { bg: '155724', font: 'FFFFFF' },
  cancelled: { bg: 'F8D7DA', font: '721C24' },
  expired: { bg: 'E2E3E5', font: '383D41' },
  rejected: { bg: 'DC3545', font: 'FFFFFF' },
  auto_approved: { bg: '28A745', font: 'FFFFFF' },
  under_review: { bg: 'FFF3CD', font: '856404' },
  retry_1: { bg: 'FFE8A1', font: '664D03' },
  retry_2: { bg: 'FFECB5', font: '664D03' },
};

export const orderExportColumns: ExportColumn[] = [
  { key: 'priority', header: 'Priority', format: 'number', width: 10 },
  { key: 'arrivalDate', header: 'Arrival Date', format: 'date', width: 14 },
  { key: 'flightNumber', header: 'Flight', width: 12 },
  { key: 'orderNumber', header: 'Order #', width: 16 },
  { key: 'orderDate', header: 'Order Date', format: 'date', width: 14 },
  { key: 'productType', header: 'Type', width: 10 },
  { key: 'productName', header: 'Product', width: 25 },
  { key: 'duration', header: 'Days', format: 'number', width: 8 },
  { key: 'totalAmount', header: 'Amount (Rp)', format: 'currency', width: 15 },
  { key: 'customerName', header: 'Customer Name', width: 20 },
  { key: 'nationality', header: 'Nationality', width: 15 },
  { key: 'customerEmail', header: 'Email', width: 25 },
  { key: 'customerPhone', header: 'Phone', width: 15 },
  { key: 'imeiNumber', header: 'IMEI', width: 18 },
  { key: 'kycStatus', header: 'KYC Status', width: 14 },
  { key: 'passportUrl', header: 'Passport Link', format: 'link', width: 30 },
  { key: 'orderStatus', header: 'Order Status', width: 14 },
  { key: 'paymentStatus', header: 'Payment', width: 12 },
  { key: 'qrCodeUrl', header: 'QR Code', format: 'link', width: 30 },
];

export function generateCSV(
  data: Record<string, unknown>[],
  columns: ExportColumn[]
): string {
  const header = columns.map((c) => c.header).join(',');
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const value = row[c.key];
        if (value === null || value === undefined) return '';
        if (c.format === 'currency') {
          return Number(value).toLocaleString('id-ID');
        }
        if (c.format === 'date') {
          return value instanceof Date
            ? value.toISOString().split('T')[0]
            : String(value);
        }
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(',')
  );
  return [header, ...rows].join('\n');
}

export async function generateXLSX(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  options?: {
    title?: string;
    statusColumn?: string;
  }
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(options?.title || 'Orders');

  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4472C4' },
  };
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };

  data.forEach((row) => {
    const rowData: Record<string, unknown> = {};
    columns.forEach((col) => {
      rowData[col.key] = row[col.key];
    });
    const excelRow = worksheet.addRow(rowData);

    columns.forEach((col, index) => {
      const cell = excelRow.getCell(index + 1);
      if (col.format === 'currency') {
        cell.numFmt = '#,##0';
      } else if (col.format === 'date') {
        cell.numFmt = 'YYYY-MM-DD';
      }
    });

    const statusCol = options?.statusColumn || 'orderStatus';
    const status = String(row[statusCol] || '');
    if (statusColors[status]) {
      const color = statusColors[status];
      excelRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color.bg },
        };
        cell.font = { color: { argb: color.font } };
      });
    }
  });

  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };

  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function formatDateForExport(date: Date | string | null): string {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export function formatCurrencyForExport(amount: number | null): string {
  if (amount === null || amount === undefined) return '0';
  return amount.toLocaleString('id-ID');
}

export function calculatePriority(order: {
  arrivalDate: Date | string | null;
  orderStatus: string | null;
  paymentStatus: string | null;
  kycStatus: string | null;
}): number {
  const statusWeight: Record<string, number> = {
    approved: 100,
    processing: 80,
    paid: 60,
    pending: 40,
    expired: 0,
    cancelled: 0,
    rejected: 0,
  };

  const paymentWeight = order.paymentStatus === 'paid' ? 50 : 0;
  const kycWeight =
    order.kycStatus === 'approved' || order.kycStatus === 'auto_approved' ? 30 : 0;

  let daysUntilArrival = 999;
  if (order.arrivalDate) {
    const arrival = new Date(order.arrivalDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    arrival.setHours(0, 0, 0, 0);
    daysUntilArrival = Math.ceil((arrival.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    daysUntilArrival = Math.max(0, Math.min(daysUntilArrival, 30));
  }

  const baseWeight = statusWeight[order.orderStatus || 'pending'] || 0;
  return baseWeight + paymentWeight + kycWeight - daysUntilArrival;
}

export function getPriorityLabel(priority: number): string {
  if (priority >= 100) return 'HIGH';
  if (priority >= 50) return 'MEDIUM';
  return 'LOW';
}