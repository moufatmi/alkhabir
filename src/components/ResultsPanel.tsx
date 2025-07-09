import React, { useState } from 'react';
import { Scale, AlertTriangle, Clock, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import { LegalAnalysis } from '../types';

interface ResultsPanelProps {
  analysis: LegalAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

const sections = [
  { key: 'نوع_القضية', label: 'نوع القضية' },
  { key: 'التكييف_القانوني', label: 'التكييف القانوني' },
  { key: 'النصوص_القانونية_ذات_الصلة', label: 'النصوص القانونية ذات الصلة' },
  { key: 'الوقائع_الجوهرية', label: 'الوقائع الجوهرية' },
  { key: 'العناصر_المادية_والمعنوية', label: 'العناصر المادية والمعنوية' },
  { key: 'الدفاعات_الممكنة', label: 'الدفاعات الممكنة' },
  { key: 'الإجراءات_المقترحة', label: 'الإجراءات المقترحة' },
  { key: 'سوابق_قضائية_مغربية_محتملة', label: 'سوابق قضائية مغربية محتملة' },
];

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ analysis, isLoading, error }) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(() => {
    // Open first section by default
    return { نوع_القضية: true };
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    // Open all sections before printing
    const allOpen: { [key: string]: boolean } = {};
    sections.forEach(({ key }) => {
      allOpen[key] = true;
    });
    setOpenSections(allOpen);
    setTimeout(() => {
      window.print();
    }, 300); // Wait for UI to update
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-800 animate-spin" />
          <h3 className="text-lg font-semibold text-slate-800">جارٍ تحليل القضية...</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">يتم الآن توليد التحليل القانوني...</p>
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
          <h3 className="text-lg font-semibold text-red-800">خطأ أثناء التحليل</h3>
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
          <h3 className="text-lg font-semibold text-slate-800">التحليل القانوني</h3>
        </div>
        <div className="text-center py-12">
          <Scale className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">أدخل وقائع القضية واضغط على "تحليل القضية" للحصول على التكييف والتوصيات القانونية.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 space-y-4 print:shadow-none print:border-0" dir="rtl">
      <div className="flex items-center gap-2 mb-4 justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-800" />
          <h3 className="text-lg font-semibold text-slate-800">نتائج التحليل القانوني</h3>
        </div>
        {analysis && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm shadow transition print:hidden"
            title="طباعة النتائج"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </button>
        )}
      </div>
      <div className="divide-y divide-slate-200">
        {sections.map(({ key, label }) => {
          const value = (analysis as any)[key];
          if (!value) return null;
          const isArray = Array.isArray(value);
          return (
            <div key={key} className="py-2">
              <button
                className="flex items-center justify-between w-full text-right focus:outline-none py-2"
                onClick={() => toggleSection(key)}
                aria-expanded={!!openSections[key]}
              >
                <span className="text-md font-semibold text-slate-800">{label}</span>
                {openSections[key] ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {openSections[key] && (
                <div className="mt-2 pr-2">
                  {isArray ? (
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      {value.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-600">{value}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
