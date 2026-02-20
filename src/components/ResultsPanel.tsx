import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Scale, AlertTriangle, Clock, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { LegalAnalysis } from '../types';

interface ResultsPanelProps {
  analysis: LegalAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

export interface ResultsPanelHandle {
  print: () => void;
}

const sections = [
  { key: 'الوقائع_الجوهرية', label: 'أولاً: الوقائع الجوهرية' },
  { key: 'التكييف_القانوني', label: 'ثانياً: التكييف والإشكاليات القانونية' },
  { key: 'النصوص_القانونية_ذات_الصلة', label: 'ثالثاً: النصوص القانونية المعتمدة' },
  { key: 'العناصر_المادية_والمعنوية', label: 'رابعاً: التعليل والتحليل القانوني' },
  { key: 'سوابق_قضائية_مغربية_محتملة', label: 'خامساً: الاجتهاد القضائي (قرارات محكمة النقض)' },
  { key: 'الدفاعات_الممكنة', label: 'سادساً: الدفوع المثارة والمحتملة' },
  { key: 'الإجراءات_المقترحة', label: 'سابعاً: الحل القانوني والمنطوق المقترح' },
  { key: 'تحليل_النازلة', label: 'ثامناً: تحليل النازلة (التعليل المفصل)' },
  { key: 'نوع_القضية', label: 'تصنيف النازلة' },
];

export const ResultsPanel = forwardRef<ResultsPanelHandle, ResultsPanelProps>(({ analysis, isLoading, error }, ref) => {
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

  useImperativeHandle(ref, () => ({
    print: handlePrint
  }));

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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Scale className="w-5 h-5 text-blue-800" />
          </motion.div>
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

      {/* Print Trigger Button (Screen Only) */}
      <div className="flex justify-end mb-4 no-print">
        {analysis && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm shadow transition font-bold"
            title="طباعة النتائج"
          >
            <Printer className="w-4 h-4" />
            طباعة التقرير
          </button>
        )}
      </div>

      <div id="printable-area">
        {/* Print Header */}
        <div className="hidden print:block text-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold font-serif mb-2">تقرير المستشار القانوني - الخبير</h1>
          <p className="text-sm text-gray-500">تم إنشاء هذا التقرير بتاريخ: {new Date().toLocaleDateString('ar-MA')}</p>
        </div>

        <div className="flex items-center gap-2 mb-4 justify-between print:hidden">
          <div className="flex items-center gap-2">
            <motion.div
              animate={isLoading ? {
                scale: [1, 1.2, 1],
                filter: ["blur(0px)", "blur(2px)", "blur(0px)"]
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Scale className="w-6 h-6 text-blue-800" />
            </motion.div>
            <h3 className="text-lg font-bold text-slate-800 glow-blue">نتائج التحليل القانوني</h3>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {sections.map(({ key, label }) => {
            const value = (analysis as any)[key];
            if (!value) return null;
            const isArray = Array.isArray(value);
            return (
              <div key={key} className="py-2 break-inside-avoid">
                <button
                  className="flex items-center justify-between w-full text-right focus:outline-none py-2 no-print"
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
                {/* For print, we usually want to see the header static, not as a button. 
                    The button is .no-print, so we need a visible header for print. 
                */}
                <h4 className="hidden print:block text-lg font-bold mb-2 mt-4 text-slate-900 border-b border-slate-300 pb-1">{label}</h4>

                {(openSections[key] || true) && ( // Always show logic is handled by handlePrint opening all, but for safety in print we can force true if we detect print mode, but JS doesn't detect print mode easily without listeners. relying on handlePrint is fine.
                  <div className={`mt-2 pr-2 ${!openSections[key] ? 'hidden print:block' : ''}`}>
                    {isArray ? (
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        {value.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{value}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Print Footer */}
        <div className="hidden print:block mt-12 text-center text-xs text-gray-400 border-t pt-4 break-inside-avoid">
          <p className="mb-1">هذا التحليل تم بواسطة الذكاء الاصطناعي ويظل رأياً استشاريًا لا يعوض استشارة المحامي المختص.</p>
          <p dir="ltr">www.alkhabir.ma</p>
        </div>
      </div>
    </div>
  );
});
