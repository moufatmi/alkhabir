import AuthForm from "./components/AuthForm";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import React, { useState, useEffect, useRef } from 'react';
import { ResultsPanel } from './components/ResultsPanel';
import { analyzeLegalCase, askLegalQuestion, suggestClarifyingQuestions } from './services/legalAnalysis';
import LegalQuestionPage from './components/LegalQuestionPage';
import { transcribeAudio } from './services/speechToText';
import { PDFLibReportGenerator } from './services/reportGeneratorPDFLib';
import PayPalSubscription from './components/PayPalSubscription';
import { hasActiveSubscription, getSubscription, clearSubscription } from './services/paypalService';
import AdminLogin from './components/AdminLogin';
import { isAdmin, adminLogout, getCurrentAdmin } from './services/adminAuth';
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import Header from "./components/Header";
import { useUserRole } from './hooks/useUserRole';

type HistoryItem = {
  id: number;
  text: string;
  analysis: any;
  time: string;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [caseText, setCaseText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  // const [showHistory, setShowHistory] = useState(false);
  const [showLegalQuestion, setShowLegalQuestion] = useState(false);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [clarifyingQuestionsRaw, setClarifyingQuestionsRaw] = useState('');
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFollowupBox, setShowFollowupBox] = useState(false);
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
  const { role, loading: loadingRole } = useUserRole(user);

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
    if (loadingRole) return; // Wait for role to load
    if (role === "admin") {
      setIsSubscribed(true); // Treat admin as always subscribed
      setShowSubscriptionModal(false);
    } else {
      const subscribed = hasActiveSubscription();
      setIsSubscribed(subscribed);
      if (!subscribed) setShowSubscriptionModal(true);
    }
  }, [role, loadingRole, user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
          questions = result.split(/\n|\r/).map((q: string) => q.trim()).filter((q: string) => q.length > 0);
        } else if (result && typeof result === 'object' && result.raw && typeof result.raw === 'string') {
          questions = result.raw.split(/\n|\r/).map((q: string) => q.trim()).filter((q: string) => q.length > 0);
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

  // const handleReopenCase = (item: HistoryItem) => {
  //   setCaseText(item.text);
  //   setAnalysis(item.analysis);
  //   // setShowHistory(false);
  // };


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
                  <p className="text-sm text-slate-600 aref-ruqaa-regular">المساعد الذكي للقانوني و </p>
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
                   
                  </>
                )}
              </div>
          </div>
        </div>
      </header>

      {/* History Modal */}
      {/* {showHistory && (
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
      )} */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isSubscribed && !isAdminUser ? (
            <div className="max-w-4xl mx-auto text-center py-12">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">مرحبا بك في منصة الخبير</h2>
                <p className="text-lg text-slate-600 mb-6">
                  منصة الخبير هي المساعد الذكي للقانوني . اشترك الآن للوصول إلى جميع الميزات.
                </p>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg"
                >
                  اشترك الآن - 286 MAD/شهر
                </button>
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <p style={{ marginBottom: 12, color: '#1e293b', fontWeight: 'bold' }}>
                    إذا واجهت صعوبة في الدفع عبر بايبال أو ترغب بالدفع عبر بطاقة بنكية أو وسيلة أخرى، يمكنك التواصل مباشرة مع المطور للتفاوض حول طريقة الدفع.
                  </p>
                  <a
                    href="https://wa.me/212698570282"
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
                    تواصل مع المطور عبر واتساب
                  </a>
                </div>
                <div className="mt-6 text-sm text-slate-500">
                  الاشتراك قابل للإلغاء في أي وقت
                </div>
              </div>
            </div>
          ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Right Column - Input (now first in DOM, but visually on the right) */}
          <div className="order-2 lg:order-1">
            <ResultsPanel 
              analysis={analysis} 
              isLoading={isLoading} 
              error={error} 
            />
            {/* --- زر ومربع السؤال التكميلي --- */}
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
                {/* عرض الجواب التكميلي */}
                {followupAnswer && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-right whitespace-pre-line text-blue-900">
                    <div className="font-bold mb-2 text-blue-800">الجواب القانوني التكميلي:</div>
                    <div>{followupAnswer}</div>
                  </div>
                )}
              </div>
            )}
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
            {/* Transcription Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-2 text-slate-800">نسخ الصوت إلى نص</h2>
              <input
                type="file"
                accept="audio/*"
                onChange={e => {
                  console.log('Input file changed', e);
                  handleTranscribeAudio(e);
                }}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                onClick={() => {
                  console.log('Transcribe button clicked');
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                disabled={isTranscribing}
              >
                {isTranscribing ? 'جاري التحويل...' : 'تحويل الصوت إلى نص'}
              </button>
              {transcriptionResult && (
                <div className="mt-4 p-3 bg-gray-50 border rounded text-right whitespace-pre-wrap text-slate-800" style={{maxHeight: '200px', overflowY: 'auto'}}>
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
                    const reportGenerator = new PDFLibReportGenerator();
                    const reportUrl = await reportGenerator.generateReport(analysis);
                    console.log('Report generated successfully:', reportUrl);
                  } catch (err) {
                    console.error('Report generation error:', err);
                    setError('فشل توليد التقرير. يرجى المحاولة مرة أخرى أو الاتصال بالدعم التقني.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading || !analysis}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium"
              >
                {isLoading ? 'جاري توليد التقرير...' : 'توليد تقرير PDF'}
              </button>
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
                  onSubscriptionSuccess={handleSubscriptionSuccess}
                  onSubscriptionError={handleSubscriptionError}
                />
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <p style={{ marginBottom: 12, color: '#1e293b', fontWeight: 'bold' }}>
                    إذا واجهت صعوبة في الدفع عبر بايبال أو ترغب بالدفع عبر بطاقة بنكية أو وسيلة أخرى، يمكنك التواصل مباشرة مع المطور للتفاوض حول طريقة الدفع.
                  </p>
                  <a
                    href="https://wa.me/212698570282"
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
                    تواصل مع المطور عبر واتساب
                  </a>
                </div>
                {subscriptionError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
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
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-4 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-800">دخول المدير</h2>
                  <button
                    onClick={() => setShowAdminLogin(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4">
                <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;