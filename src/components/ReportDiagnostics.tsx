import React, { useState } from 'react';

interface DiagnosticInfo {
  fontStatus: 'loading' | 'success' | 'error';
  fontError?: string;
  browserInfo: string;
  analysisData?: any;
}

interface ReportDiagnosticsProps {
  analysis: any;
  onClose: () => void;
}

export const ReportDiagnostics: React.FC<ReportDiagnosticsProps> = ({ analysis, onClose }) => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo>({
    fontStatus: 'loading',
    browserInfo: navigator.userAgent,
  });

  const runDiagnostics = async () => {
    try {
      // Test font loading
      setDiagnostics(prev => ({ ...prev, fontStatus: 'loading' }));
      
      const fontResponse = await fetch('/fonts/NotoSansArabic-Regular.ttf');
      if (fontResponse.ok) {
        const fontSize = fontResponse.headers.get('content-length');
        setDiagnostics(prev => ({ 
          ...prev, 
          fontStatus: 'success',
          fontError: undefined 
        }));
        console.log('Font test successful, size:', fontSize);
      } else {
        throw new Error(`Font fetch failed: ${fontResponse.status}`);
      }
    } catch (error) {
      setDiagnostics(prev => ({ 
        ...prev, 
        fontStatus: 'error',
        fontError: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
    
    // Store analysis data for inspection
    setDiagnostics(prev => ({ ...prev, analysisData: analysis }));
  };

  React.useEffect(() => {
    runDiagnostics();
  }, []);

  const copyDiagnosticsToClipboard = () => {
    const diagnosticsText = JSON.stringify({
      fontStatus: diagnostics.fontStatus,
      fontError: diagnostics.fontError,
      browserInfo: diagnostics.browserInfo,
      analysisKeys: analysis ? Object.keys(analysis) : [],
      hasAnalysisData: !!analysis,
      timestamp: new Date().toISOString()
    }, null, 2);
    
    navigator.clipboard.writeText(diagnosticsText);
    alert('تم نسخ معلومات التشخيص إلى الحافظة');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" dir="rtl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">تشخيص مشاكل توليد التقرير</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Font Status */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">حالة خط اللغة العربية:</h3>
            <div className="flex items-center gap-2">
              {diagnostics.fontStatus === 'loading' && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              {diagnostics.fontStatus === 'success' && (
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              )}
              {diagnostics.fontStatus === 'error' && (
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              )}
              <span className={`
                ${diagnostics.fontStatus === 'success' ? 'text-green-600' : ''}
                ${diagnostics.fontStatus === 'error' ? 'text-red-600' : ''}
                ${diagnostics.fontStatus === 'loading' ? 'text-blue-600' : ''}
              `}>
                {diagnostics.fontStatus === 'loading' && 'جاري فحص الخط...'}
                {diagnostics.fontStatus === 'success' && 'الخط متوفر وجاهز'}
                {diagnostics.fontStatus === 'error' && `فشل تحميل الخط: ${diagnostics.fontError}`}
              </span>
            </div>
          </div>

          {/* Analysis Data */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">بيانات التحليل:</h3>
            {analysis ? (
              <div>
                <p className="text-green-600 mb-2">✓ بيانات التحليل متوفرة</p>
                <p className="text-sm text-gray-600">المفاتيح المتوفرة: {Object.keys(analysis).join(', ')}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600">عرض البيانات الكاملة</summary>
                  <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto max-h-40" dir="ltr">
                    {JSON.stringify(analysis, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-red-600">✗ لا توجد بيانات تحليل</p>
            )}
          </div>

          {/* Browser Info */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">معلومات المتصفح:</h3>
            <p className="text-sm text-gray-600 break-all" dir="ltr">{diagnostics.browserInfo}</p>
          </div>

          {/* Instructions */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold mb-2">خطوات التشخيص الإضافية:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>افتح أدوات المطور (F12)</li>
              <li>اذهب إلى تبويب Console</li>
              <li>حاول توليد التقرير مرة أخرى</li>
              <li>ابحث عن أي رسائل خطأ حمراء</li>
              <li>انسخ معلومات التشخيص أدناه وأرسلها للدعم</li>
            </ol>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={copyDiagnosticsToClipboard}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            نسخ معلومات التشخيص
          </button>
          <button
            onClick={runDiagnostics}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
          >
            إعادة الفحص
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};