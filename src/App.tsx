import { useState, useEffect } from 'react';
import { CaseSummaryInput } from './components/CaseSummaryInput';
import { ResultsPanel } from './components/ResultsPanel';
import { analyzeLegalCase, askLegalQuestion, suggestClarifyingQuestions } from './services/legalAnalysis';
import LegalQuestionPage from './components/LegalQuestionPage';

type HistoryItem = {
  id: number;
  text: string;
  analysis: any;
  time: string;
};

function App() {
  const [caseText, setCaseText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showLegalQuestion, setShowLegalQuestion] = useState(false);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [clarifyingQuestionsRaw, setClarifyingQuestionsRaw] = useState('');
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('caseHistory');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('caseHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    let ignore = false;
    if (!caseText.trim()) {
      setClarifyingQuestions([]);
      return;
    }
    setIsQuestionsLoading(true);
    suggestClarifyingQuestions(caseText)
      .then((result) => {
        console.log('Clarifying questions result:', result);
        if (result && typeof result === 'object') {
          Object.entries(result).forEach(([k, v]) => {
            console.log('Key:', k, 'Value:', v);
          });
        }
        if (ignore) return;
        let questions: string[] = [];
        let rawText = '';
        if (typeof result === 'string') {
          questions = result.split(/\n|\r/).map(q => q.trim()).filter(q => q.length > 0);
        } else if (result && typeof result === 'object' && result.raw && typeof result.raw === 'string') {
          questions = result.raw.split(/\n|\r/).map(q => q.trim()).filter(q => q.length > 0);
        } else if (result && typeof result === 'object') {
          // Try to find the first array property
          const arrProp = Object.values(result).find((v) => Array.isArray(v));
          if (arrProp) {
            questions = arrProp as string[];
          } else if (result.raw && typeof result.raw === 'string') {
            rawText = result.raw.trim();
            // Extract lines that look like numbered or asterisked questions
            questions = result.raw
              .split(/\n|\r/)
              .map((line: string) => line.trim())
              .filter((line: string) => /^\d+\.\s*(\*\*)?/.test(line))
              .map((line: string) => line.replace(/^\d+\.\s*(\*\*)?\s*/, '').replace(/\*\*$/, '').trim());
            // Fallback: if no questions found, show the whole raw as one question
            if (questions.length === 0) {
              questions = [rawText];
            }
            console.log('Parsed clarifying questions:', questions);
          } else {
            // Try to find the first string property and split by lines
            const strProp = Object.values(result).find((v) => typeof v === 'string');
            if (strProp) {
              questions = (strProp as string).split(/\n|\r/).filter((q) => q.trim().length > 0);
            }
          }
        }
        setClarifyingQuestions(questions);
        setClarifyingQuestionsRaw(rawText);
      })
      .catch(() => {
        if (!ignore) setClarifyingQuestions([]);
      })
      .finally(() => {
        if (!ignore) setIsQuestionsLoading(false);
      });
    return () => { ignore = true; };
  }, [caseText]);

  const handleAnalyzeCase = async () => {
    if (!caseText.trim()) {
      setError('Please enter case details.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeLegalCase(caseText);
      setAnalysis(result);
      // Add to history
      setHistory([
        {
          id: Date.now(),
          text: caseText,
          analysis: result,
          time: new Date().toLocaleString(),
        },
        ...history,
      ]);
    } catch (err) {
      setError('An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    setCaseText('');
    setAnalysis(null);
    setError(null);
  };

  const handleReopenCase = (item: HistoryItem) => {
    setCaseText(item.text);
    setAnalysis(item.analysis);
    setShowHistory(false);
  };

  if (showLegalQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setShowLegalQuestion(false)}
            className="mb-6 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium"
          >
            ⬅ العودة للتحليل الرئيسي
          </button>
          <LegalQuestionPage askLegalQuestion={askLegalQuestion} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row-reverse items-center justify-between h-16" dir="rtl">
            {/* Right: Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-800 p-2 rounded-lg"></div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">الخبير | Alkhabir</h1>
                <p className="text-sm text-slate-600">المحلل المساعد الذكي للقاضي و القانوني</p>
              </div>
            </div>
            {/* Center: System Status */}
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">النظام متصل</span>
            </div>
            {/* Left: Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="ml-4 px-3 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
              >
                عرض القضايا السابقة
              </button>
              <button
                onClick={() => setShowLegalQuestion(true)}
                className="ml-2 px-3 py-1 text-xs bg-blue-200 hover:bg-blue-300 rounded text-blue-900 font-bold"
              >
                استشارة قانونية
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Previous Cases</h2>
              <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-slate-800">✕</button>
            </div>
            {history.length === 0 ? (
              <p className="text-slate-500">No previous cases found.</p>
            ) : (
              <ul className="space-y-4">
                {history.map((item: HistoryItem) => (
                  <li key={item.id} className="border-b pb-2">
                    <div className="font-medium text-slate-800 truncate">{item.text.split('\n')[0].slice(0, 60) || 'Untitled Case'}</div>
                    <div className="text-xs text-slate-500 mb-1">{item.time}</div>
                    <button
                      onClick={() => handleReopenCase(item)}
                      className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
                    >
                      Reopen
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Right Column - Input (now first in DOM, but visually on the right) */}
          <div className="order-2 lg:order-1">
            <ResultsPanel 
              analysis={analysis} 
              isLoading={isLoading} 
              error={error} 
            />
          </div>
          {/* Left Column - Input (now visually on the right) */}
          <div className="space-y-6 order-1 lg:order-2" dir="rtl">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-2 text-slate-800">ملخص القضية</h2>
              <label className="block text-slate-700 mb-2">أدخل تفاصيل القضية، الوقائع، والأطراف المعنية</label>
              <textarea
                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-right"
                placeholder="يرجى وصف تفاصيل القضية، الأطراف المعنية، الوقائع الأساسية، وأي ظروف ذات صلة…"
                value={caseText}
                onChange={e => setCaseText(e.target.value)}
                dir="rtl"
              />
            </div>
            {/* Clarifying Questions */}
            {caseText.trim() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2" dir="rtl">
                <h4 className="text-md font-semibold text-blue-800 mb-2">أسئلة توضيحية مقترحة</h4>
                {isQuestionsLoading ? (
                  <div className="text-blue-600">جاري توليد الأسئلة...</div>
                ) : clarifyingQuestions.length > 0 ? (
                  <ul className="list-disc list-inside text-blue-900 space-y-1 pr-2">
                    {clarifyingQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-500">لا توجد أسئلة توضيحية حالياً.</div>
                )}
                {clarifyingQuestionsRaw && clarifyingQuestions.length <= 1 && (
                  <pre className="text-xs text-slate-400 mt-2 whitespace-pre-wrap">{clarifyingQuestionsRaw}</pre>
                )}
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex gap-3" dir="rtl">
              <button
                onClick={handleAnalyzeCase}
                disabled={isLoading || !caseText.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-800 hover:bg-blue-900 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
              >
                {isLoading ? '...جاري التحليل' : 'حلل القضية'}
              </button>
              <button
                onClick={handleClearAll}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-all"
              >
                مسح الكل
              </button>
            </div>
            {/* Quick Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4" dir="rtl">
              <div className="flex items-start gap-3">
                {/* Info icon here if needed */}
                <div>
                  <h4 className="text-sm font-medium text-amber-800 mb-1">إرشادات التحليل</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• قدم وقائع القضية والظروف بتفصيل</li>
                    <li>• اذكر الأطراف المعنية وأدوارهم</li>
                    <li>• أضف أي تساؤلات أو إشكالات قانونية</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              © 2025 LegalAssist Pro. AI-powered legal analysis for judicial professionals.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Secure</span>
              <span>•</span>
              <span>Confidential</span>
              <span>•</span>
              <span>Professional</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;