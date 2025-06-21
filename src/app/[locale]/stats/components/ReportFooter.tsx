import React from 'react';
import { FileDown, Printer, Share2, Download } from 'lucide-react';

interface ReportFooterProps {
  onExportPdf: () => void;
  onPrint: () => void;
  onShare: () => void;
  onExport: () => void;
}

export function ReportFooter({ onExportPdf, onPrint, onShare, onExport }: ReportFooterProps) {
  return (
    <div className="flex items-center justify-between p-4 border-t">
      <span className="text-sm text-gray-500">Report generated on June 8, 2025</span>
      <div className="flex items-center space-x-3">
        <button
          onClick={onExportPdf}
          className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 border rounded transition-colors"
        >
          <FileDown className="h-4 w-4 mr-1.5" />
          PDF
        </button>
        <button
          onClick={onPrint}
          className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 border rounded transition-colors"
        >
          <Printer className="h-4 w-4 mr-1.5" />
          Print
        </button>
        <button
          onClick={onShare}
          className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 border rounded transition-colors"
        >
          <Share2 className="h-4 w-4 mr-1.5" />
          Share
        </button>
        <button
          onClick={onExport}
          className="inline-flex items-center px-3 py-1.5 text-sm text-white bg-gray-800 hover:bg-gray-900 rounded transition-colors"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Export
        </button>
      </div>
    </div>
  );
}
