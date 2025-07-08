import { useState, useEffect } from 'react';
import { CaseSummaryInput } from './components/CaseSummaryInput';
import { ResultsPanel } from './components/ResultsPanel';
import { analyzeLegalCase } from './services/legalAnalysis';

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

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('caseHistory');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('caseHistory', JSON.stringify(history));
  }, [history]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-800 p-2 rounded-lg">
                {/* Logo icon here if needed */}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">LegalAssist Pro</h1>
                <p className="text-sm text-slate-600">AI-Powered Legal Analysis for Judges</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">System Online</span>
            </div>
            {/* Show Previous Cases Button */}
            <button
              onClick={() => setShowHistory(true)}
              className="ml-4 px-3 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
            >
              Show Previous Cases
            </button>
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
          {/* Left Column - Input */}
          <div className="space-y-6">
            <CaseSummaryInput
              value={caseText}
              onChange={setCaseText}
            />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAnalyzeCase}
                disabled={isLoading || !caseText.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-800 hover:bg-blue-900 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Case'}
              </button>
              <button
                onClick={handleClearAll}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-all"
              >
                Clear All
              </button>
            </div>

            {/* Quick Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {/* Info icon here if needed */}
                <div>
                  <h4 className="text-sm font-medium text-amber-800 mb-1">Analysis Guidelines</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Provide detailed case facts and circumstances</li>
                    <li>• Include relevant parties and their roles</li>
                    <li>• Mention any specific legal concerns or questions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div>
            <ResultsPanel 
              analysis={analysis} 
              isLoading={isLoading} 
              error={error} 
            />
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