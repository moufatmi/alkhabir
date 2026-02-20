import AuthForm from "./components/AuthForm";
import { useAuth } from './contexts/AuthContext';
import React, { useState, useEffect, useRef } from 'react';
import { ResultsPanel, ResultsPanelHandle } from './components/ResultsPanel';
import { analyzeLegalCase, askLegalQuestion, suggestClarifyingQuestions } from './services/legalAnalysis';
import LegalQuestionPage from './components/LegalQuestionPage';
import { transcribeAudio } from './services/speechToText';
import { extractTextFromImage } from './services/ocr';
import PayPalSubscription from './components/PayPalSubscription';
import { ReportDiagnostics } from './components/ReportDiagnostics';
import { clearSubscription, getPlan, hasActiveSubscription } from './services/paypalService';
import AdminLogin from './components/AdminLogin';
import { adminLogout } from './services/adminAuth';
import { Link } from "react-router-dom";
import { SEO } from './components/SEO';
import { databaseService } from './services/database';
import { motion, AnimatePresence } from 'framer-motion';
import ParticlesBackground from './components/ParticlesBackground';
import TextDecode from './components/TextDecode';

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
  const { user, loading, isAdmin } = useAuth();
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

  const resultsPanelRef = useRef<ResultsPanelHandle>(null);
  const isSubscribedFromService = hasActiveSubscription();
  const [selectedType, setSelectedType] = useState<'student' | 'judge' | 'lawyer'>('student');

  useEffect(() => {
    const stored = localStorage.getItem('caseHistory');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('caseHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (user) {
      const isSub = isSubscribedFromService || isAdmin;
      setIsSubscribed(isSub);
      setShowSubscriptionModal(!isSub);
    }
  }, [user, isAdmin, isSubscribedFromService]);

  const handleAnalyzeCase = async () => {
    if (!caseText.trim()) {
      setError('المرجو إدخال تفاصيل القضية.');
      return;
    }
    if (!user) {
      setError('يجيب عليك تسجيل الدخول لحفظ وتحليل القضية.');
      return;
    }
    const finalTitle = caseTitle.trim() || `قضية ${new Date().toLocaleDateString('ar-MA')} - ${caseText.slice(0, 20)}...`;
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    let caseId: string | null = null;
    try {
      const draftCase = await databaseService.createCase({
        title: finalTitle,
        description: caseText,
      });
      caseId = draftCase.$id;
      const result = await analyzeLegalCase(caseText);
      setAnalysis(result);
      if (caseId) {
        await databaseService.updateCaseAnalysis(caseId, JSON.stringify(result));
      }
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
      if (caseId) {
        setError('حدث خطأ أثناء التحليل. تم حفظ المسودة في حسابك.');
      } else {
        setError(err.message || 'فشل حفظ القضية');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestQuestions = () => {
    if (!caseText.trim()) return;
    setIsQuestionsLoading(true);
    suggestClarifyingQuestions(caseText)
      .then((questions) => {
        setClarifyingQuestions(questions);
        setClarifyingQuestionsRaw('');
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
    const file = event.target.files?.[0];
    if (!file) {
      alert('الرجاء اختيار ملف صوتي');
      return;
    }
    setIsTranscribing(true);
    try {
      const transcription = await transcribeAudio(file);
      setTranscriptionResult(transcription);
    } catch (error) {
      alert('حدث خطأ أثناء تحويل الصوت إلى نص');
    } finally {
      setIsTranscribing(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleSendFollowup = async () => {
    if (!followupQuestion.trim()) return;
    setIsFollowupLoading(true);
    setFollowupError(null);
    setFollowupAnswer(null);
    try {
      const res = await askLegalQuestion(followupQuestion);
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

  const handleSubscriptionSuccess = () => {
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

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">جاري التحميل...</div>;
  if (!user) return <AuthForm />;

  if (showLegalQuestion) {
    return (
      <div className="min-h-screen bg-slate-950">
        <ParticlesBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <button
            onClick={() => setShowLegalQuestion(false)}
            className="mb-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
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
      <ParticlesBackground />
      <div className="min-h-screen relative overflow-hidden bg-slate-950" dir="rtl">
        {/* Header */}
        <header className="glass border-b border-white/5 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-row-reverse items-center justify-between h-16">
              {/* Right: Logo and Title */}
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="Scales of Justice" className="w-12 h-12" />
                <div>
                  <h1 className="text-xl font-bold text-slate-100 aref-ruqaa-bold glow-blue">الخبير | Alkhabir</h1>
                  <p className="text-sm text-slate-400 aref-ruqaa-regular">المساعد الذكي للقانوني</p>
                </div>
              </div>

              {/* Center: System Status */}
              <div className="hidden md:flex items-center gap-2 text-slate-500">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                />
                <span className="text-xs font-medium tracking-widest uppercase opacity-70">AI Core Active</span>
              </div>

              {/* Left: Action Buttons */}
              <div className="flex items-center gap-2">
                {isAdminUser && (
                  <>
                    <Link to="/moussabfatmimariem" className="ml-2 px-3 py-1 text-xs bg-red-900/50 hover:bg-red-800 rounded text-red-100 font-bold border border-red-500/30">
                      لوحة المدير
                    </Link>
                    <button onClick={() => setShowLegalQuestion(true)} className="ml-2 px-3 py-1 text-xs bg-blue-900/50 hover:bg-blue-800 rounded text-blue-100 font-bold border border-blue-500/30">
                      الأسئلة القانونية
                    </button>
                    <span className="px-2 py-1 text-xs bg-purple-900/50 text-purple-100 rounded font-bold border border-purple-500/30">
                      المدير
                    </span>
                    <button onClick={handleAdminLogout} className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-100 font-bold border border-white/10">
                      تسجيل الخروج
                    </button>
                  </>
                )}
                {isSubscribed && !isAdminUser && (
                  <>
                    <Link to="/client" className="ml-2 px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-100 font-bold border border-white/10">
                      لوحة التحكم
                    </Link>
                    <button onClick={() => setShowLegalQuestion(true)} className="ml-2 px-3 py-1 text-xs bg-blue-900/50 hover:bg-blue-800 rounded text-blue-100 font-bold border border-blue-500/30">
                      الأسئلة القانونية
                    </button>
                    <button onClick={handleLogout} className="px-3 py-1 text-xs bg-red-900/50 hover:bg-red-800 rounded text-red-100 font-bold border border-red-500/30">
                      إلغاء الاشتراك
                    </button>
                  </>
                )}
                {!isSubscribed && !isAdminUser && (
                  <>
                    <button onClick={() => setShowSubscriptionModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20">
                      اشترك الآن
                    </button>
                    <button onClick={() => window.location.href = '/example'} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-all border border-white/10 ml-2">
                      شاهد شكل المنصة
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-100 mb-4 leading-tight">
              <TextDecode text="مستشارك القانوني الذكي" className="glow-blue" /> <span className="text-blue-400 font-extrabold italic">الخبير</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              تحليل قانوني فوري ودقيق للنوازل، مدعوم بالذكاء الاصطناعي والترسانة القانونية المغربية.
            </p>
          </div>

          {!isSubscribed && !isAdminUser ? (
            <div className="max-w-4xl mx-auto text-center py-12">
              <div className="glass rounded-2xl shadow-2xl p-8 border border-white/5 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-slate-100 glow-blue">مرحباً بك في منصة الخبير</h2>
                  <p className="text-lg text-slate-400">منصة الخبير هي المساعد الذكي للقانوني. اشترك الآن للوصول إلى جميع الميزات.</p>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  {userTypes.map(type => (
                    <button
                      key={type.key}
                      onClick={() => setSelectedType(type.key as any)}
                      className={`px-6 py-3 rounded-xl font-bold transition-all border ${selectedType === type.key
                          ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-blue-500/30'
                        }`}
                    >
                      {type.label} ({type.price} درهم)
                    </button>
                  ))}
                </div>

                <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5">
                  {selectedType === 'student' && (
                    <div className="space-y-4">
                      <p className="text-slate-300">للاستفادة من اشتراك الطلبة (50 درهم شهرياً)، يرجى التواصل معنا عبر واتساب للتحقق.</p>
                      <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all">
                        تواصل عبر واتساب
                      </a>
                    </div>
                  )}
                  {selectedType === 'judge' && (
                    <div className="space-y-4">
                      <p className="text-slate-300">للاستفادة من اشتراك القضاة المتدربين (150 درهم شهرياً)، يرجى التواصل معنا عبر واتساب.</p>
                      <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all">
                        تواصل عبر واتساب
                      </a>
                    </div>
                  )}
                  {selectedType === 'lawyer' && (
                    <div className="space-y-6">
                      <button onClick={() => setShowSubscriptionModal(true)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                        اشترك الآن - 500 MAD/شهر
                      </button>
                      <div className="flex items-center gap-4 justify-center text-sm text-slate-500">
                        <span>أو</span>
                        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">تواصل معنا عبر واتساب</a>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-widest">الاشتراك قابل للإلغاء في أي وقت</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Right Column - Results */}
              <div className="order-2 lg:order-1 relative">
                <AnimatePresence>
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-50">
                      <svg className="w-full h-full overflow-visible">
                        <motion.path
                          d="M 600,200 Q 300,100 0,300"
                          fill="none"
                          stroke="url(#gradient-beam)"
                          strokeWidth="4"
                          className="data-beam"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                        <defs>
                          <linearGradient id="gradient-beam" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                            <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>

                <ResultsPanel ref={resultsPanelRef} analysis={analysis} isLoading={isLoading} error={error} />

                {analysis && !isLoading && !error && (
                  <div className="mt-6">
                    {!showFollowupBox ? (
                      <button className="w-full py-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-bold transition-all" onClick={() => setShowFollowupBox(true)}>
                        🧠 هل التحليل كافٍ؟ أضف سؤالًا
                      </button>
                    ) : (
                      <div className="glass border border-blue-500/20 rounded-2xl p-6 space-y-4">
                        <label className="block text-slate-300 font-medium">سؤال تكميلي:</label>
                        <textarea
                          className="w-full h-24 p-4 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-slate-200"
                          placeholder="اكتب سؤالك هنا..."
                          value={followupQuestion}
                          onChange={e => setFollowupQuestion(e.target.value)}
                          disabled={isFollowupLoading}
                        />
                        <div className="flex gap-3 justify-end">
                          <button className="px-4 py-2 text-slate-400 hover:bg-white/5 rounded-lg" onClick={() => setShowFollowupBox(false)} disabled={isFollowupLoading}>إلغاء</button>
                          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50" onClick={handleSendFollowup} disabled={isFollowupLoading || !followupQuestion.trim()}>
                            {isFollowupLoading ? 'جاري الإرسال...' : 'إرسال'}
                          </button>
                        </div>
                      </div>
                    )}
                    {followupAnswer && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-blue-900/20 border border-blue-500/30 rounded-2xl mt-4 text-slate-200 whitespace-pre-line leading-relaxed">
                        <div className="text-blue-400 font-bold mb-2 flex items-center gap-2"><span>💬</span> الجواب التكميلي:</div>
                        {followupAnswer}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Left Column - Input */}
              <div className="space-y-6 order-1 lg:order-2">
                <div className="glass rounded-2xl p-8 border border-white/5">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                      <img src="/logo.svg" className="w-8 h-8 opacity-80" alt="icon" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100 font-heading">تفاصيل النازلة</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">عنوان القضية (اختياري)</label>
                      <input
                        type="text"
                        className="w-full p-4 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-slate-200 placeholder-slate-600"
                        placeholder="مثال: نزاع عقاري..."
                        value={caseTitle}
                        onChange={e => setCaseTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">الوقائع والتفاصيل</label>
                      <textarea
                        className="w-full h-64 p-4 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-slate-200 placeholder-slate-600 leading-relaxed"
                        placeholder="صف الوقائع هنا..."
                        value={caseText}
                        onChange={e => setCaseText(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {caseText.trim() && (
                  <div className="glass border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-slate-200">أسئلة توضيحية</h4>
                      <button onClick={handleSuggestQuestions} disabled={isQuestionsLoading} className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 text-xs font-bold transition-all">
                        {isQuestionsLoading ? 'جاري التوليد...' : 'اقترح أسئلة'}
                      </button>
                    </div>
                    {clarifyingQuestions.length > 0 && (
                      <ul className="space-y-3">
                        {clarifyingQuestions.map((q, idx) => (
                          <li key={idx} className="flex gap-3 text-slate-300 text-sm p-3 bg-white/5 rounded-lg border border-white/5 hover:border-blue-500/30 transition-all">
                            <span className="text-blue-500">•</span> {q}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div className="flex gap-4">
                  <button onClick={handleAnalyzeCase} disabled={isLoading || !caseText.trim()} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                    {isLoading ? 'جاري التحليل...' : '🚀 بدء التحليل القانوني'}
                  </button>
                  <button onClick={handleClearAll} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-white/10 font-bold transition-all">مسح</button>
                </div>

                <div className="glass border border-white/5 rounded-2xl p-6 space-y-6">
                  <h3 className="text-lg font-bold text-slate-200">أدوات ذكية</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
                      <input type="file" accept="audio/*" onChange={handleTranscribeAudio} ref={fileInputRef} className="hidden" id="audio-upload" />
                      <label htmlFor="audio-upload" className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-xs font-bold cursor-pointer text-center block transition-all">{isTranscribing ? 'جاري...' : '🔊 ملف صوتي'}</label>
                    </div>
                    <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                      <label htmlFor="image-upload" className="w-full py-2 bg-teal-600/10 hover:bg-teal-600/20 text-teal-400 rounded-lg text-xs font-bold cursor-pointer text-center block transition-all">{isOcrLoading ? 'جاري...' : '📷 صورة مستند'}</label>
                    </div>
                  </div>
                  {transcriptionResult && (
                    <div className="p-4 bg-slate-800/50 border border-white/5 rounded-xl text-slate-200 text-sm max-h-40 overflow-y-auto">
                      {transcriptionResult}
                    </div>
                  )}
                </div>

                <div className="glass border border-white/5 rounded-2xl p-6 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-200">توليد التقرير</h4>
                    <p className="text-xs text-slate-500">تحميل ملف PDF متطابق مع المعايير</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => analysis && resultsPanelRef.current?.print()} disabled={!analysis} className="px-6 py-3 bg-white text-slate-900 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl font-bold shadow-lg transition-all active:scale-95">📄 التقرير</button>
                    <button onClick={() => setShowDiagnostics(true)} className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-slate-200 transition-all">🔧</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="glass border-t border-white/5 mt-12 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <img src="/logo.svg" className="w-10 h-10 opacity-60" alt="footer-logo" />
              <div>
                <p className="text-slate-400 font-bold">الخبير القانوني</p>
                <p className="text-xs text-slate-600">من تصميم الطالب الشغوف مصعب فاطمي</p>
              </div>
            </div>
            <div className="flex gap-8 text-[10px] font-mono tracking-widest text-slate-600 uppercase">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500/40 rounded-full" /> Encrypted</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500/40 rounded-full" /> Private</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-500/40 rounded-full" /> AI Verified</span>
            </div>
          </div>
        </footer>

        <AnimatePresence>
          {showSubscriptionModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="glass max-w-md w-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-100 font-heading">اشترك الآن</h2>
                  <button onClick={() => setShowSubscriptionModal(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
                </div>
                <div className="p-6">
                  <PayPalSubscription plan={getPlan('lawyer')!} onSubscriptionSuccess={handleSubscriptionSuccess} onSubscriptionError={handleSubscriptionError} />
                  {subscriptionError && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs text-center">{subscriptionError}</div>}
                </div>
              </motion.div>
            </div>
          )}
          {showAdminLogin && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
                <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
              </motion.div>
            </div>
          )}
          {showDiagnostics && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="glass max-w-3xl w-full max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <h3 className="text-lg font-bold text-slate-100">تشخيص المشاكل التقنية</h3>
                  <button onClick={() => setShowDiagnostics(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
                </div>
                <div className="overflow-y-auto">
                  <ReportDiagnostics analysis={analysis} onClose={() => setShowDiagnostics(false)} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export function ExamplePage() {
  const exampleAnalysis = {
    "نوع_القضية": "مدني - عقاري",
    "الوقائع_الجوهرية": [
      "شراء المدعي لشقة في طور البناء",
      "تأخر المنعش العقاري في التسليم لمدة سنتين",
      "وجود شرط جزائي في العقد"
    ],
    "التكييف_القانوني": [
      "هل يحق للمدعي فسخ العقد؟",
      "هل يستحق التعويض عن التأخير؟"
    ],
    "النصوص_القانونية_ذات_الصلة": [
      "الفصل 254 من قانون الالتزامات والعقود",
      "قانون 44.00 المتعلق ببيع العقار في طور الإنجاز"
    ],
    "الاجتهاد_القضائي": "قرار محكمة النقض عدد 123 لسنة 2020...",
    "الخلاصة": "يحق للمدعي المطالبة بالفسخ والتعويض.",
    "العناصر_المادية_والمعنوية": ["تحليل العناصر"],
    "الدفاعات_الممكنة": ["دفع أول"],
    "الإجراءات_المقترحة": ["إجراء أول"],
    "سوابق_قضائية_مغربية_محتملة": ["سابق أول"],
    "تحليل_النازلة": "تحليل مطول"
  } as any;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 p-8" dir="rtl">
      <ParticlesBackground />
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold mb-6 text-center text-slate-100 glow-blue">نموذج تحليل قانوني</h1>
        <ResultsPanel analysis={exampleAnalysis} isLoading={false} error={null} />
        <div className="mt-8 text-center">
          <Link to="/" className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;