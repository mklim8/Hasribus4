import React, { useRef, useState } from 'react';
import { Download, X, FileText, MonitorPlay, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { AgentNode, AgencyMetrics } from '../types';
import { SlideOne } from './presentation/SlideOne';
import { SlideTwo } from './presentation/SlideTwo';
import { PresentationConfig } from './presentation/PresentationControlsPanel';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide1Tree: AgentNode;
  slide1Metrics: AgencyMetrics;
  slide2Tree: AgentNode;
  slide2Metrics: AgencyMetrics;
  config: PresentationConfig;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  slide1Tree,
  slide1Metrics,
  slide2Tree,
  slide2Metrics,
  config,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const slide1Ref = useRef<HTMLDivElement>(null);
  const slide2Ref = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const getHtml2CanvasOptions = () => ({
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#fcfdff',
    windowWidth: 1920,
    windowHeight: 1080,
    onclone: (clonedDoc: Document) => {
      // Remove all external stylesheets to prevent oklch fetch/CORS errors on production builds (Netlify)
      const linkSheets = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
      linkSheets.forEach((link) => link.remove());

      // Sanitize any inline style tags
      const sheets = clonedDoc.querySelectorAll('style');
      sheets.forEach((sheet) => {
        if (sheet.textContent) {
          sheet.textContent = sheet.textContent.replace(/oklch\([^)]+\)/g, '#334155');
        }
      });

      const fallbackStyle = clonedDoc.createElement('style');
      fallbackStyle.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif !important; }
        :root {
          --color-slate-900: #0f172a;
          --color-slate-800: #1e293b;
          --color-slate-700: #334155;
          --color-slate-600: #475569;
          --color-slate-500: #64748b;
          --color-slate-400: #94a3b8;
          --color-slate-300: #cbd5e1;
          --color-slate-200: #e2e8f0;
          --color-slate-100: #f1f5f9;
          --color-slate-50: #f8fafc;
          --color-indigo-900: #312e81;
          --color-indigo-700: #4338ca;
          --color-indigo-600: #4f46e5;
          --color-indigo-500: #6366f1;
          --color-indigo-200: #c7d2fe;
          --color-indigo-100: #e0e7ff;
          --color-indigo-50: #eef2ff;
          --color-emerald-900: #064e3b;
          --color-emerald-700: #047857;
          --color-emerald-600: #059669;
          --color-emerald-500: #10b981;
          --color-emerald-300: #6ee7b7;
          --color-emerald-200: #a7f3d0;
          --color-emerald-100: #d1fae5;
          --color-emerald-50: #ecfdf5;
          --color-blue-900: #1e3a8a;
          --color-blue-700: #1d4ed8;
          --color-blue-600: #2563eb;
          --color-blue-50: #eff6ff;
          --color-amber-900: #78350f;
          --color-amber-300: #fcd34d;
          --color-amber-100: #fef3c7;
          --color-sky-900: #0c4a6e;
          --color-sky-300: #7dd3fc;
          --color-sky-100: #e0f2fe;
        }
        body, div, span, h1, h2, h3, p { color-scheme: light; }
      `;
      clonedDoc.head.appendChild(fallbackStyle);
    },
  });

  const handleExportPresentationPdf = async () => {
    if (!slide1Ref.current || !slide2Ref.current) return;
    setIsGenerating(true);

    try {
      // Initialize jsPDF in landscape mode with 16:9 aspect ratio (297mm x 167.14mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [297, 167.14],
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Capture Slide 1
      const canvas1 = await html2canvas(slide1Ref.current, getHtml2CanvasOptions());
      const imgData1 = canvas1.toDataURL('image/png', 1.0);
      pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Add Page 2 for Slide 2
      pdf.addPage([297, 167.14], 'landscape');
      const canvas2 = await html2canvas(slide2Ref.current, getHtml2CanvasOptions());
      const imgData2 = canvas2.toDataURL('image/png', 1.0);
      pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, pdfHeight);

      pdf.save('KAF_Agency_Presentation.pdf');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error generating presentation PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-8 flex flex-col items-center text-center">
        
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
          <MonitorPlay className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-black text-slate-900">Export Presentation PDF</h3>
        <p className="text-sm text-slate-600 mt-2 max-w-md">
          Generate a 2-page landscape 16:9 professional presentation PDF (<span className="font-bold text-slate-900">KAF_Agency_Presentation.pdf</span>) containing live dynamically calculated Slide 1 and Slide 2 scenarios.
        </p>

        <div className="flex items-center gap-3 mt-8 w-full justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            onClick={handleExportPresentationPdf}
            disabled={isGenerating || success}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-60"
          >
            {success ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span>PDF Downloaded!</span>
              </>
            ) : isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Rendering PDF Slides...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download Presentation PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Off-screen hidden exact 1920x1080 slide renderers for high fidelity html2canvas capture */}
        <div className="absolute -left-[9999px] top-0 overflow-hidden pointer-events-none">
          <div ref={slide1Ref} className="w-[1920px] h-[1080px] bg-[#fcfdff]">
            <SlideOne tree={slide1Tree} metrics={slide1Metrics} />
          </div>
          <div ref={slide2Ref} className="w-[1920px] h-[1080px] bg-[#fcfdff]">
            <SlideTwo tree={slide2Tree} metrics={slide2Metrics} slide1Metrics={slide1Metrics} config={config} />
          </div>
        </div>

      </div>
    </div>
  );
};
