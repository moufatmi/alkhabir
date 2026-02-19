import AuthForm from "./components/AuthForm";
import { useAuth } from './contexts/AuthContext';
import React, { useState, useEffect, useRef } from 'react';
import { ResultsPanel } from './components/ResultsPanel';
import { analyzeLegalCase, askLegalQuestion, suggestClarifyingQuestions } from './services/legalAnalysis';
import LegalQuestionPage from './components/LegalQuestionPage';
import { transcribeAudio } from './services/speechToText';
import { extractTextFromImage } from './services/ocr';
import { ImprovedReportGenerator } from './services/reportGeneratorImproved';
import PayPalSubscription from './components/PayPalSubscription';
import { ReportDiagnostics } from './components/ReportDiagnostics';
import { hasActiveSubscription, getSubscription, clearSubscription, getPlan } from './services/paypalService';
import AdminLogin from './components/AdminLogin';
import { isAdmin, adminLogout, getCurrentAdmin } from './services/adminAuth';
import { Link, useNavigate, Route } from "react-router-dom";
import Header from "./components/Header";
import { SEO } from './components/SEO';
import { databaseService } from './services/database';

type HistoryItem = {
  id: number;
  text: string;
  analysis: any;
  time: string;
};

const WHATSAPP_LINK = "https://wa.me/212698570282";
const userTypes = [
  { key: 'student', label: 'طالب', price: 50 },
  { key: 'judge', label: 'قاضٍ متدرب', price: 150 },
  { key: 'lawyer', label: 'محامٍ', price: 500 },
];

function App() {
  const { user, loading } = useAuth();
  const [caseTitle, setCaseTitle] = useState('');
  const [caseText, setCaseText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showLegalQuestion, setShowLegalQuestion] = useState(false);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [clarifyingQuestionsRaw, setClarifyingQuestionsRaw] = useState('');
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFollowupBox, setShowFollowupBox] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [followupAnswer, setFollowupAnswer] = useState<string | null>(null);
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);
  const [followupError, setFollowupError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const navigate = useNavigate();

  /* TEMPORARY DISABLE AUTH START */
  const role = 'guest';
  const loadingRole = false;
  /* TEMPORARY DISABLE AUTH END */

  const [selectedType, setSelectedType] = useState<'student' | 'judge' | 'lawyer'>('student');

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('caseHistory');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('caseHistory', JSON.stringify(history));
  }, [history]);

  // Check subscription and admin status on mount
  useEffect(() => {
    setIsSubscribed(true); // Force subscribed for guest access
    setShowSubscriptionModal(false);
  }, [role, loadingRole, user]);


  const handleAnalyzeCase = async () => {
    if (!caseText.trim()) {
      setError('المرجو إدخال تفاصيل القضية.');
      return;
    }

    // Ensure user is logged in
    if (!user) {
      setError('يجيب عليك تسجيل الدخول لحفظ وتحليل القضية.');
      return;
    }

    // Auto-generate title if missing
    const finalTitle = caseTitle.trim() || `قضية ${new Date().toLocaleDateString('ar-MA')} - ${caseText.slice(0, 20)}...`;

    setIsLoading(true);
    setError(null);

    let caseId: string | null = null;

    try {
      // Step 1: Save Draft (Pending)
      console.log('Saving draft case...');
      const draftCase = await databaseService.createCase({
        title: finalTitle,
        description: caseText,
      });
      caseId = draftCase.$id;
      console.log('Draft case saved with ID:', caseId);

      // Step 2: Perform Analysis
      console.log('Analyzing case...');
      const result = await analyzeLegalCase(caseText);
      setAnalysis(result);

      // Step 3: Update Record (Completed)
      if (caseId) {
        console.log('Updating case with analysis result...');
        await databaseService.updateCaseAnalysis(caseId, JSON.stringify(result));
        console.log('Case updated successfully.');
      }

      // Add to history (UI only)
      setHistory([
        {
          id: Date.now(),
          text: caseText,
          analysis: result,
          time: new Date().toLocaleString(),
        },
        ...history,
      ]);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError('حدث خطأ أثناء التحليل. تم حفظ المسودة في حسابك.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestQuestions = () => {
    if (!caseText.trim()) return;
    setIsQuestionsLoading(true);
    suggestClarifyingQuestions(caseText)
      .then((result) => {
        let questions: string[] = [];
        let rawText = '';
        if (typeof result === 'string') {
          questions = result.split(/\n|\r/).map((q: string) => q.trim()).filter((q: string) => q.length > 0);
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
          }
        }
        setClarifyingQuestions(questions);
        setClarifyingQuestionsRaw(rawText);
      })
      .catch(() => setClarifyingQuestions([]))
      .finally(() => setIsQuestionsLoading(false));
  };

  const handleClearAll = () => {
    setCaseTitle('');
    setCaseText('');
    setAnalysis(null);
    setError(null);
  };

  const handleTranscribeAudio = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleTranscribeAudio called', event);
    const file = event.target.files?.[0];
    if (!file) {
      alert('الرجاء اختيار ملف صوتي');
      return;
    }

    setIsTranscribing(true);
    try {
      const transcription = await transcribeAudio(file);
      console.log('Received transcription:', transcription);
      setTranscriptionResult(transcription);
    } catch (error) {
      alert('حدث خطأ أثناء تحويل الصوت إلى نص');
    } finally {
      setIsTranscribing(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleSendFollowup = async () => {
    if (!followupQuestion.trim()) return;
    setIsFollowupLoading(true);
    setFollowupError(null);
    setFollowupAnswer(null);
    try {
      const res = await askLegalQuestion(followupQuestion);
      // إذا كان الجواب كائن فيه raw أو نص مباشر
      if (typeof res === 'string') {
        setFollowupAnswer(res);
      } else if (res && typeof res === 'object' && res.raw) {
        setFollowupAnswer(res.raw);
      } else {
        setFollowupAnswer(JSON.stringify(res, null, 2));
      }
    } catch (e) {
      setFollowupError('حدث خطأ أثناء إرسال السؤال.');
    } finally {
      setIsFollowupLoading(false);
    }
  };

  const handleSubscriptionSuccess = (subscriptionId: string) => {
    setIsSubscribed(true);
    setShowSubscriptionModal(false);
    setSubscriptionError(null);
    alert('تم الاشتراك بنجاح! يمكنك الآن استخدام جميع الميزات.');
  };

  const handleSubscriptionError = (error: string) => {
    setSubscriptionError(error);
  };

  const handleLogout = () => {
    clearSubscription();
    setIsSubscribed(false);
    setShowSubscriptionModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    try {
      const text = await extractTextFromImage(file);
      setCaseText((prev) => prev + (prev ? '\n\n' : '') + text);
    } catch (err: any) {
      setError(err.message || 'فشل تحويل الصورة إلى نص');
    } finally {
      setIsOcrLoading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminUser(true);
    setShowAdminLogin(false);
    setShowSubscriptionModal(false);
  };

  const handleAdminLogout = () => {
    adminLogout();
    setIsAdminUser(false);
    setShowSubscriptionModal(true);
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (!user) return <AuthForm />;

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
    <>
      <SEO />
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-row-reverse items-center justify-between h-16">
              {/* Right: Logo and Title */}
              <div className="flex items-center gap-3">
                <img
                  src="/logo.svg"
                  alt="Scales of Justice"
                  className="w-12 h-12"
                />
                <div>
                  <h1 className="text-xl font-bold text-slate-800 aref-ruqaa-bold">الخبير | Alkhabir</h1>
                  <p className="text-sm text-slate-600 aref-ruqaa-regular">المساعد الذكي للقانوني  </p>
                </div>
              </div>
              {/* Center: System Status */}
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm aref-ruqaa-regular">النظام متصل</span>
              </div>
              {/* Left: Action Buttons */}
              <div className="flex items-center gap-2">
                {isAdminUser && (
                  <>
                    <button
                      onClick={() => setShowLegalQuestion(true)}
                      className="ml-2 px-3 py-1 text-xs bg-blue-200 hover:bg-blue-300 rounded text-blue-900 font-bold"
                    >
                      الأسئلة القانونية
                    </button>
                    <span className="px-2 py-1 text-xs bg-purple-200 text-purple-900 rounded font-bold">
                      المدير
                    </span>
                    <button
                      onClick={handleAdminLogout}
                      className="px-3 py-1 text-xs bg-red-200 hover:bg-red-300 rounded text-red-900 font-bold"
                    >
                      تسجيل الخروج
                    </button>
                  </>
                )}
                {isSubscribed && !isAdminUser && (
                  <>
                    <button
                      onClick={() => setShowLegalQuestion(true)}
                      className="ml-2 px-3 py-1 text-xs bg-blue-200 hover:bg-blue-300 rounded text-blue-900 font-bold"
                    >
                      الأسئلة القانونية
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 text-xs bg-red-200 hover:bg-red-300 rounded text-red-900 font-bold"
                    >
                      إلغاء الاشتراك
                    </button>
                  </>
                )}
                {!isSubscribed && !isAdminUser && (
                  <>
                    <button
                      onClick={() => setShowSubscriptionModal(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                    >
                      اشترك الآن
                    </button>
                    <button
                      onClick={() => window.location.href = '/example'}
                      className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-blue-900 rounded-lg font-medium text-lg ml-4"
                      style={{ marginRight: 12 }}
                    >
                      شاهد شكل المنصة
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {false ? (
            /* TEMPORARY DISABLE AUTH END */
            <div className="max-w-4xl mx-auto text-center py-12">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">مرحباً بك في منصة الخبير</h2>
                <p className="text-lg text-slate-600 mb-6">
                  منصة الخبير هي المساعد الذكي للقانوني . اشترك الآن للوصول إلى جميع الميزات.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
                  {userTypes.map(type => (
                    <button
                      key={type.key}
                      onClick={() => setSelectedType(type.key as 'student' | 'judge' | 'lawyer')}
                      style={{
                        padding: '10px 20px',
                        borderRadius: 8,
                        border: selectedType === type.key ? '2px solid #2563eb' : '1px solid #ddd',
                        background: selectedType === type.key ? '#2563eb' : '#f3f4f6',
                        color: selectedType === type.key ? '#fff' : '#1e293b',
                        fontWeight: 'bold',
                        fontSize: 16,
                        cursor: 'pointer'
                      }}
                    >
                      {type.label} ({type.price} درهم)
                    </button>
                  ))}
                </div>
                {/* Payment/Contact logic */}
                {selectedType === 'student' && (
                  <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <p style={{ marginBottom: 12, color: '#1e293b', fontWeight: 'bold' }}>
                      للاستفادة من اشتراك الطلبة (50 درهم شهرياً)، يرجى التواصل معنا عبر واتساب للتحقق من وضعك كطالب والتفاوض حول طريقة الدفع.
                    </p>
                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        background: '#25D366',
                        color: '#fff',
                        padding: '10px 24px',
                        borderRadius: 8,
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        fontSize: 16
                      }}
                    >
                      تواصل عبر واتساب
                    </a>
                  </div>
                )}
                {selectedType === 'judge' && (
                  <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <p style={{ marginBottom: 12, color: '#1e293b', fontWeight: 'bold' }}>
                      للاستفادة من اشتراك القضاة المتدربين (150 درهم شهرياً)، يرجى التواصل معنا عبر واتساب للتحقق من وضعك كقاضٍ متدرب والتفاوض حول طريقة الدفع.
                    </p>
                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        background: '#25D366',
                        color: '#fff',
                        padding: '10px 24px',
                        borderRadius: 8,
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        fontSize: 16
                      }}
                    >
                      تواصل عبر واتساب
                    </a>
                  </div>
                )}
                {selectedType === 'lawyer' && (
                  <>
                    <button
                      onClick={() => setShowSubscriptionModal(true)}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg"
                    >
                      اشترك الآن - 500 MAD/شهر
                    </button>
                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                      <p style={{ marginBottom: 12, color: '#1e293b', fontWeight: 'bold' }}>
                        اشتراك المحامين (500 درهم شهرياً): يمكنك الدفع مباشرة عبر بايبال أو البطاقة البنكية، أو التواصل معنا عبر واتساب إذا واجهت صعوبة في الدفع.
                      </p>
                      <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          background: '#25D366',
                          color: '#fff',
                          padding: '10px 24px',
                          borderRadius: 8,
                          fontWeight: 'bold',
                          textDecoration: 'none',
                          fontSize: 16
                        }}
                      >
                        تواصل عبر واتساب
                      </a>
                    </div>
                  </>
                )}
                <div className="mt-6 text-sm text-slate-500">
                  الاشتراك قابل للإلغاء في أي وقت
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Right Column - Results */}
              <div className="order-2 lg:order-1">
                <ResultsPanel
                  analysis={analysis}
                  isLoading={isLoading}
                  error={error}
                />

                {/* Followup Question */}
                {analysis && !isLoading && !error && (
                  <div className="mt-6">
                    {!showFollowupBox ? (
                      <button
                        className="w-full py-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-bold rounded-lg shadow transition"
                        onClick={() => setShowFollowupBox(true)}
                      >
                        🧠 هل التحليل كافٍ؟ أضف سؤالًا
                      </button>
                    ) : (
                      <div className="bg-white border border-yellow-200 rounded-lg p-4 mt-2 space-y-3">
                        <label className="block text-slate-700 mb-1 font-medium">اكتب سؤالك التكميلي المتعلق بنفس القضية:</label>
                        <textarea
                          className="w-full h-20 p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 text-right"
                          placeholder="مثال: ما هو موقف القانون المغربي من الوقائع التالية..."
                          value={followupQuestion}
                          onChange={e => setFollowupQuestion(e.target.value)}
                          disabled={isFollowupLoading}
                          dir="rtl"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-medium"
                            onClick={() => { setShowFollowupBox(false); setFollowupQuestion(''); setFollowupAnswer(null); setFollowupError(null); }}
                            disabled={isFollowupLoading}
                          >إلغاء</button>
                          <button
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-bold disabled:bg-yellow-300"
                            onClick={handleSendFollowup}
                            disabled={isFollowupLoading || !followupQuestion.trim()}
                          >{isFollowupLoading ? 'جاري الإرسال...' : 'إرسال السؤال'}</button>
                        </div>
                        {followupError && <div className="text-red-600 text-sm mt-1">{followupError}</div>}
                      </div>
                    )}
                    {followupAnswer && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-right whitespace-pre-line text-blue-900">
                        <div className="font-bold mb-2 text-blue-800">الجواب القانوني التكميلي:</div>
                        <div>{followupAnswer}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Left Column - Input */}
              <div className="space-y-6 order-1 lg:order-2" dir="rtl">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-2 text-slate-800">تفاصيل القضية</h2>

                  {/* Title Input */}
                  <div className="mb-4">
                    <label className="block text-slate-700 mb-2">عنوان القضية (اختياري)</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-right"
                      placeholder="مثال: نزاع عقاري حول ملكية أرض"
                      value={caseTitle}
                      onChange={e => setCaseTitle(e.target.value)}
                      dir="rtl"
                    />
                  </div>

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
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md font-semibold text-blue-800">أسئلة توضيحية مقترحة</h4>
                      <button
                        onClick={handleSuggestQuestions}
                        disabled={isQuestionsLoading}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded transition-colors"
                      >
                        {isQuestionsLoading ? 'جاري التوليد...' : 'اقترح أسئلة'}
                      </button>
                    </div>
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
                {/* Transcription Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-2 text-slate-800">أدوات ذكية</h2>
                  <div className="flex gap-4 flex-wrap">
                    {/* Audio Section */}
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="text-sm font-semibold text-slate-600 mb-2">نسخ الصوت إلى نص</h3>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={e => {
                          console.log('Input file changed', e);
                          handleTranscribeAudio(e);
                        }}
                        ref={fileInputRef}
                        className="hidden"
                        id="audio-upload"
                        disabled={isTranscribing}
                      />
                      <label
                        htmlFor="audio-upload"
                        className={`flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium cursor-pointer transition-all ${isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isTranscribing ? 'جاري التحويل...' : 'رفع ملف صوتي'}
                      </label>
                    </div>

                    {/* Image Section */}
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="text-sm font-semibold text-slate-600 mb-2">تحويل صورة إلى نص</h3>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={isOcrLoading}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium cursor-pointer transition-all ${isOcrLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isOcrLoading ? 'جاري الاستخراج...' : 'رفع صورة مستند'}
                      </label>
                    </div>
                  </div>
                  {transcriptionResult && (
                    <div className="mt-4 p-3 bg-gray-50 border rounded text-right whitespace-pre-wrap text-slate-800" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <strong>النص المحول:</strong>
                      <div>{transcriptionResult}</div>
                    </div>
                  )}
                </div>
                {/* Report Generation Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-2 text-slate-800">توليد التقرير</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    التقرير يحتوي على النص العربي المحول إلى الحروف اللاتينية للتوافق مع PDF
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!analysis) {
                          setError('يرجى تحليل القضية أولاً.');
                          return;
                        }
                        setIsLoading(true);
                        setError(null);
                        try {
                          console.log('Generating report with analysis:', analysis);
                          const reportGenerator = new ImprovedReportGenerator();
                          const reportUrl = await reportGenerator.generateReport(analysis);
                          console.log('Report generated successfully:', reportUrl);
                          setError(null);
                        } catch (err) {
                          console.error('Report generation error:', err);
                          let errorMessage = 'فشل توليد التقرير. ';

                          if (err instanceof Error) {
                            if (err.message.includes('Font fetch failed')) {
                              errorMessage += 'مشكلة في تحميل خط اللغة العربية. تحقق من اتصال الإنترنت.';
                            } else if (err.message.includes('analysis')) {
                              errorMessage += 'يرجى تحليل القضية أولاً قبل توليد التقرير.';
                            } else {
                              errorMessage += err.message;
                            }
                          } else {
                            errorMessage += 'خطأ غير معروف. يرجى المحاولة مرة أخرى.';
                          }

                          setError(errorMessage);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading || !analysis}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium"
                    >
                      {isLoading ? 'جاري توليد التقرير...' : 'توليد تقرير PDF'}
                    </button>

                    <button
                      onClick={() => setShowDiagnostics(true)}
                      className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium text-sm"
                      title="تشخيص مشاكل توليد التقرير"
                    >
                      🔧
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                منصة الخبير ، من تصميم الطالب الشغوف : مصعب فاطمي .
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

        {/* Subscription Modal */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-800">اشترك في منصة الخبير</h2>
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4">
                <PayPalSubscription
                  plan={getPlan('lawyer')}
                  onSubscriptionSuccess={handleSubscriptionSuccess}
                  onSubscriptionError={handleSubscriptionError}
                />
                {subscriptionError && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm text-right">
                    {subscriptionError}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <AdminLogin onLoginSuccess={handleAdminLoginSuccess} onClose={() => setShowAdminLogin(false)} />
          </div>
        )}

        {/* Report Diagnostic Modal */}
        {showDiagnostics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowDiagnostics(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <ReportDiagnostics />
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default App;