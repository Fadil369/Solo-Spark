import DOMPurify from 'dompurify';
import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  Check,
  Copy,
  Dice1,
  Download,
  FileText,
  Flame,
  Globe,
  Home,
  Loader2,
  Moon,
  Rocket,
  Save,
  Sparkles,
  Sun,
  Target,
  Trophy,
  Upload,
  X,
  Zap
} from 'lucide-react';
import { marked } from 'marked';
import { useEffect, useMemo, useState } from 'react';
import AIAssistant from './components/AIAssistant';
import AutomationManager from './components/AutomationManager';
import ContentEnhancer from './components/ContentEnhancer';
import NotificationControl from './components/NotificationControl';
import ProjectManager from './components/ProjectManager';
import SmartSuggestions from './components/SmartSuggestions';
import LandingPage from './pages/LandingPage';
import AIService, { ContextMemory } from './services/aiService';
import { userAccountService, UserProfile } from './services/userAccountService';

// Unified, mobile-first app that merges the attached React and HTML solutions
// - EN/AR with RTL, persistent theme, gamification
// - Idea -> Story -> PRD -> Prototype stages
// - Mobile-first layouts with Tailwind, custom animations, safe markdown rendering

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';

type SavedWork = {
  ideas: Array<{ content: string; date: string; meta?: any }>;
  stories: Array<{ content: string; date: string; meta?: any }>;
  prds: Array<{ content: string; date: string; meta?: any }>;
  prototypes: Array<{ content: string; date: string; meta?: any }>;
};

type UserProgress = {
  points: number;
  streak: number;
  level: number;
  achievements: string[];
  completedStages: number[];
  savedWork: SavedWork;
};

const initialProgress: UserProgress = {
  points: 0,
  streak: 0,
  level: 1,
  achievements: [],
  completedStages: [],
  savedWork: { ideas: [], stories: [], prds: [], prototypes: [] }
};

const initialAIContext: ContextMemory = {
  ideas: [],
  stories: [],
  prds: [],
  prototypes: [],
  userPreferences: {
    language: 'en',
    industries: [],
    complexity: 'moderate',
    tone: 'professional',
    innovationStyle: 'incremental',
    riskTolerance: 'medium',
    marketFocus: 'local'
  },
  conversationHistory: [],
  insights: {
    strengthAreas: [],
    improvementAreas: [],
    successPatterns: [],
    marketOpportunities: []
  }
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    appTitle: 'BrainSAIT Innovation Lab',
    tagline: 'From Spark to Ship',
    subtitle:
      'Transform your ideas into reality through our AI-powered innovation journey',
    startJourney: 'Start Your Innovation Journey',
    ideaSpark: 'Idea Spark',
    storyBuilder: 'Story Builder',
    prdCreator: 'PRD Creator',
    prototypeShip: 'Prototype Ship',
    generateIdeas: 'Generate Ideas',
    generating: 'AI is generating...',
    word: 'Word',
    selectCategory: 'Select Category',
    business: 'Business',
    creative: 'Creative',
    technology: 'Technology',
    healthcare: 'Healthcare',
    education: 'Education',
    social: 'Social Impact',
    entertainment: 'Entertainment',
    sustainability: 'Sustainability',
    nextStage: 'Next Stage',
    previousStage: 'Previous',
    saveProgress: 'Save Progress',
    shareResults: 'Share Results',
    achievements: 'Achievements',
    points: 'Points',
    level: 'Level',
    streak: 'Day Streak',
    randomWord: 'Random Word',
    twoWords: '2 Words',
    threeWords: '3 Words',
    enableMemory: 'Enable Memory',
    clearMemory: 'Clear Memory',
    createStory: 'Create Story',
    buildContext: 'Build Context',
    generatePRD: 'Generate PRD',
    buildPrototype: 'Build Prototype',
    uploadFile: 'Upload File',
    downloadResult: 'Download Result',
    copyToClipboard: 'Copy to Clipboard',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    welcomeBack: 'Welcome Back!',
    generatedIdeas: 'Generated Ideas',
    generatedStory: 'Generated Story',
    generatedPRD: 'Generated PRD',
    prototypePreview: 'Prototype Preview',
    completion: 'Completion',
    completionToast: '🎉 Journey Complete! You are an innovator!',
    contextTone: 'Tone',
    contextAudience: 'Audience',
    contextLength: 'Length',
    contextOther: 'Other Constraints',
    downloadPrototype: 'Download Prototype',
    completeJourney: 'Complete Journey'
  },
  ar: {
    appTitle: 'مختبر الابتكار BrainSAIT',
    tagline: 'من الشرارة إلى الإطلاق',
    subtitle:
      'حوّل أفكارك إلى واقع من خلال رحلة الابتكار المدعومة بالذكاء الاصطناعي',
    startJourney: 'ابدأ رحلة الابتكار',
    ideaSpark: 'شرارة الفكرة',
    storyBuilder: 'بناء القصة',
    prdCreator: 'إنشاء المواصفات',
    prototypeShip: 'إطلاق النموذج',
    generateIdeas: 'توليد الأفكار',
    generating: 'الذكاء الاصطناعي يولّد...',
    word: 'كلمة',
    selectCategory: 'اختر الفئة',
    business: 'الأعمال',
    creative: 'إبداعي',
    technology: 'التقنية',
    healthcare: 'الرعاية الصحية',
    education: 'التعليم',
    social: 'التأثير الاجتماعي',
    entertainment: 'الترفيه',
    sustainability: 'الاستدامة',
    nextStage: 'المرحلة التالية',
    previousStage: 'السابق',
    saveProgress: 'حفظ التقدم',
    shareResults: 'مشاركة النتائج',
    achievements: 'الإنجازات',
    points: 'النقاط',
    level: 'المستوى',
    streak: 'سلسلة الأيام',
    randomWord: 'كلمة عشوائية',
    twoWords: 'كلمتان',
    threeWords: 'ثلاث كلمات',
    enableMemory: 'تفعيل الذاكرة',
    clearMemory: 'مسح الذاكرة',
    createStory: 'إنشاء قصة',
    buildContext: 'بناء السياق',
    generatePRD: 'إنشاء المواصفات',
    buildPrototype: 'بناء النموذج',
    uploadFile: 'رفع ملف',
    downloadResult: 'تحميل النتيجة',
    copyToClipboard: 'نسخ إلى الحافظة',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    welcomeBack: 'مرحباً بعودتك!',
    generatedIdeas: 'الأفكار المُنشأة',
    generatedStory: 'القصة المُنشأة',
    generatedPRD: 'المواصفات المُنشأة',
    prototypePreview: 'معاينة النموذج',
    completion: 'الإنجاز',
    completionToast: '🎉 اكتملت الرحلة! أنت مبتكر!',
    contextTone: 'النبرة',
    contextAudience: 'الجمهور',
    contextLength: 'الطول',
    contextOther: 'قيود أخرى',
    downloadPrototype: 'تحميل النموذج',
    completeJourney: 'إكمال الرحلة'
  }
};

const categories = [
  { id: 'business', icon: '💼', tKey: 'business' },
  { id: 'creative', icon: '🎨', tKey: 'creative' },
  { id: 'tech', icon: '💻', tKey: 'technology' },
  { id: 'health', icon: '🏥', tKey: 'healthcare' },
  { id: 'education', icon: '🎓', tKey: 'education' },
  { id: 'social', icon: '🤝', tKey: 'social' },
  { id: 'entertainment', icon: '🎮', tKey: 'entertainment' },
  { id: 'sustainability', icon: '🌱', tKey: 'sustainability' }
] as const;

const wordBanks: Record<Language, string[]> = {
  en: [
    'robot',
    'digital',
    'ocean',
    'forest',
    'quantum',
    'virtual',
    'crystal',
    'thunder',
    'solar',
    'flying',
    'ancient',
    'future',
    'magic',
    'cyber',
    'neural',
    'cosmic',
    'micro',
    'giant',
    'silent',
    'infinite',
    'smart',
    'eco',
    'bio',
    'nano',
    'hybrid',
    'cloud',
    'mobile',
    'social',
    'viral'
  ],
  ar: [
    'روبوت',
    'رقمي',
    'محيط',
    'غابة',
    'كمي',
    'افتراضي',
    'بلوري',
    'رعد',
    'شمسي',
    'طائر',
    'قديم',
    'مستقبل',
    'سحر',
    'إلكتروني',
    'عصبي',
    'كوني',
    'صغير',
    'عملاق',
    'صامت',
    'لانهائي',
    'ذكي',
    'بيئي',
    'حيوي',
    'نانو',
    'هجين',
    'سحابي',
    'محمول',
    'اجتماعي',
    'فيروسي'
  ]
};

// Precomputed Tailwind badge colors (avoid dynamic class names)
const badgeColorByStage: Record<number, string> = {
  1: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  2: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  3: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  4: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
};

const achievementsList = [
  { id: 'first_spark', icon: '💡', name: 'First Spark', description: 'Generate your first idea', points: 100 },
  { id: 'storyteller', icon: '📚', name: 'Storyteller', description: 'Create your first story', points: 150 },
  { id: 'architect', icon: '📐', name: 'Architect', description: 'Build your first PRD', points: 200 },
  { id: 'launcher', icon: '🚀', name: 'Launcher', description: 'Create your first prototype', points: 300 },
  { id: 'innovator', icon: '🏆', name: 'Innovator', description: 'Complete the full journey', points: 500 },
  { id: 'streak_master', icon: '🔥', name: 'Streak Master', description: '7-day streak', points: 250 },
  { id: 'idea_machine', icon: '⚡', name: 'Idea Machine', description: 'Generate 10 ideas', points: 200 },
  { id: 'polyglot', icon: '🌍', name: 'Polyglot', description: 'Use both languages', points: 100 }
];

function App() {
  // Theme and language
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');
  const isRTL = language === 'ar';

  // Navigation
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const [currentStage, setCurrentStage] = useState<number>(1);

  // User Authentication and Account
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);

  // Progress and gamification
  const [userProgress, setUserProgress] = useState<UserProgress>(initialProgress);
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>
  >([]);
  const [showAchievements, setShowAchievements] = useState(false);

  // AI Context and Services
  const [aiContext, setAiContext] = useState<ContextMemory>(initialAIContext);
  const [aiService] = useState(() => new AIService());
  const [automationEnabled, setAutomationEnabled] = useState<boolean>(true);

  // Stage 1: Idea Spark
  const [wordMode, setWordMode] = useState<'2' | '3'>('3');
  const [words, setWords] = useState<{ word1: string; word2: string; word3?: string }>({
    word1: '',
    word2: '',
    word3: ''
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [enableMemory, setEnableMemory] = useState<boolean>(false);
  const [contextMemory, setContextMemory] = useState<any[]>([]);
  const [generatedIdeas, setGeneratedIdeas] = useState<string>('');
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState<boolean>(false);

  // Stage 2: Story Builder
  const [storyPrompt, setStoryPrompt] = useState<string>('');
  const [storyContext, setStoryContext] = useState<{
    tone?: string;
    audience?: string;
    length?: string;
    other?: string;
  }>({});
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const [isGeneratingStory, setIsGeneratingStory] = useState<boolean>(false);
  const [showContextBuilder, setShowContextBuilder] = useState<boolean>(false);

  // Stage 3: PRD
  const [prdQuestions, setPrdQuestions] = useState<{
    question1: string;
    question2: string;
    question3: string;
  }>({ question1: '', question2: '', question3: '' });
  const [generatedPRD, setGeneratedPRD] = useState<string>('');
  const [isGeneratingPRD, setIsGeneratingPRD] = useState<boolean>(false);

  // Stage 4: Prototype
  const [prototypeFile, setPrototypeFile] = useState<File | null>(null);
  const [generatedPrototype, setGeneratedPrototype] = useState<string>('');
  const [isGeneratingPrototype, setIsGeneratingPrototype] = useState<boolean>(false);

  const t = (key: string) => translations[language]?.[key] || translations.en[key] || key;

  // Persisted settings
  useEffect(() => {
    const savedTheme = (localStorage.getItem('brainsait_theme') as Theme) || 'light';
    const savedLang = (localStorage.getItem('brainsait_language') as Language) || 'en';
    const savedProgress = localStorage.getItem('brainsait_progress');

    setTheme(savedTheme);
    setLanguage(savedLang);
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
    addNotification(`${Date.now()}`, `${t('welcomeBack')} 🎉`, 'success');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('brainsait_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [theme, language, isRTL]);

  // User Authentication Initialization
  useEffect(() => {
    const user = userAccountService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      // Update AI context with user preferences
      setAiContext(prev => ({
        ...prev,
        userPreferences: {
          ...prev.userPreferences,
          language: user.language,
          industries: user.industry ? [user.industry] : [],
          complexity: user.experience === 'beginner' ? 'simple' :
                     user.experience === 'expert' ? 'advanced' : 'moderate'
        }
      }));
    }
  }, []);

  // Helpers: notifications, points, achievements
  function addNotification(id: string, message: string, type: 'success' | 'error' | 'info' = 'info') {
    const notifId = `${id}-${Date.now()}`;
    setNotifications((prev) => [...prev, { id: notifId, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    }, 4000);
  }

  function addPoints(points: number, reason: string) {
    setUserProgress((prev) => {
      const newPoints = prev.points + points;
      const newLevel = Math.floor(newPoints / 1000) + 1;
      if (newLevel > prev.level) {
        addNotification('levelup', `🎉 Level Up! You're now Level ${newLevel}!`, 'success');
      }
      return { ...prev, points: newPoints, level: newLevel };
    });
    addNotification('points', `+${points} XP: ${reason}`, 'success');
  }

  function checkAchievement(achievementId: string) {
    if (userProgress.achievements.includes(achievementId)) return;
    const found = achievementsList.find((a) => a.id === achievementId);
    if (!found) return;
    setUserProgress((prev) => ({ ...prev, achievements: [...prev.achievements, achievementId] }));
    addPoints(found.points, found.name);
    addNotification('achv', `🏆 Achievement Unlocked: ${found.name}!`, 'success');
  }

  // User Authentication Functions
  async function handleSignUp(email: string, password: string, profile: Partial<UserProfile>) {
    try {
      const user = await userAccountService.signUp(email, password, profile);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setShowSignInModal(false);
      addNotification('signup', 'Welcome to BrainSAIT!', 'success');

      // Update AI context with user preferences
      setAiContext(prev => ({
        ...prev,
        userPreferences: {
          ...prev.userPreferences,
          language: user.language,
          industries: user.industry ? [user.industry] : []
        }
      }));
    } catch (error) {
      addNotification('signup-error', 'Sign up failed. Please try again.', 'error');
    }
  }

  async function handleSignIn(email: string, password: string) {
    try {
      const user = await userAccountService.signIn(email, password);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setShowSignInModal(false);
      addNotification('signin', `Welcome back, ${user.name}!`, 'success');
    } catch (error) {
      addNotification('signin-error', 'Invalid credentials. Please try again.', 'error');
    }
  }

  async function handleSignOut() {
    await userAccountService.signOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
    addNotification('signout', 'Signed out successfully', 'info');
  }

  function handleProjectSave(projectId: string) {
    addNotification('save', 'Project saved successfully!', 'success');
    checkAchievement('first_save');
  }

  function handleProjectShare(shareUrl: string) {
    navigator.clipboard.writeText(shareUrl);
    addNotification('share', 'Share link copied to clipboard!', 'success');
  }

  // Stage navigation
  function navigateToStage(stage: number) {
    setCurrentStage(stage);
    setCurrentView('app');
    if (!userProgress.completedStages.includes(stage - 1) && stage > 1) {
      setUserProgress((prev) => ({ ...prev, completedStages: [...prev.completedStages, stage - 1] }));
    }
  }

  function generateRandomWord(idx: 1 | 2 | 3) {
    const bank = wordBanks[language];
    const w = bank[Math.floor(Math.random() * bank.length)];
    setWords((prev) => ({ ...prev, [`word${idx}`]: w }));
    addPoints(5, 'Random word generated');
  }

  // Safe Markdown -> HTML
  const toHtml = (md: string) => DOMPurify.sanitize(marked.parse(md) as string);

  // Enhanced AI assistant handlers
  const handleAISuggestionApply = (suggestion: string, type: 'idea' | 'story' | 'prd' | 'prototype') => {
    switch (type) {
      case 'idea':
        setGeneratedIdeas(suggestion);
        break;
      case 'story':
        setGeneratedStory(suggestion);
        break;
      case 'prd':
        setGeneratedPRD(suggestion);
        break;
      case 'prototype':
        setGeneratedPrototype(suggestion);
        break;
    }
    addPoints(25, 'AI suggestion applied');
  };

  const handleSmartSuggestionApply = (suggestion: string, applicationType: 'replace' | 'append' | 'improve') => {
    const currentContent = getCurrentStageContent();
    let newContent = '';

    switch (applicationType) {
      case 'replace':
        newContent = suggestion;
        break;
      case 'append':
        newContent = currentContent + '\n\n' + suggestion;
        break;
      case 'improve':
        newContent = suggestion; // For improve, the suggestion is already the improved version
        break;
    }

    updateCurrentStageContent(newContent);
    addPoints(20, 'Smart suggestion applied');
  };

  const handleContentEnhancement = (newContent: string) => {
    updateCurrentStageContent(newContent);
    addPoints(30, 'Content enhanced with AI');
  };

  const getCurrentStageContent = (): string => {
    switch (currentStage) {
      case 1:
        return generatedIdeas;
      case 2:
        return generatedStory;
      case 3:
        return generatedPRD;
      case 4:
        return generatedPrototype;
      default:
        return '';
    }
  };

  const updateCurrentStageContent = (content: string) => {
    switch (currentStage) {
      case 1:
        setGeneratedIdeas(content);
        break;
      case 2:
        setGeneratedStory(content);
        break;
      case 3:
        setGeneratedPRD(content);
        break;
      case 4:
        setGeneratedPrototype(content);
        break;
    }
  };

  // Update AI context when language changes
  useEffect(() => {
    setAiContext(prev => ({
      ...prev,
      userPreferences: {
        ...prev.userPreferences,
        language
      }
    }));
  }, [language]);

  // Update AI context with generated content
  useEffect(() => {
    if (generatedIdeas) {
      setAiContext(prev => ({
        ...prev,
        ideas: [...prev.ideas, generatedIdeas].slice(-5) // Keep last 5
      }));
    }
  }, [generatedIdeas]);

  useEffect(() => {
    if (generatedStory) {
      setAiContext(prev => ({
        ...prev,
        stories: [...prev.stories, generatedStory].slice(-5)
      }));
    }
  }, [generatedStory]);

  useEffect(() => {
    if (generatedPRD) {
      setAiContext(prev => ({
        ...prev,
        prds: [...prev.prds, generatedPRD].slice(-5)
      }));
    }
  }, [generatedPRD]);

  function generateDemoContent(prompt: string) {
    const p = prompt.toLowerCase();
    if (p.includes('idea')) {
      return `## ${t('generatedIdeas')}
1. Smart Ocean Explorer — AI-powered underwater robot for mapping and marine research
2. Digital Forest Guardian — Satellite+VR system to monitor and protect forests
3. Quantum Learning Platform — Adaptive learning using quantum-inspired optimization
4. Bio-Nano Health Patch — Wearable diagnostics with continuous monitoring
5. Cloud Hybrid Edge — Seamless compute across device, edge, and cloud`;
    }
    if (p.includes('story')) {
      return `# ${t('generatedStory')}
In a world where technology meets nature, a team of visionaries set out to build a product that matters. Fueled by curiosity and guided by data, they turned sparks into a story that customers could feel...`;
    }
    if (p.includes('prd')) {
      return `# ${t('generatedPRD')}
## Executive Summary
A concise overview of the product, target users, and value proposition.

## Problem Statement
Clear articulation of user problems and pain points.

## Goals & Success Metrics
- Activation rate
- Retention
- NPS
- Time-to-Value

## Key Features
- MVP scope with prioritization (MoSCoW)
- User stories and acceptance criteria

## Risks & Mitigations
- Technical, market, operational

## Launch Plan
- Timeline, owners, KPIs`;
    }
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${t('prototypePreview')}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 1rem; background:#0f172a; color:#e2e8f0;}
      .card { background:#111827; border:1px solid #374151; border-radius:12px; padding:16px; margin: 0 auto; max-width: 720px;}
      .btn { background: linear-gradient(90deg,#7c3aed,#2563eb); color:#fff; padding:10px 16px; border-radius:999px; border:none; cursor:pointer;}
      .grid { display:grid; gap:12px; grid-template-columns: repeat(12,1fr);}
      @media (max-width:640px){ .grid { grid-template-columns: repeat(6,1fr); } }
    </style>
  </head>
  <body>
    <div class="card">
      <h1 style="margin-top:0">🚀 ${t('prototypePreview')}</h1>
      <p>A minimal, responsive shell of your market-fit concept.</p>
      <div class="grid">
        <div style="grid-column: span 12; background:#1f2937; height:48px; border-radius:8px;"></div>
        <div style="grid-column: span 6; background:#1f2937; height:120px; border-radius:8px;"></div>
        <div style="grid-column: span 6; background:#1f2937; height:120px; border-radius:8px;"></div>
        <div style="grid-column: span 12;">
          <button class="btn">Primary Action</button>
        </div>
      </div>
    </div>
  </body>
</html>`;
  }

  // Generate ideas with enhanced AI
  async function handleGenerateIdeas() {
    if (!words.word1 || !words.word2 || (wordMode === '3' && !words.word3)) {
      addNotification('err', isRTL ? 'يرجى إدخال الكلمات المطلوبة' : 'Please fill in all words', 'error');
      return;
    }
    if (!selectedCategory) {
      addNotification('err', isRTL ? 'يرجى اختيار الفئة' : 'Please select a category', 'error');
      return;
    }

    setIsGeneratingIdeas(true);
    const catLabel =
      translations[language][(categories.find((c) => c.id === selectedCategory)?.tKey as string) || ''] ||
      selectedCategory;

    const wordsArray = wordMode === '3'
      ? [words.word1, words.word2, words.word3!]
      : [words.word1, words.word2];

    try {
      const response = await aiService.generateIdeas(wordsArray, catLabel, language, aiContext);
      setGeneratedIdeas(response.content);

      if (enableMemory) {
        setContextMemory((prev) => [...prev, { words: wordsArray, category: catLabel, ideas: response.content }]);
      }

      addPoints(100, 'Ideas generated');
      checkAchievement('first_spark');

      const totalIdeas = userProgress.savedWork.ideas.length + 1;
      if (totalIdeas >= 10) checkAchievement('idea_machine');
    } catch (error) {
      addNotification('err', isRTL ? 'حدث خطأ في توليد الأفكار' : 'Error generating ideas', 'error');
    } finally {
      setIsGeneratingIdeas(false);
    }
  }

  // Story generate with enhanced AI
  async function handleGenerateStory() {
    setIsGeneratingStory(true);
    try {
      const response = await aiService.buildStory(storyPrompt, storyContext, language, aiContext);
      setGeneratedStory(response.content);
      addPoints(150, 'Story created');
      checkAchievement('storyteller');
    } catch (error) {
      addNotification('err', isRTL ? 'حدث خطأ في إنشاء القصة' : 'Error creating story', 'error');
    } finally {
      setIsGeneratingStory(false);
    }
  }

  // PRD generate with enhanced AI
  async function handleGeneratePRD() {
    setIsGeneratingPRD(true);
    try {
      const answers = {
        product: prdQuestions.question1,
        users: prdQuestions.question2,
        features: prdQuestions.question3
      };
      const response = await aiService.createPRD(answers, language, aiContext);
      setGeneratedPRD(response.content);
      addPoints(200, 'PRD created');
      checkAchievement('architect');
    } catch (error) {
      addNotification('err', isRTL ? 'حدث خطأ في إنشاء المواصفات' : 'Error creating PRD', 'error');
    } finally {
      setIsGeneratingPRD(false);
    }
  }

  // Prototype generate with enhanced AI
  async function handleGeneratePrototype() {
    setIsGeneratingPrototype(true);
    try {
      let prdSource = generatedPRD;
      if (prototypeFile) {
        prdSource = await prototypeFile.text();
      }
      const response = await aiService.generatePrototype(prdSource, undefined, aiContext);
      setGeneratedPrototype(response.content);
      addPoints(300, 'Prototype created');
      checkAchievement('launcher');
      checkAchievement('innovator');
    } catch (error) {
      addNotification('err', isRTL ? 'حدث خطأ في إنشاء النموذج' : 'Error creating prototype', 'error');
    } finally {
      setIsGeneratingPrototype(false);
    }
  }

  // Theme styles
  const styles = useMemo(
    () => ({
      bg: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
      surface: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
      border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
      text: theme === 'dark' ? 'text-white' : 'text-gray-900',
      textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
      hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
    }),
    [theme]
  );

  const journeyCards = [
    { stage: 1, icon: '💡', title: t('ideaSpark'), points: 100, badgeClass: badgeColorByStage[1] },
    { stage: 2, icon: '📖', title: t('storyBuilder'), points: 150, badgeClass: badgeColorByStage[2] },
    { stage: 3, icon: '📋', title: t('prdCreator'), points: 200, badgeClass: badgeColorByStage[3] },
    { stage: 4, icon: '🚀', title: t('prototypeShip'), points: 300, badgeClass: badgeColorByStage[4] }
  ];

  return (
    <div className={`${styles.bg} ${styles.text} min-h-screen`}>
      {/* Top nav (landing or app) */}
      {currentView === 'landing' ? (
        <header className={`sticky top-0 z-30 ${styles.surface} border-b ${styles.border} bg-opacity-90 backdrop-blur`}>
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧠</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {t('appTitle')}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newLang: Language = language === 'en' ? 'ar' : 'en';
                  setLanguage(newLang);
                  localStorage.setItem('brainsait_language', newLang);
                  checkAchievement('polyglot');
                }}
                className={`px-3 py-2 rounded-lg ${styles.hover} flex items-center gap-2`}
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">{language === 'en' ? 'العربية' : 'English'}</span>
              </button>
              <button
                onClick={() => {
                  const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
                  setTheme(newTheme);
                  localStorage.setItem('brainsait_theme', newTheme);
                }}
                className={`p-2 rounded-lg ${styles.hover}`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>
      ) : (
        <header className={`sticky top-0 z-30 ${styles.surface} border-b ${styles.border} bg-opacity-90 backdrop-blur`}>
          <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('landing')}
                className={`p-2 rounded-lg ${styles.hover}`}
                aria-label={language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to home'}
              >
                <Home className="h-5 w-5" />
              </button>
              <span className="text-xl">🧠</span>
              <span className="font-semibold">{t('appTitle')}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">{userProgress.points} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-5 w-5 text-purple-500" />
                <span className="font-medium">
                  {t('level')} {userProgress.level}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-medium">
                  {userProgress.streak} {t('streak')}
                </span>
              </div>
              <button
                onClick={() => setShowAchievements(true)}
                className={`p-2 rounded-lg ${styles.hover}`}
                aria-label={language === 'ar' ? 'عرض الإنجازات' : 'Show achievements'}
              >
                <Award className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
                  setTheme(newTheme);
                  localStorage.setItem('brainsait_theme', newTheme);
                }}
                className={`p-2 rounded-lg ${styles.hover}`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Landing */}
      {currentView === 'landing' && (
        <LandingPage
          language={language}
          theme={theme}
          onLanguageChange={setLanguage}
          onThemeChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onGetStarted={() => setCurrentView('app')}
        />
      )}      {/* App main */}
      {currentView === 'app' && (
        <main className="mx-auto max-w-7xl px-4 py-6">
          {/* Progress */}
          <div className={`${styles.surface} mb-4 rounded-lg border ${styles.border} p-4`}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">
                {t('level')} {userProgress.level}
              </span>
              <span className="font-medium">
                {t('completion')}: {Math.round((currentStage / 4) * 100)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all"
                style={{ width: `${(currentStage / 4) * 100}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setCurrentStage(s)}
                  className={`rounded-md px-2 py-1 ${
                    currentStage === s
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : `${styles.hover}`
                  }`}
                >
                  {s === 1 && t('ideaSpark')}
                  {s === 2 && t('storyBuilder')}
                  {s === 3 && t('prdCreator')}
                  {s === 4 && t('prototypeShip')}
                </button>
              ))}
            </div>
          </div>

          {/* Stage 1: Idea Spark */}
          {currentStage === 1 && (
            <section className="space-y-4">
              <header className="text-center">
                <h2 className="text-2xl font-bold">💡 {t('ideaSpark')}</h2>
                <p className={`text-sm ${styles.textMuted}`}>
                  {language === 'ar'
                    ? 'ادمج الكلمات لتوليد أفكار مبتكرة'
                    : 'Combine words to generate innovative ideas'}
                </p>
              </header>

              {/* Word mode toggle */}
              <div className="mx-auto max-w-sm rounded-lg border p-1">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setWordMode('2')}
                    className={`rounded-md px-3 py-2 text-sm ${
                      wordMode === '2' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : styles.hover
                    }`}
                  >
                    {t('twoWords')}
                  </button>
                  <button
                    onClick={() => setWordMode('3')}
                    className={`rounded-md px-3 py-2 text-sm ${
                      wordMode === '3' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : styles.hover
                    }`}
                  >
                    {t('threeWords')}
                  </button>
                </div>
              </div>

              {/* Word inputs (mobile-first single column) */}
              <div className={`grid gap-3 sm:grid-cols-${wordMode === '3' ? '3' : '2'}`}>
                {[1, 2, ...(wordMode === '3' ? [3] : [])].map((idx) => {
                  const key = `word${idx}` as keyof typeof words;
                  return (
                    <div key={key} className={`${styles.surface} rounded-xl border ${styles.border} p-4`}>
                      <label className="mb-2 block text-xs font-medium">
                        {t('word')} {idx}
                      </label>
                      <input
                        type="text"
                        value={words[key] || ''}
                        onChange={(e) => setWords((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder={wordBanks[language][idx - 1]}
                        className={`w-full rounded-lg border ${styles.border} bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      <button
                        onClick={() => generateRandomWord(idx as 1 | 2 | 3)}
                        className="mt-2 w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-2 text-white"
                      >
                        <Dice1 className="mr-1 inline h-4 w-4" />
                        {t('randomWord')}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Categories */}
              <div>
                <h3 className="mb-2 text-sm font-semibold">{t('selectCategory')}</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`rounded-lg border p-3 transition ${
                        selectedCategory === c.id ? 'border-purple-500 shadow' : styles.border
                      } ${styles.surface}`}
                    >
                      <div className="text-2xl">{c.icon}</div>
                      <div className="text-xs font-medium">
                        {translations[language][c.tKey] || c.id}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory toggle */}
              <div className="flex items-center justify-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enableMemory}
                    onChange={(e) => setEnableMemory(e.target.checked)}
                    className="h-4 w-4 accent-purple-600"
                  />
                  {t('enableMemory')}
                </label>
                {enableMemory && contextMemory.length > 0 && (
                  <button onClick={() => setContextMemory([])} className="text-sm text-red-500 hover:underline">
                    {t('clearMemory')}
                  </button>
                )}
              </div>

              {/* Generate button */}
              <div className="text-center">
                <button
                  onClick={handleGenerateIdeas}
                  disabled={isGeneratingIdeas || !selectedCategory || !words.word1 || !words.word2}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {isGeneratingIdeas ? (
                    <>
                      <Loader2 className="mr-2 inline h-5 w-5 animate-spin" />
                      {t('generating')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 inline h-5 w-5" />
                      {t('generateIdeas')}
                    </>
                  )}
                </button>
              </div>

              {/* Output */}
              {generatedIdeas && (
                <div className={`${styles.surface} rounded-xl border ${styles.border} p-4`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t('generatedIdeas')}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedIdeas);
                          addNotification('copy', isRTL ? 'تم النسخ!' : 'Copied!', 'success');
                        }}
                        className={`rounded-lg p-2 ${styles.hover}`}
                        aria-label={t('copyToClipboard')}
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          const saved = [...userProgress.savedWork.ideas, { content: generatedIdeas, date: new Date().toISOString() }];
                          setUserProgress((prev) => ({ ...prev, savedWork: { ...prev.savedWork, ideas: saved } }));
                          addNotification('save', isRTL ? 'تم الحفظ' : 'Saved', 'success');
                        }}
                        className={`rounded-lg p-2 ${styles.hover}`}
                        aria-label="Save"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <article
                    className="prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: toHtml(generatedIdeas) }}
                  />

                  {/* Enhanced Project Manager for Ideas */}
                  <ProjectManager
                    content={generatedIdeas}
                    type="idea"
                    title={`Ideas - ${words.word1} ${words.word2} ${words.word3 || ''}`.trim()}
                    stage={1}
                    onSave={handleProjectSave}
                    onShare={handleProjectShare}
                    language={language}
                    isDarkMode={theme === 'dark'}
                  />

                  <button
                    onClick={() => {
                      setCurrentStage(2);
                      const firstLine = generatedIdeas.split('\n').find(Boolean) || '';
                      setStoryPrompt(firstLine.replace(/^(\d+\.|\-)\s*/, ''));
                      addPoints(50, 'Proceeding to Story Builder');
                    }}
                    className="mt-4 w-full rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2 font-semibold text-white"
                  >
                    {t('nextStage')}: {t('storyBuilder')} →
                  </button>

                  {/* Smart Suggestions for Ideas */}
                  <SmartSuggestions
                    currentStage={1}
                    language={language}
                    theme={theme}
                    context={aiContext}
                    currentContent={generatedIdeas}
                    onApplySuggestion={handleSmartSuggestionApply}
                  />

                  {/* Content Enhancer for Ideas */}
                  <ContentEnhancer
                    content={generatedIdeas}
                    language={language}
                    theme={theme}
                    context={aiContext}
                    onContentUpdate={handleContentEnhancement}
                  />
                </div>
              )}
            </section>
          )}

          {/* Stage 2: Story Builder */}
          {currentStage === 2 && (
            <section className="space-y-4">
              <header className="text-center">
                <h2 className="text-2xl font-bold">📖 {t('storyBuilder')}</h2>
                <p className={`text-sm ${styles.textMuted}`}>
                  {isRTL ? 'حوّل أفكارك إلى سرد مقنع' : 'Transform your ideas into a compelling narrative'}
                </p>
              </header>
              <div className={`${styles.surface} rounded-xl border ${styles.border} p-4`}>
                <label className="mb-2 block text-xs font-medium">Prompt</label>
                <textarea
                  rows={4}
                  value={storyPrompt}
                  onChange={(e) => setStoryPrompt(e.target.value)}
                  placeholder={isRTL ? 'صف فكرة قصتك...' : 'Describe your story idea...'}
                  className={`w-full rounded-lg border ${styles.border} bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500`}
                />
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => setShowContextBuilder((s) => !s)}
                    className="rounded-lg border border-purple-600 px-4 py-2 font-semibold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                  >
                    <Target className="mr-2 inline h-4 w-4" />
                    {t('buildContext')}
                  </button>
                  <button
                    onClick={handleGenerateStory}
                    disabled={!storyPrompt || isGeneratingStory}
                    className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                  >
                    {isGeneratingStory ? (
                      <>
                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                        {t('generating')}
                      </>
                    ) : (
                      <>
                        <BookOpen className="mr-2 inline h-4 w-4" />
                        {t('createStory')}
                      </>
                    )}
                  </button>
                </div>

                {showContextBuilder && (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs">{t('contextTone')}</label>
                      <input
                        className={`w-full rounded-lg border ${styles.border} bg-transparent px-3 py-2`}
                        value={storyContext.tone || ''}
                        onChange={(e) => setStoryContext((s) => ({ ...s, tone: e.target.value }))}
                        placeholder={isRTL ? 'احترافي، إنساني، ملهم...' : 'Professional, human, inspiring...'}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs">{t('contextAudience')}</label>
                      <input
                        className={`w-full rounded-lg border ${styles.border} bg-transparent px-3 py-2`}
                        value={storyContext.audience || ''}
                        onChange={(e) => setStoryContext((s) => ({ ...s, audience: e.target.value }))}
                        placeholder={isRTL ? 'مدير منتج، مستثمر، عميل...' : 'PM, investor, customer...'}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs">{t('contextLength')}</label>
                      <input
                        className={`w-full rounded-lg border ${styles.border} bg-transparent px-3 py-2`}
                        value={storyContext.length || ''}
                        onChange={(e) => setStoryContext((s) => ({ ...s, length: e.target.value }))}
                        placeholder={isRTL ? '150 كلمة، فقرة واحدة...' : '150 words, one paragraph...'}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs">{t('contextOther')}</label>
                      <input
                        className={`w-full rounded-lg border ${styles.border} bg-transparent px-3 py-2`}
                        value={storyContext.other || ''}
                        onChange={(e) => setStoryContext((s) => ({ ...s, other: e.target.value }))}
                        placeholder={isRTL ? 'أية قيود إضافية...' : 'Any additional constraints...'}
                      />
                    </div>
                  </div>
                )}
              </div>

              {generatedStory && (
                <div className={`${styles.surface} rounded-xl border ${styles.border} p-4`}>
                  <article
                    className="prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: toHtml(generatedStory) }}
                  />

                  {/* Enhanced Project Manager for Story */}
                  <ProjectManager
                    content={generatedStory}
                    type="story"
                    title={`Story - ${storyPrompt.slice(0, 50)}...`}
                    stage={2}
                    onSave={handleProjectSave}
                    onShare={handleProjectShare}
                    language={language}
                    isDarkMode={theme === 'dark'}
                  />

                  <button
                    onClick={() => {
                      setCurrentStage(3);
                      addPoints(50, 'Proceeding to PRD Creator');
                    }}
                    className="mt-4 w-full rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2 font-semibold text-white"
                  >
                    {t('nextStage')}: {t('prdCreator')} →
                  </button>

                  {/* Smart Suggestions for Story */}
                  <SmartSuggestions
                    currentStage={2}
                    language={language}
                    theme={theme}
                    context={aiContext}
                    currentContent={generatedStory}
                    onApplySuggestion={handleSmartSuggestionApply}
                  />

                  {/* Content Enhancer for Story */}
                  <ContentEnhancer
                    content={generatedStory}
                    language={language}
                    theme={theme}
                    context={aiContext}
                    onContentUpdate={handleContentEnhancement}
                  />
                </div>
              )}
            </section>
          )}

          {/* Stage 3: PRD Creator */}
          {currentStage === 3 && (
            <section className="space-y-4">
              <header className="text-center">
                <h2 className="text-2xl font-bold">📋 {t('prdCreator')}</h2>
                <p className={`text-sm ${styles.textMuted}`}>
                  {isRTL ? 'حوّل الأفكار إلى متطلبات منتج واضحة' : 'Transform ideas into clear product requirements'}
                </p>
              </header>

              <div className={`${styles.surface} rounded-xl border ${styles.border} p-4`}>
                {[
                  { key: 'question1', label: isRTL ? 'ما المنتج/الميزة؟' : 'What product or feature are you building?' },
                  {
                    key: 'question2',
                    label: isRTL
                      ? 'من هم المستخدمون وما المشكلة التي نحلّها؟'
                      : 'Who are the target users and what problem does this solve?'
                  },
                  {
                    key: 'question3',
                    label: isRTL ? 'ما الميزات والمقاييس الأساسية؟' : 'What are the key features and success metrics?'
                  }
                ].map((q) => (
                  <div key={q.key} className="mb-3">
                    <label className="mb-1 block text-xs font-medium">{q.label}</label>
                    <textarea
                      rows={3}
                      value={(prdQuestions as any)[q.key]}
                      onChange={(e) => setPrdQuestions((prev) => ({ ...prev, [q.key]: e.target.value }))}
                      className={`w-full rounded-lg border ${styles.border} bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>
                ))}

                <button
                  onClick={handleGeneratePRD}
                  disabled={!prdQuestions.question1 || isGeneratingPRD}
                  className="mt-2 w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                >
                  {isGeneratingPRD ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      {t('generating')}
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 inline h-4 w-4" />
                      {t('generatePRD')}
                    </>
                  )}
                </button>
              </div>

              {generatedPRD && (
                <div className={`${styles.surface} rounded-xl border ${styles.border} p-4`}>
                  <article
                    className="prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: toHtml(generatedPRD) }}
                  />

                  {/* Enhanced Project Manager for PRD */}
                  <ProjectManager
                    content={generatedPRD}
                    type="prd"
                    title={`PRD - ${generatedIdeas.slice(0, 50)}...`}
                    stage={3}
                    onSave={handleProjectSave}
                    onShare={handleProjectShare}
                    language={language}
                    isDarkMode={theme === 'dark'}
                  />

                  <button
                    onClick={() => {
                      setCurrentStage(4);
                      addPoints(50, 'Proceeding to Prototype');
                    }}
                    className="mt-4 w-full rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2 font-semibold text-white"
                  >
                    {t('nextStage')}: {t('prototypeShip')} →
                  </button>

                  {/* Smart Suggestions for PRD */}
                  <SmartSuggestions
                    currentStage={3}
                    language={language}
                    theme={theme}
                    context={aiContext}
                    currentContent={generatedPRD}
                    onApplySuggestion={handleSmartSuggestionApply}
                  />

                  {/* Content Enhancer for PRD */}
                  <ContentEnhancer
                    content={generatedPRD}
                    language={language}
                    theme={theme}
                    context={aiContext}
                    onContentUpdate={handleContentEnhancement}
                  />
                </div>
              )}
            </section>
          )}

          {/* Stage 4: Prototype */}
          {currentStage === 4 && (
            <section className="space-y-4">
              <header className="text-center">
                <h2 className="text-2xl font-bold">🚀 {t('prototypeShip')}</h2>
                <p className={`text-sm ${styles.textMuted}`}>
                  {isRTL ? 'أنشئ نماذج أولية جاهزة للإطلاق' : 'Generate working prototypes ready to launch'}
                </p>
              </header>

              <div className={`${styles.surface} rounded-xl border ${styles.border} p-4`}>
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
                  <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                  <p className="mb-3 text-sm">{isRTL ? 'ارفع ملف المواصفات (اختياري)' : 'Upload your PRD (optional)'}</p>
                  <input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    accept=".pdf,.md,.txt,.html"
                    onChange={(e) => setPrototypeFile(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="fileUpload"
                    className="inline-block cursor-pointer rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 font-semibold text-white"
                  >
                    {t('uploadFile')}
                  </label>
                </div>
                <button
                  onClick={handleGeneratePrototype}
                  disabled={isGeneratingPrototype}
                  className="mt-3 w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                >
                  {isGeneratingPrototype ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      {t('generating')}
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 inline h-4 w-4" />
                      {t('buildPrototype')}
                    </>
                  )}
                </button>
              </div>

              {generatedPrototype && (
                <div className={`${styles.surface} rounded-xl border ${styles.border} p-4`}>
                  <div className="mb-3 rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                    <iframe
                      title="Prototype"
                      className="h-96 w-full rounded border border-gray-300"
                      srcDoc={generatedPrototype}
                    />
                  </div>

                  {/* Enhanced Project Manager for Prototype */}
                  <ProjectManager
                    content={generatedPrototype}
                    type="prototype"
                    title={`Prototype - ${generatedIdeas.slice(0, 50)}...`}
                    stage={4}
                    onSave={handleProjectSave}
                    onShare={handleProjectShare}
                    language={language}
                    isDarkMode={theme === 'dark'}
                  />

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mt-4">
                    <button
                      onClick={() => {
                        const blob = new Blob([generatedPrototype], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'prototype.html';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2 font-semibold text-white"
                    >
                      <Download className="mr-2 inline h-4 w-4" />
                      {t('downloadPrototype')}
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('landing');
                        addNotification('done', t('completionToast'), 'success');
                      }}
                      className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-semibold text-white"
                    >
                      <Trophy className="mr-2 inline h-4 w-4" />
                      {t('completeJourney')}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      )}

      {/* Achievements modal */}
      {showAchievements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`${styles.surface} max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl border ${styles.border} p-4`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">🏆 {t('achievements')}</h3>
              <button
                onClick={() => setShowAchievements(false)}
                className={`rounded-lg p-2 ${styles.hover}`}
                aria-label={language === 'ar' ? 'إغلاق الإنجازات' : 'Close achievements'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {achievementsList.map((a) => {
                const unlocked = userProgress.achievements.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className={`rounded-lg border p-3 text-center transition ${
                      unlocked
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent'
                        : styles.border
                    }`}
                  >
                    <div className="mb-1 text-2xl">{a.icon}</div>
                    <div className="text-xs font-semibold">{a.name}</div>
                    <div className="mt-1 text-[10px] opacity-80">{a.description}</div>
                    <div className="mt-1 text-[10px] opacity-80">+{a.points} XP</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant - Available in app view */}
      {currentView === 'app' && (
        <AIAssistant
          currentStage={currentStage}
          language={language}
          theme={theme}
          context={aiContext}
          onSuggestionApply={handleAISuggestionApply}
          onContextUpdate={setAiContext}
        />
      )}

      {/* Journey Automation Manager - Available in app view and when enabled */}
      {currentView === 'app' && automationEnabled && (
        <AutomationManager
          userId={`user-${Date.now()}`} // In real app, use actual user ID
          currentStage={currentStage}
          language={language}
          theme={theme}
          userProgress={userProgress}
          onStageChange={(stage) => setCurrentStage(stage)}
          onNotification={(notification) => {
            if (notification.type === 'ai_assistance') {
              // Trigger AI assistant with specific message
              setAiContext(prev => ({
                ...prev,
                conversationHistory: [...(prev.conversationHistory || []), {
                  stage: 'automation',
                  input: notification.message,
                  output: '',
                  timestamp: new Date().toISOString()
                }]
              }));
            } else {
              // Regular notification
              addNotification(notification.message, 'info');
            }
          }}
        />
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`animate-slide-in-right ${styles.surface} flex items-center gap-2 rounded-lg border ${styles.border} p-3 shadow-lg`}
          >
            {n.type === 'success' && <Check className="h-5 w-5 text-green-500" />}
            {n.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
            {n.type === 'info' && <Bell className="h-5 w-5 text-blue-500" />}
            <span className="text-sm">{n.message}</span>
          </div>
        ))}
      </div>

      {/* Notification Control - Show if automation is enabled and user gets frequent notifications */}
      {currentView === 'app' && automationEnabled && notifications.length > 3 && (
        <NotificationControl
          language={language}
          theme={theme}
          onDisableAutomation={() => {
            setAutomationEnabled(false);
            addNotification(
              language === 'ar'
                ? 'تم تعطيل إشعارات الأتمتة مؤقتاً'
                : 'Automation notifications disabled temporarily',
              'info'
            );
          }}
        />
      )}
    </div>
  );
}

export default App;
