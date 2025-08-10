import {
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  Check,
  ChevronRight,
  CreditCard,
  FileText,
  Languages,
  Lightbulb,
  Mail,
  PauseCircle,
  Phone,
  PlayCircle,
  Presentation,
  Rocket,
  RotateCcw,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface LandingPageProps {
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  onLanguageChange: (lang: 'en' | 'ar') => void;
  onThemeChange: () => void;
  onGetStarted: () => void;
}

const translations = {
  en: {
    // Header
    title: 'BRAINSAIT برينسايت',
    subtitle: 'من الافكار الى الابتكار',
    tagline: 'Transform Your Ideas into Reality with Saudi Vision 2030',

    // Product Names
    stage1Product: 'Solo-Prototype نموذجي',
    stage2Product: 'Solo-UltimatePro مثالي',
    getStarted: 'Get Started',
    contact: 'Contact',

    // Hero Section
    heroTitle: 'From Idea to Product',
    heroSubtitle: 'In Minutes, Not Months',
    heroDescription: 'Experience the future of product development with our AI-powered suite. Turn your innovative ideas into professional Product Requirements Documents effortlessly.',
    watchDemo: 'Watch Demo',
    startFree: 'Start Free Trial',

    // Interactive Demo Section
    demoTitle: 'See Our Innovation Process in Action',
    demoSubtitle: 'Experience the 4-stage journey that transforms ideas into products',
    demoStage1: 'Idea Spark',
    demoStage2: 'Story Builder',
    demoStage3: 'PRD Architect',
    demoStage4: 'Market Ready',
    demoStage1Desc: 'AI helps generate and refine your innovative ideas with market insights',
    demoStage2Desc: 'Transform ideas into compelling user stories with persona mapping',
    demoStage3Desc: 'Create professional Product Requirements Documents with templates',
    demoStage4Desc: 'Finalize with market analysis, competitive research, and launch strategy',
    playDemo: 'Play Demo',
    pauseDemo: 'Pause Demo',
    restartDemo: 'Restart Demo',
    currentStage: 'Current Stage',

    // Vision 2030 Section
    vision2030Title: 'Aligned with Saudi Vision 2030',
    vision2030Subtitle: 'Empowering Innovation & Entrepreneurship',
    innovation: 'Innovation Hub',
    innovationDesc: 'Supporting the transformation into a knowledge-based economy',
    entrepreneurship: 'Entrepreneurship',
    entrepreneurshipDesc: 'Fostering startup culture and business innovation',
    technology: 'Technology Advancement',
    technologyDesc: 'Leveraging AI and digital transformation',

    // Pricing
    pricingTitle: 'Simple, Transparent Pricing',
    pricingSubtitle: 'Choose the perfect plan for your innovation journey',

    starterTitle: 'Starter',
    starterPrice: '49',
    starterDesc: 'Perfect for individual innovators and students',

    professionalTitle: 'Professional',
    professionalPrice: '149',
    professionalDesc: 'Ideal for freelancers and small teams',

    teamTitle: 'Team',
    teamPrice: '299',
    teamDesc: 'Built for growing teams and small companies',

    enterpriseTitle: 'Enterprise',
    enterprisePrice: 'Custom',
    enterpriseDesc: 'Advanced features for large organizations',

    monthlyBilling: 'Monthly',
    yearlyBilling: 'Yearly (Save 25%)',
    choosePlan: 'Choose Plan',
    mostPopular: 'Most Popular',

    // Features
    unlimitedIdeas: 'Unlimited Ideas',
    basicPRDs: '5 PRDs per month',
    emailSupport: 'Email Support',
    advancedAI: 'Advanced AI Features',
    prioritySupport: 'Priority Support',
    teamCollaboration: 'Team Collaboration',
    customTemplates: 'Custom Templates',
    apiAccess: 'API Access',
    dedicatedManager: 'Dedicated Account Manager',
    customIntegrations: 'Custom Integrations',
    slaSupport: '24/7 SLA Support',
    unlimitedPRDs: 'Unlimited PRDs',
    basicAI: 'Basic AI Assistant',
    advancedTemplates: 'Advanced Templates',
    analytics: 'Analytics Dashboard',
    whitelabel: 'White-label Options',

    // Payment Methods
    paymentTitle: 'Payment Methods',
    paymentSubtitle: 'We support all major Saudi payment methods',

    // ROI Section
    roiTitle: 'Proven ROI for Saudi Businesses',
    roiSubtitle: 'Join hundreds of Saudi innovators accelerating their product development',
    timeToMarket: 'Time to Market',
    timeToMarketDesc: '75% faster product development cycle',
    costReduction: 'Cost Reduction',
    costReductionDesc: '60% reduction in documentation costs',
    successRate: 'Success Rate',
    successRateDesc: '90% of projects reach market successfully',

        // Stage 2 Course
    stage2Title: 'Ready for Stage 2?',
    stage2Subtitle: 'Solo-UltimatePro مثالي',
    stage2Course: 'From Prototype to Profit: The Ultimate Solo Entrepreneur Intensive',
    stage2Duration: '3 Days Intensive Course',
    stage2Hours: '72 Hours Total (24h Learning + 48h Implementation)',
    stage2Target: 'For graduates of BrainSAIT Stage 1 with working prototypes',
    stage2Outcome: 'Launch your live, monetizable digital product with first customers',
    stage2Features: 'Advanced Monetization Strategies',
    stage2Marketing: 'Customer Acquisition Systems',
    stage2Scaling: 'Growth & Scaling Frameworks',
    stage2Support: '1-on-1 Mentorship Sessions',
    learnMore: 'Learn More',
    comingSoon: 'Coming Soon',

    // Footer
    footerTitle: 'Ready to Transform Your Ideas?',
    footerSubtitle: 'Join the innovation revolution powered by Saudi Vision 2030',

    // Contact
    contactUs: 'Contact Us',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    riyadhAddress: 'Riyadh, Saudi Arabia'
  },
  ar: {
    // Header
    title: 'BRAINSAIT برينسايت',
    subtitle: 'من الافكار الى الابتكار',
    tagline: 'حول أفكارك إلى واقع مع رؤية السعودية 2030',

    // Product Names
    stage1Product: 'Solo-Prototype نموذجي',
    stage2Product: 'Solo-UltimatePro مثالي',
    getStarted: 'ابدأ الآن',
    contact: 'تواصل معنا',

    // Hero Section
    heroTitle: 'من الفكرة إلى المنتج',
    heroSubtitle: 'في دقائق، وليس شهور',
    heroDescription: 'اكتشف مستقبل تطوير المنتجات مع مجموعة أدواتنا المدعومة بالذكاء الاصطناعي. حول أفكارك المبتكرة إلى وثائق متطلبات منتج احترافية بسهولة.',
    watchDemo: 'شاهد العرض التوضيحي',
    startFree: 'ابدأ تجربة مجانية',

    // Interactive Demo Section
    demoTitle: 'شاهد عملية الابتكار في العمل',
    demoSubtitle: 'اختبر الرحلة المكونة من 4 مراحل التي تحول الأفكار إلى منتجات',
    demoStage1: 'شرارة الفكرة',
    demoStage2: 'بناء القصة',
    demoStage3: 'مهندس PRD',
    demoStage4: 'جاهز للسوق',
    demoStage1Desc: 'الذكاء الاصطناعي يساعد في توليد وتطوير أفكارك المبتكرة مع رؤى السوق',
    demoStage2Desc: 'تحويل الأفكار إلى قصص مستخدمين مقنعة مع رسم الشخصيات',
    demoStage3Desc: 'إنشاء وثائق متطلبات منتج احترافية مع القوالب',
    demoStage4Desc: 'الانتهاء مع تحليل السوق والبحث التنافسي واستراتيجية الإطلاق',
    playDemo: 'تشغيل العرض',
    pauseDemo: 'إيقاف مؤقت',
    restartDemo: 'إعادة تشغيل',
    currentStage: 'المرحلة الحالية',

    // Vision 2030 Section
    vision2030Title: 'متوافق مع رؤية السعودية 2030',
    vision2030Subtitle: 'تمكين الابتكار وريادة الأعمال',
    innovation: 'مركز الابتكار',
    innovationDesc: 'دعم التحول إلى اقتصاد قائم على المعرفة',
    entrepreneurship: 'ريادة الأعمال',
    entrepreneurshipDesc: 'تعزيز ثقافة الشركات الناشئة والابتكار التجاري',
    technology: 'التقدم التكنولوجي',
    technologyDesc: 'الاستفادة من الذكاء الاصطناعي والتحول الرقمي',

    // Pricing
    pricingTitle: 'تسعير بسيط وشفاف',
    pricingSubtitle: 'اختر الخطة المثالية لرحلة الابتكار الخاصة بك',

    starterTitle: 'المبتدئ',
    starterPrice: '49',
    starterDesc: 'مثالي للمبتكرين الأفراد والطلاب',

    professionalTitle: 'المحترف',
    professionalPrice: '149',
    professionalDesc: 'مثالي للمستقلين والفرق الصغيرة',

    teamTitle: 'الفريق',
    teamPrice: '299',
    teamDesc: 'مصمم للفرق النامية والشركات الصغيرة',

    enterpriseTitle: 'المؤسسة',
    enterprisePrice: 'مخصص',
    enterpriseDesc: 'ميزات متقدمة للمؤسسات الكبيرة',

    monthlyBilling: 'شهري',
    yearlyBilling: 'سنوي (وفر 25%)',
    choosePlan: 'اختر الخطة',
    mostPopular: 'الأكثر شيوعاً',

    // Features
    unlimitedIdeas: 'أفكار غير محدودة',
    basicPRDs: '5 وثائق PRD شهرياً',
    emailSupport: 'دعم البريد الإلكتروني',
    advancedAI: 'ميزات الذكاء الاصطناعي المتقدمة',
    prioritySupport: 'دعم أولوية',
    teamCollaboration: 'تعاون الفريق',
    customTemplates: 'قوالب مخصصة',
    apiAccess: 'وصول API',
    dedicatedManager: 'مدير حساب مخصص',
    customIntegrations: 'تكاملات مخصصة',
    slaSupport: 'دعم SLA على مدار الساعة',
    unlimitedPRDs: 'وثائق PRD غير محدودة',
    basicAI: 'مساعد ذكي أساسي',
    advancedTemplates: 'قوالب متقدمة',
    analytics: 'لوحة تحليلات',
    whitelabel: 'خيارات العلامة البيضاء',

    // Payment Methods
    paymentTitle: 'طرق الدفع',
    paymentSubtitle: 'ندعم جميع طرق الدفع السعودية الرئيسية',

    // ROI Section
    roiTitle: 'عائد استثمار مثبت للشركات السعودية',
    roiSubtitle: 'انضم إلى مئات المبتكرين السعوديين الذين يسرعون تطوير منتجاتهم',
    timeToMarket: 'الوقت للوصول للسوق',
    timeToMarketDesc: 'دورة تطوير منتج أسرع بنسبة 75%',
    costReduction: 'تقليل التكاليف',
    costReductionDesc: 'انخفاض 60% في تكاليف التوثيق',
    successRate: 'معدل النجاح',
    successRateDesc: '90% من المشاريع تصل إلى السوق بنجاح',

    // Stage 2 Course
    stage2Title: 'جاهز للمرحلة الثانية؟',
    stage2Subtitle: 'Solo-UltimatePro مثالي',
    stage2Course: 'من النموذج الأولي إلى الربح: برنامج رائد الأعمال الفردي المكثف',
    stage2Duration: 'دورة مكثفة لمدة 3 أيام',
    stage2Hours: '72 ساعة إجمالي (24 ساعة تعلم + 48 ساعة تطبيق)',
    stage2Target: 'لخريجي المرحلة الأولى من BrainSAIT مع نماذج أولية عملية',
    stage2Outcome: 'أطلق منتجك الرقمي القابل للربح مع العملاء الأوائل',
    stage2Features: 'استراتيجيات الربح المتقدمة',
    stage2Marketing: 'أنظمة اكتساب العملاء',
    stage2Scaling: 'أطر النمو والتوسع',
    stage2Support: 'جلسات إرشاد فردية',
    learnMore: 'اعرف المزيد',
    comingSoon: 'قريباً',

    // Footer
    footerTitle: 'جاهز لتحويل أفكارك؟',
    footerSubtitle: 'انضم إلى ثورة الابتكار المدعومة برؤية السعودية 2030',

    // Contact
    contactUs: 'تواصل معنا',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    riyadhAddress: 'الرياض، المملكة العربية السعودية'
  }
};

const LandingPage: React.FC<LandingPageProps> = ({
  language,
  theme,
  onLanguageChange,
  onThemeChange,
  onGetStarted
}) => {
  const [isYearly, setIsYearly] = useState(false);
  const [activeDemo, setActiveDemo] = useState(0);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('stc');
  const [email, setEmail] = useState('');

  const t = translations[language];
  const isRTL = language === 'ar';

  // Auto-advance demo
  useEffect(() => {
    if (!isDemoPlaying) return;

    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, [isDemoPlaying]);

  const demoStages = [
    {
      id: 1,
      title: t.demoStage1,
      description: t.demoStage1Desc,
      icon: Lightbulb,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      features: ['AI Idea Generation', 'Market Validation', 'Trend Analysis']
    },
    {
      id: 2,
      title: t.demoStage2,
      description: t.demoStage2Desc,
      icon: FileText,
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      features: ['User Story Mapping', 'Persona Creation', 'Journey Mapping']
    },
    {
      id: 3,
      title: t.demoStage3,
      description: t.demoStage3Desc,
      icon: BarChart3,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      features: ['Professional Templates', 'Requirement Analysis', 'Technical Specs']
    },
    {
      id: 4,
      title: t.demoStage4,
      description: t.demoStage4Desc,
      icon: Presentation,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      features: ['Market Analysis', 'Competitive Research', 'Launch Strategy']
    }
  ];

  const pricingPlans = [
    {
      name: t.starterTitle,
      price: '185', // 49 USD = ~185 SAR
      description: t.starterDesc,
      features: [t.unlimitedIdeas, t.basicPRDs, t.basicAI, t.emailSupport],
      popular: false,
      highlight: false
    },
    {
      name: t.professionalTitle,
      price: '560', // 149 USD = ~560 SAR
      description: t.professionalDesc,
      features: [t.unlimitedIdeas, t.unlimitedPRDs, t.advancedAI, t.advancedTemplates, t.prioritySupport],
      popular: true,
      highlight: true
    },
    {
      name: t.teamTitle,
      price: '1125', // 299 USD = ~1125 SAR
      description: t.teamDesc,
      features: [t.unlimitedIdeas, t.unlimitedPRDs, t.advancedAI, t.teamCollaboration, t.analytics, t.apiAccess, t.prioritySupport],
      popular: false,
      highlight: false
    },
    {
      name: t.enterpriseTitle,
      price: t.enterprisePrice,
      description: t.enterpriseDesc,
      features: [t.unlimitedIdeas, t.unlimitedPRDs, t.advancedAI, t.teamCollaboration, t.dedicatedManager, t.customIntegrations, t.whitelabel, t.slaSupport],
      popular: false,
      highlight: false
    }
  ];

  const paymentMethods = [
    { id: 'stc', name: 'STC Pay', icon: Phone },
    { id: 'mada', name: 'Mada', icon: CreditCard },
    { id: 'visa', name: 'Visa', icon: CreditCard },
    { id: 'mastercard', name: 'Mastercard', icon: CreditCard }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'} ${isRTL ? 'rtl' : 'ltr'}`}>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex flex-col items-start">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Brain className="h-8 w-8 text-blue-600" />
                  <span className="text-xl font-bold">{t.title}</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t.subtitle}</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
                Pricing
              </a>
              <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
                {t.contact}
              </a>
            </nav>

            {/* Controls */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button
                onClick={onThemeChange}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              <button
                onClick={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}
                className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Change language"
              >
                <Languages className="h-4 w-4" />
                <span className="text-sm font-medium">{language === 'en' ? 'عربي' : 'English'}</span>
              </button>

              <button
                onClick={onGetStarted}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                {t.getStarted}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="absolute bottom-20 left-1/3 w-12 h-12 bg-pink-500 rounded-full animate-ping"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
                {t.stage1Product}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              {t.heroTitle}
            </h1>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-700 dark:text-gray-300">
              {t.heroSubtitle}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t.heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl"
              >
                {t.startFree}
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </button>

              <button
                onClick={() => setIsDemoPlaying(!isDemoPlaying)}
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                {isDemoPlaying ? <PauseCircle className="inline-block mr-2 h-5 w-5" /> : <PlayCircle className="inline-block mr-2 h-5 w-5" />}
                {t.watchDemo}
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">75%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Faster Development</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">2000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Hours Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">90%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-20 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.demoTitle}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t.demoSubtitle}
            </p>
          </div>

          {/* Demo Controls */}
          <div className="flex justify-center items-center mb-12 space-x-4 rtl:space-x-reverse">
            <button
              onClick={() => setIsDemoPlaying(!isDemoPlaying)}
              className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              {isDemoPlaying ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
              <span>{isDemoPlaying ? t.pauseDemo : t.playDemo}</span>
            </button>

            <button
              onClick={() => {
                setActiveDemo(0);
                setIsDemoPlaying(false);
              }}
              className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
              <span>{t.restartDemo}</span>
            </button>
          </div>

          {/* Demo Stages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoStages.map((stage, index) => {
              const IconComponent = stage.icon;
              const isActive = activeDemo === index;

              return (
                <div
                  key={stage.id}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                    isActive
                      ? `border-blue-500 ${stage.bgColor} shadow-2xl scale-105 ring-4 ring-blue-100 dark:ring-blue-900/20`
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-lg'
                  }`}
                  onClick={() => setActiveDemo(index)}
                >
                  {/* Stage Number */}
                  <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {stage.id}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gradient-to-r ${stage.color} shadow-lg`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {stage.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {stage.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {stage.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Progress indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-2xl">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-b-2xl animate-pulse"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Stage Indicator */}
          <div className="text-center mt-8">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t.currentStage}: <span className="font-bold text-blue-600">{demoStages[activeDemo].title}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Vision 2030 Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {t.vision2030Title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t.vision2030Subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <Lightbulb className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t.innovation}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t.innovationDesc}</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <Rocket className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t.entrepreneurship}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t.entrepreneurshipDesc}</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t.technology}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t.technologyDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.pricingTitle}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              {t.pricingSubtitle}
            </p>

            {/* Affordable pricing highlight */}
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full text-sm font-semibold mb-8">
              <Zap className="h-4 w-4 mr-2" />
              25% more affordable than competitors
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
              <span className={`text-sm ${!isYearly ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500'}`}>
                {t.monthlyBilling}
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isYearly ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500'}`}>
                {t.yearlyBilling}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  plan.highlight
                    ? 'border-blue-500 bg-white dark:bg-gray-800 shadow-2xl ring-4 ring-blue-100 dark:ring-blue-900/20 transform scale-105'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    {t.mostPopular}
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-black text-gray-900 dark:text-white">
                      {plan.price === 'Custom' || plan.price === 'مخصص' ? plan.price : `${plan.price} ريال`}
                    </span>
                    {plan.price !== 'Custom' && plan.price !== 'مخصص' && (
                      <span className="text-gray-500 text-lg">
                        /{isYearly ? (language === 'ar' ? 'سنة' : 'year') : (language === 'ar' ? 'شهر' : 'month')}
                      </span>
                    )}
                    {isYearly && plan.price !== 'Custom' && plan.price !== 'مخصص' && (
                      <div className="text-sm text-green-600 font-semibold mt-1">
                        {language === 'ar' ? 'وفر 25%' : 'Save 25%'} • {Math.round(parseInt(plan.price) * 12 * 0.75)} {language === 'ar' ? 'ريال/سنة' : 'SAR/year'}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>

                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={onGetStarted}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg'
                        : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t.choosePlan}
                    {plan.highlight && <ChevronRight className="inline-block ml-2 h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t.paymentTitle}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{t.paymentSubtitle}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <div
                  key={method.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${
                    selectedPayment === method.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedPayment(method.id)}
                >
                  <IconComponent className="h-8 w-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{method.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{t.roiTitle}</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">{t.roiSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-5xl font-black mb-4">75%</div>
              <h3 className="text-2xl font-bold mb-2">{t.timeToMarket}</h3>
              <p className="opacity-90">{t.timeToMarketDesc}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black mb-4">60%</div>
              <h3 className="text-2xl font-bold mb-2">{t.costReduction}</h3>
              <p className="opacity-90">{t.costReductionDesc}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black mb-4">90%</div>
              <h3 className="text-2xl font-bold mb-2">{t.successRate}</h3>
              <p className="opacity-90">{t.successRateDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stage 2 Course Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white relative overflow-hidden">
        {/* Background animation */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-yellow-300 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-pink-300 rounded-full animate-ping"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
              <Rocket className="h-4 w-4 mr-2" />
              {t.comingSoon}
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              {t.stage2Title}
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 opacity-90">
              {t.stage2Subtitle}
            </h3>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              {t.stage2Target}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Course Details */}
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h4 className="text-2xl font-bold mb-6 flex items-center">
                  <Building2 className="h-6 w-6 mr-3 text-yellow-300" />
                  Course Overview
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></div>
                    <span className="text-lg">{t.stage2Duration}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></div>
                    <span className="text-lg">{t.stage2Hours}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></div>
                    <span className="text-lg">{t.stage2Outcome}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h4 className="text-2xl font-bold mb-6 flex items-center">
                  <Zap className="h-6 w-6 mr-3 text-cyan-300" />
                  What You'll Master
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-300 flex-shrink-0" />
                    <span>{t.stage2Features}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-300 flex-shrink-0" />
                    <span>{t.stage2Marketing}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-300 flex-shrink-0" />
                    <span>{t.stage2Scaling}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-300 flex-shrink-0" />
                    <span>{t.stage2Support}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Preview */}
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Brain className="h-12 w-12 text-white" />
                </div>
                <h4 className="text-3xl font-bold mb-2">{t.stage2Subtitle}</h4>
                <p className="text-xl opacity-90 mb-6">{t.stage2Course}</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold">72h</div>
                    <div className="text-sm opacity-80">Intensive</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">1:1</div>
                    <div className="text-sm opacity-80">Mentorship</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">Live</div>
                    <div className="text-sm opacity-80">Product</div>
                  </div>
                </div>

                <button
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl text-lg font-bold hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
                  onClick={() => alert('Stage 2 course details will be available soon!')}
                >
                  {t.learnMore}
                  <ArrowRight className="inline-block ml-2 h-5 w-5" />
                </button>
              </div>

              <p className="text-sm opacity-70">
                * Available for BrainSAIT Stage 1 graduates with validated prototypes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{t.footerTitle}</h3>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">{t.footerSubtitle}</p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`${t.email}...`}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={onGetStarted}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
            >
              {t.getStarted}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <Brain className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">{t.title}</span>
              </div>
              <p className="text-gray-400 mb-4">{t.subtitle}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">{t.contactUs}</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400">info@brainsait.com</span>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400">+966 11 234 5678</span>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Building2 className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400">{t.riyadhAddress}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Links</h4>
              <div className="space-y-2">
                <a href="#demo" className="block text-gray-400 hover:text-white transition-colors">Demo</a>
                <a href="#pricing" className="block text-gray-400 hover:text-white transition-colors">Pricing</a>
                <a href="#contact" className="block text-gray-400 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BrainSAIT Innovation Lab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
