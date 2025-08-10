import {
    ArrowRight,
    Brain,
    Building,
    CheckCircle,
    CreditCard,
    Globe,
    Rocket,
    Sparkles,
    Star,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { useState } from 'react';

interface LandingPageProps {
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  onGetStarted: () => void;
  onLanguageChange: (lang: 'en' | 'ar') => void;
  onThemeToggle: () => void;
}

interface PricingPlan {
  id: string;
  name: string;
  nameAr: string;
  price: string;
  priceAr: string;
  period: string;
  periodAr: string;
  description: string;
  descriptionAr: string;
  features: string[];
  featuresAr: string[];
  recommended?: boolean;
  cta: string;
  ctaAr: string;
  popular?: boolean;
}

export default function LandingPage({
  language,
  theme,
  onGetStarted,
  onLanguageChange,
  onThemeToggle
}: LandingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'stc_pay' | 'mada'>('stripe');

  const isRTL = language === 'ar';

  const styles = {
    bg: theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50',
    surface: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  };

  const t = (key: string) => {
    const translations = {
      en: {
        // Header
        title: 'BrainSAIT Innovation Lab',
        subtitle: 'AI-Powered Innovation Platform for Saudi Arabia\'s Vision 2030',
        description: 'Transform your ideas into breakthrough innovations with cutting-edge AI assistance. Built for Saudi entrepreneurs, startups, and enterprises.',
        getStarted: 'Start Your Innovation Journey',
        watchDemo: 'Watch Demo',

        // Features Section
        featuresTitle: 'Powered by Advanced AI',
        featuresSubtitle: 'Everything you need to innovate faster and smarter',

        feature1Title: 'AI Idea Generation',
        feature1Desc: 'Generate breakthrough ideas with context-aware AI prompts',

        feature2Title: 'Smart Story Building',
        feature2Desc: 'Craft compelling narratives with AI-powered storytelling',

        feature3Title: 'Automated PRD Creation',
        feature3Desc: 'Transform ideas into professional product requirements',

        feature4Title: 'Rapid Prototyping',
        feature4Desc: 'Build working prototypes with AI-generated code',

        feature5Title: 'User Journey Automation',
        feature5Desc: 'Intelligent guidance throughout your innovation process',

        feature6Title: 'Saudi Market Focus',
        feature6Desc: 'Tailored for Vision 2030 objectives and local market needs',

        // Pricing Section
        pricingTitle: 'Choose Your Innovation Plan',
        pricingSubtitle: 'Flexible pricing designed for Saudi market, supporting Vision 2030 initiatives',

        // Stats Section
        statsTitle: 'Trusted by Saudi Innovators',
        stat1: '10,000+',
        stat1Label: 'Ideas Generated',
        stat2: '5,000+',
        stat2Label: 'Prototypes Built',
        stat3: '2,500+',
        stat3Label: 'Saudi Users',
        stat4: '95%',
        stat4Label: 'Success Rate',

        // Vision 2030 Section
        visionTitle: 'Aligned with Saudi Vision 2030',
        visionSubtitle: 'Supporting the Kingdom\'s transformation into a global innovation hub',
        visionDesc: 'Our platform directly contributes to Vision 2030\'s goals of economic diversification, technological advancement, and human capital development.',

        vision1: 'Economic Diversification',
        vision1Desc: 'Foster new industries and business models',

        vision2: 'Digital Transformation',
        vision2Desc: 'Accelerate adoption of emerging technologies',

        vision3: 'Human Capital Development',
        vision3Desc: 'Empower Saudi talent with cutting-edge tools',

        // Payment Methods
        paymentTitle: 'Secure Payment Options',
        paymentSubtitle: 'Multiple payment methods for your convenience',

        // Footer
        footerTitle: 'Ready to Transform Saudi Arabia\'s Innovation Landscape?',
        footerSubtitle: 'Join thousands of Saudi innovators building the future',

        // Call to Action
        ctaTitle: 'Start Your Free Trial Today',
        ctaSubtitle: 'No credit card required. Cancel anytime.',

        // Navigation
        features: 'Features',
        pricing: 'Pricing',
        about: 'About',
        contact: 'Contact'
      },
      ar: {
        // Header
        title: 'مختبر برين سايت للابتكار',
        subtitle: 'منصة الابتكار المدعومة بالذكاء الاصطناعي لرؤية السعودية 2030',
        description: 'حول أفكارك إلى ابتكارات رائدة مع مساعدة الذكاء الاصطناعي المتقدم. مصممة للرواد والشركات الناشئة والمؤسسات السعودية.',
        getStarted: 'ابدأ رحلة الابتكار',
        watchDemo: 'شاهد العرض التوضيحي',

        // Features Section
        featuresTitle: 'مدعوم بالذكاء الاصطناعي المتقدم',
        featuresSubtitle: 'كل ما تحتاجه للابتكار بشكل أسرع وأذكى',

        feature1Title: 'توليد الأفكار بالذكاء الاصطناعي',
        feature1Desc: 'توليد أفكار مبتكرة مع توجيهات ذكية مدركة للسياق',

        feature2Title: 'بناء القصص الذكي',
        feature2Desc: 'صياغة روايات مقنعة بمساعدة الذكاء الاصطناعي',

        feature3Title: 'إنشاء وثائق المتطلبات التلقائية',
        feature3Desc: 'تحويل الأفكار إلى متطلبات منتجات احترافية',

        feature4Title: 'النماذج الأولية السريعة',
        feature4Desc: 'بناء نماذج عمل مع كود مولد بالذكاء الاصطناعي',

        feature5Title: 'أتمتة رحلة المستخدم',
        feature5Desc: 'إرشاد ذكي عبر عملية الابتكار الخاصة بك',

        feature6Title: 'تركيز على السوق السعودي',
        feature6Desc: 'مصمم خصيصاً لأهداف رؤية 2030 واحتياجات السوق المحلي',

        // Pricing Section
        pricingTitle: 'اختر خطة الابتكار الخاصة بك',
        pricingSubtitle: 'أسعار مرنة مصممة للسوق السعودي، تدعم مبادرات رؤية 2030',

        // Stats Section
        statsTitle: 'موثوق به من قبل المبتكرين السعوديين',
        stat1: '+10,000',
        stat1Label: 'فكرة مولدة',
        stat2: '+5,000',
        stat2Label: 'نموذج أولي',
        stat3: '+2,500',
        stat3Label: 'مستخدم سعودي',
        stat4: '%95',
        stat4Label: 'معدل نجاح',

        // Vision 2030 Section
        visionTitle: 'متوافق مع رؤية السعودية 2030',
        visionSubtitle: 'دعم تحول المملكة إلى مركز ابتكار عالمي',
        visionDesc: 'منصتنا تساهم مباشرة في أهداف رؤية 2030 للتنويع الاقتصادي والتقدم التكنولوجي وتطوير رأس المال البشري.',

        vision1: 'التنويع الاقتصادي',
        vision1Desc: 'تعزيز الصناعات والنماذج التجارية الجديدة',

        vision2: 'التحول الرقمي',
        vision2Desc: 'تسريع تبني التقنيات الناشئة',

        vision3: 'تطوير رأس المال البشري',
        vision3Desc: 'تمكين المواهب السعودية بأدوات متطورة',

        // Payment Methods
        paymentTitle: 'خيارات دفع آمنة',
        paymentSubtitle: 'طرق دفع متعددة لراحتك',

        // Footer
        footerTitle: 'مستعد لتحويل المشهد الابتكاري في السعودية؟',
        footerSubtitle: 'انضم لآلاف المبتكرين السعوديين الذين يبنون المستقبل',

        // Call to Action
        ctaTitle: 'ابدأ تجربتك المجانية اليوم',
        ctaSubtitle: 'لا حاجة لبطاقة ائتمان. ألغ في أي وقت.',

        // Navigation
        features: 'المميزات',
        pricing: 'الأسعار',
        about: 'حول',
        contact: 'اتصل بنا'
      }
    };
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const pricingPlans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      nameAr: 'البادئ',
      price: 'Free',
      priceAr: 'مجاني',
      period: '/month',
      periodAr: '/شهر',
      description: 'Perfect for individual innovators and students',
      descriptionAr: 'مثالي للمبتكرين الأفراد والطلاب',
      features: [
        '5 AI-generated ideas per month',
        'Basic story building tools',
        'Community support',
        'Saudi market insights'
      ],
      featuresAr: [
        '5 أفكار مولدة بالذكاء الاصطناعي شهرياً',
        'أدوات بناء القصص الأساسية',
        'دعم المجتمع',
        'رؤى السوق السعودي'
      ],
      cta: 'Get Started Free',
      ctaAr: 'ابدأ مجاناً'
    },
    {
      id: 'pro',
      name: 'Professional',
      nameAr: 'المحترف',
      price: '299 SAR',
      priceAr: '299 ريال',
      period: '/month',
      periodAr: '/شهر',
      description: 'Ideal for startups and small businesses',
      descriptionAr: 'مثالي للشركات الناشئة والصغيرة',
      features: [
        'Unlimited AI idea generation',
        'Advanced PRD creation',
        'Prototype code generation',
        'Priority support',
        'Vision 2030 alignment tools',
        'Team collaboration (up to 5 members)'
      ],
      featuresAr: [
        'توليد أفكار لامحدود بالذكاء الاصطناعي',
        'إنشاء وثائق متطلبات متقدمة',
        'توليد كود النماذج الأولية',
        'دعم أولوية',
        'أدوات محاذاة رؤية 2030',
        'تعاون الفريق (حتى 5 أعضاء)'
      ],
      recommended: true,
      popular: true,
      cta: 'Start 14-Day Trial',
      ctaAr: 'ابدأ تجربة 14 يوم'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      nameAr: 'المؤسسي',
      price: 'Custom',
      priceAr: 'مخصص',
      period: '/month',
      periodAr: '/شهر',
      description: 'For large organizations and government entities',
      descriptionAr: 'للمؤسسات الكبيرة والجهات الحكومية',
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'Custom AI model training',
        'Dedicated account manager',
        'On-premise deployment',
        'Advanced analytics',
        'Priority Vision 2030 consulting'
      ],
      featuresAr: [
        'كل شيء في المحترف',
        'أعضاء فريق لامحدودين',
        'تدريب نماذج ذكاء اصطناعي مخصصة',
        'مدير حساب مخصص',
        'نشر محلي',
        'تحليلات متقدمة',
        'استشارات رؤية 2030 أولوية'
      ],
      cta: 'Contact Sales',
      ctaAr: 'تواصل مع المبيعات'
    }
  ];

  const paymentMethods = [
    { id: 'stripe', name: 'Credit Card', nameAr: 'بطاقة ائتمان', icon: CreditCard },
    { id: 'stc_pay', name: 'STC Pay', nameAr: 'STC Pay', icon: Building },
    { id: 'mada', name: 'مدى Mada', nameAr: 'مدى', icon: CreditCard },
    { id: 'paypal', name: 'PayPal', nameAr: 'PayPal', icon: CreditCard }
  ];

  const features = [
    {
      icon: Brain,
      title: t('feature1Title'),
      description: t('feature1Desc'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Sparkles,
      title: t('feature2Title'),
      description: t('feature2Desc'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Rocket,
      title: t('feature3Title'),
      description: t('feature3Desc'),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Zap,
      title: t('feature4Title'),
      description: t('feature4Desc'),
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: TrendingUp,
      title: t('feature5Title'),
      description: t('feature5Desc'),
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Star,
      title: t('feature6Title'),
      description: t('feature6Desc'),
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const handlePayment = (planId: string) => {
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const processPayment = () => {
    // In a real app, integrate with payment processors
    console.log('Processing payment:', { selectedPlan, paymentMethod });

    // Simulate payment success
    setTimeout(() => {
      setShowPayment(false);
      onGetStarted();
    }, 2000);
  };

  return (
    <div className={`${styles.bg} min-h-screen`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 ${styles.surface} border-b ${styles.border} bg-opacity-90 backdrop-blur`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧠</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {t('title')}
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className={`${styles.text} hover:text-purple-600 transition`}>
                {t('features')}
              </a>
              <a href="#pricing" className={`${styles.text} hover:text-purple-600 transition`}>
                {t('pricing')}
              </a>
              <a href="#vision" className={`${styles.text} hover:text-purple-600 transition`}>
                {t('about')}
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}
                className={`px-3 py-2 rounded-lg ${styles.hover} flex items-center gap-2`}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm">{language === 'en' ? 'العربية' : 'English'}</span>
              </button>
              <button
                onClick={onThemeToggle}
                className={`p-2 rounded-lg ${styles.hover}`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className={`text-4xl md:text-6xl font-bold ${styles.text} mb-6`}>
            {t('subtitle')}
          </h1>
          <p className={`text-xl ${styles.textMuted} mb-8 max-w-3xl mx-auto`}>
            {t('description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 text-lg font-semibold"
            >
              {t('getStarted')}
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className={`border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900 transition-all duration-200 text-lg font-semibold`}>
              {t('watchDemo')}
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`${styles.surface} border-y ${styles.border} py-16`}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-3xl font-bold ${styles.text} text-center mb-12`}>
            {t('statsTitle')}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { stat: t('stat1'), label: t('stat1Label') },
              { stat: t('stat2'), label: t('stat2Label') },
              { stat: t('stat3'), label: t('stat3Label') },
              { stat: t('stat4'), label: t('stat4Label') }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {item.stat}
                </div>
                <div className={`${styles.textMuted} font-medium`}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className={`text-4xl font-bold ${styles.text} mb-4`}>
            {t('featuresTitle')}
          </h2>
          <p className={`text-xl ${styles.textMuted}`}>
            {t('featuresSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className={`${styles.surface} border ${styles.border} rounded-xl p-6 hover:shadow-xl transition-shadow`}>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-xl font-semibold ${styles.text} mb-2`}>
                  {feature.title}
                </h3>
                <p className={styles.textMuted}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`${styles.surface} border-y ${styles.border} py-20`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold ${styles.text} mb-4`}>
              {t('pricingTitle')}
            </h2>
            <p className={`text-xl ${styles.textMuted}`}>
              {t('pricingSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div key={plan.id} className={`
                ${styles.surface} border rounded-xl p-8 relative
                ${plan.popular ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800' : styles.border}
                hover:shadow-xl transition-shadow
              `}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold ${styles.text} mb-2`}>
                    {language === 'ar' ? plan.nameAr : plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {language === 'ar' ? plan.priceAr : plan.price}
                    </span>
                    <span className={styles.textMuted}>
                      {language === 'ar' ? plan.periodAr : plan.period}
                    </span>
                  </div>
                  <p className={styles.textMuted}>
                    {language === 'ar' ? plan.descriptionAr : plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {(language === 'ar' ? plan.featuresAr : plan.features).map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className={styles.text}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePayment(plan.id)}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105'
                      : `border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900`
                  }`}
                >
                  {language === 'ar' ? plan.ctaAr : plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision 2030 Section */}
      <section id="vision" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className={`text-4xl font-bold ${styles.text} mb-4`}>
            {t('visionTitle')}
          </h2>
          <p className={`text-xl ${styles.textMuted} mb-8`}>
            {t('visionSubtitle')}
          </p>
          <p className={`text-lg ${styles.textMuted} max-w-4xl mx-auto`}>
            {t('visionDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: t('vision1'), desc: t('vision1Desc'), icon: TrendingUp },
            { title: t('vision2'), desc: t('vision2Desc'), icon: Zap },
            { title: t('vision3'), desc: t('vision3Desc'), icon: Users }
          ].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className={`${styles.surface} border ${styles.border} rounded-xl p-6 text-center`}>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className={`text-xl font-semibold ${styles.text} mb-2`}>
                  {item.title}
                </h3>
                <p className={styles.textMuted}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${styles.surface} rounded-xl p-8 max-w-md w-full`}>
            <h3 className={`text-2xl font-bold ${styles.text} mb-6`}>
              {t('paymentTitle')}
            </h3>

            <div className="space-y-4 mb-6">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`w-full p-4 border rounded-lg flex items-center gap-3 transition ${
                      paymentMethod === method.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900'
                        : styles.border
                    }`}
                  >
                    <IconComponent className="h-6 w-6" />
                    <span className={styles.text}>
                      {language === 'ar' ? method.nameAr : method.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowPayment(false)}
                className={`flex-1 py-3 border ${styles.border} rounded-lg ${styles.hover} transition`}
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:scale-105 transition"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className={`${styles.surface} border-t ${styles.border} py-20`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className={`text-4xl font-bold ${styles.text} mb-4`}>
            {t('footerTitle')}
          </h2>
          <p className={`text-xl ${styles.textMuted} mb-8`}>
            {t('footerSubtitle')}
          </p>

          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-4 rounded-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 text-xl font-semibold mx-auto"
          >
            {t('getStarted')}
            <ArrowRight className="h-6 w-6" />
          </button>

          <p className={`${styles.textMuted} mt-4`}>
            {t('ctaSubtitle')}
          </p>
        </div>
      </section>
    </div>
  );
}
