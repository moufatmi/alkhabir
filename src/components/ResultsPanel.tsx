import React from 'react';
import { Scale, BookOpen, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { LegalAnalysis } from '../types';

interface ResultsPanelProps {
  analysis: LegalAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

const Section = ({ title, items }: { title: string; items: string[] }) => (
  <div className="mb-6">
    <div className="font-semibold text-blue-800 mb-2 text-lg">{title}</div>
    <ul className="list-disc pr-6 space-y-1 text-lg text-slate-900">
      {items && items.length > 0 ? items.map((item, i) => <li key={i}>{item}</li>) : <li>لا يوجد بيانات</li>}
    </ul>
  </div>
);

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ analysis, isLoading, error }) => {
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
  const isStructured = analysis.classifications?.length || analysis.keyFactors?.length || analysis.recommendedActions?.length || (analysis.precedentCases && analysis.precedentCases.length);
  if (!isStructured && analysis.raw) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <Scale className="w-6 h-6 text-blue-700" />
          <h3 className="text-2xl font-bold text-blue-900 tracking-tight">Legal Analysis Results</h3>
        </div>
        <div className="mb-3 text-blue-800 font-semibold text-lg">Full Legal Analysis</div>
        <div
          className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6 text-slate-900 whitespace-pre-line overflow-auto shadow-inner"
          style={{ maxHeight: 400, fontSize: '1.15rem', lineHeight: '2.1', direction: 'rtl', fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', letterSpacing: '0.01em' }}
        >
          {analysis.raw}
        </div>
      </div>
    );
  }

  // Beautiful Arabic-friendly structured display
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-200" dir="rtl" style={{ fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif' }}>
      <div className="flex items-center gap-3 mb-6">
        <Scale className="w-6 h-6 text-blue-700" />
        <h3 className="text-2xl font-bold text-blue-900 tracking-tight">نتائج التحليل القانوني</h3>
      </div>
      <Section title="التكييفات القانونية" items={analysis.classifications || []} />
      <Section title="العوامل الرئيسية" items={analysis.keyFactors || []} />
      <Section title="الإجراءات الموصى بها" items={analysis.recommendedActions || []} />
      <Section title="سوابق قضائية مشابهة" items={analysis.precedentCases || []} />
    </div>
  );
};