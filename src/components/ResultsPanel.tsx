import React, { useRef } from 'react';
import { Scale, AlertTriangle, Clock, Copy } from 'lucide-react';
import { LegalAnalysis } from '../types';

interface ResultsPanelProps {
  analysis: LegalAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

const sections = [
  { key: 'التكييف_القانوني', label: 'التكييف القانوني', color: 'blue' },
  { key: 'النصوص_القانونية_ذات_الصلة', label: 'النصوص القانونية ذات الصلة', color: 'amber' },
  { key: 'الوقائع_الجوهرية', label: 'الوقائع الجوهرية', color: 'slate' },
  { key: 'العناصر_المادية_والمعنوية', label: 'العناصر المادية والمعنوية', color: 'purple' },
  { key: 'الدفاعات_الممكنة', label: 'الدفاعات الممكنة', color: 'red' },
  { key: 'الإجراءات_المقترحة', label: 'الإجراءات المقترحة', color: 'green' },
  { key: 'سوابق_قضائية_مغربية_محتملة', label: 'سوابق قضائية مغربية محتملة', color: 'indigo' },
];

const colorMap: Record<string, string> = {
  blue: 'border-blue-400 bg-blue-50',
  amber: 'border-amber-400 bg-amber-50',
  slate: 'border-slate-400 bg-slate-50',
  purple: 'border-purple-400 bg-purple-50',
  red: 'border-red-400 bg-red-50',
  green: 'border-green-400 bg-green-50',
  indigo: 'border-indigo-400 bg-indigo-50',
};

const AccordionSection = ({ title, items, color, open, onClick }: { title: string; items: string[]; color: string; open: boolean; onClick: () => void }) => (
  <div className={`mb-3 rounded-xl border ${colorMap[color]} transition-all`}> 
    <button
      className="w-full flex justify-between items-center px-5 py-3 text-right font-bold text-lg focus:outline-none"
      onClick={onClick}
      type="button"
    >
      <span>{title}</span>
      <span>{open ? '▲' : '▼'}</span>
    </button>
    {open && (
      <div className="px-6 pb-4 pt-1">
        <ul className="list-disc pr-6 space-y-1 text-md text-slate-900">
          {items && items.length > 0 ? items.map(item => <li key={item}>{item}</li>) : <li>لا يوجد بيانات</li>}
        </ul>
      </div>
    )}
  </div>
);

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ analysis, isLoading, error }) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Copy all analysis as formatted text
  const handleCopy = () => {
    let text = '';
    sections.forEach(({ key, label }) => {
      const items = (analysis as any)[key] as string[];
      if (items && items.length > 0) {
        text += `\n${label}:\n`;
        items.forEach(item => {
          text += `- ${item}\n`;
        });
      }
    });
    navigator.clipboard.writeText(text.trim());
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-800 animate-spin" />
          <h3 className="text-lg font-semibold text-slate-800">Analyzing Case...</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Processing legal analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-red-200">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800">Analysis Error</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-blue-800" />
          <h3 className="text-lg font-semibold text-slate-800">Legal Analysis</h3>
        </div>
        <div className="text-center py-12">
          <Scale className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Enter case details and click "Analyze Case" to get legal classifications and recommendations.</p>
        </div>
      </div>
    );
  }

  // If structured fields are empty and analysis.raw exists, show the raw text
  const isStructured = analysis.التكييف_القانوني?.length || analysis.النصوص_القانونية_ذات_الصلة?.length || analysis.الوقائع_الجوهرية?.length || analysis.العناصر_المادية_والمعنوية?.length || analysis.الدفاعات_الممكنة?.length || analysis.الإجراءات_المقترحة?.length || analysis.سوابق_قضائية_مغربية_محتملة?.length;
  if (!isStructured && analysis.raw) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <Scale className="w-6 h-6 text-blue-700" />
          <h3 className="text-2xl font-bold text-blue-900 tracking-tight">نتائج التحليل القانوني</h3>
        </div>
        <div className="mb-3 text-blue-800 font-semibold text-lg">النص الكامل</div>
        <div
          className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6 text-slate-900 whitespace-pre-line overflow-auto shadow-inner"
          style={{ maxHeight: 400, fontSize: '1.15rem', lineHeight: '2.1', direction: 'rtl', fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', letterSpacing: '0.01em' }}
        >
          {analysis.raw}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-200" dir="rtl" style={{ fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif' }} ref={panelRef}>
      <div className="flex items-center gap-3 mb-6">
        <Scale className="w-6 h-6 text-blue-700" />
        <h3 className="text-2xl font-bold text-blue-900 tracking-tight">نتائج التحليل القانوني</h3>
      </div>
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm shadow transition-all"
        >
          <Copy className="w-4 h-4" /> نسخ التحليل
        </button>
      </div>
      <div>
        {sections.map((section, idx) => (
          <AccordionSection
            key={section.key}
            title={section.label}
            items={(analysis as any)[section.key] || []}
            color={section.color}
            open={openIndex === idx}
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          />
        ))}
      </div>
    </div>
  );
};