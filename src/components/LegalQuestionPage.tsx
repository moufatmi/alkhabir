import React, { useState } from 'react';

interface Props {
  askLegalQuestion: (question: string) => Promise<any>;
}

const LegalQuestionPage: React.FC<Props> = ({ askLegalQuestion }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<any>('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    setAnswer('');
    try {
      const result = await askLegalQuestion(question);
      setAnswer(result);
    } catch (e) {
      setAnswer('حدث خطأ أثناء معالجة سؤالك.');
    }
    setLoading(false);
  };

  const renderAnswer = () => {
    if (!answer) return null;
    if (typeof answer === 'string') {
      return answer;
    }
    // Only show keys with non-empty values, and prioritize 'raw'
    const keysToShow = Object.entries(answer).filter(([key, value]) => {
      if (key === 'raw') return value && String(value).trim() !== '';
      if (Array.isArray(value)) return value.length > 0 && value.some(v => v && String(v).trim() !== '');
      return value && String(value).trim() !== '';
    }).filter(([key]) => key === 'raw'); // Only show 'raw' key
    if (keysToShow.length === 0) return null;
    return (
      <div>
        {keysToShow.map(([key, value]) => (
          <div key={key} className="mb-4">
            {/* Optionally hide the label for 'raw' */}
            {key !== 'raw' && <div className="font-bold text-blue-800 mb-1">{key}</div>}
            {Array.isArray(value) ? (
              <ul className="list-disc pr-6 space-y-1 text-md text-slate-900">
                {value.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            ) : (
              <div>{String(value)}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-xl font-bold mb-4 text-blue-900 text-right">استشارة قانونية فورية</h2>
      <textarea
        className="w-full h-32 p-3 border border-slate-300 rounded-lg mb-4 text-right"
        placeholder="اكتب سؤالك القانوني هنا..."
        value={question}
        onChange={e => setQuestion(e.target.value)}
      />
      <button
        onClick={handleAsk}
        disabled={loading || !question.trim()}
        className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-lg mb-4"
      >
        {loading ? 'جاري الاستشارة...' : 'استشر'}
      </button>
      {answer && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-right text-lg text-slate-900 whitespace-pre-line">
          {renderAnswer()}
        </div>
      )}
    </div>
  );
};

export default LegalQuestionPage;
