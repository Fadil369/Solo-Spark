import {
    Activity,
    Brain,
    Heart,
    Pause,
    Play,
    Rocket,
    RotateCcw,
    Star,
    Target,
    TrendingUp,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import JourneyAutomationService from '../services/journeyAutomation';

interface AutomationDemoProps {
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  onDemoAction?: (action: string) => void;
}

export default function AutomationDemo({
  language,
  theme,
  onDemoAction
}: AutomationDemoProps) {
  const [automationService] = useState(() => new JourneyAutomationService());
  const [isRunning, setIsRunning] = useState(false);
  const [demoEvents, setDemoEvents] = useState<any[]>([]);
  const [demoStep, setDemoStep] = useState(0);
  const [userProfile, setUserProfile] = useState({
    stage: 'awareness',
    engagementScore: 45,
    riskLevel: 'medium',
    preferences: {
      language,
      industry: 'technology'
    }
  });

  const isRTL = language === 'ar';

  const styles = {
    surface: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  };

  const t = (key: string) => {
    const translations = {
      en: {
        demoTitle: '🚀 Journey Automation Demo',
        demoDescription: 'See how AI automation enhances user experience throughout the innovation journey',
        startDemo: 'Start Demo',
        pauseDemo: 'Pause Demo',
        resetDemo: 'Reset Demo',
        currentStage: 'Current Stage',
        automationEvents: 'Automation Events',
        userInsights: 'User Insights',
        engagementScore: 'Engagement Score',
        riskLevel: 'Churn Risk',
        nextAction: 'Next Best Action',
        demoSteps: [
          '👀 User lands on innovation platform',
          '🎯 Exit intent detected - showing value proposition',
          '🚀 User starts trial - onboarding begins',
          '💡 Feature discovery automation kicks in',
          '🏆 Milestone celebration triggers',
          '📈 Engagement score improves',
          '❤️ User becomes advocate - success!'
        ]
      },
      ar: {
        demoTitle: '🚀 عرض توضيحي للأتمتة الذكية',
        demoDescription: 'شاهد كيف تعزز الأتمتة الذكية تجربة المستخدم عبر رحلة الابتكار',
        startDemo: 'بدء العرض',
        pauseDemo: 'إيقاف مؤقت',
        resetDemo: 'إعادة تعيين',
        currentStage: 'المرحلة الحالية',
        automationEvents: 'أحداث الأتمتة',
        userInsights: 'رؤى المستخدم',
        engagementScore: 'نقاط التفاعل',
        riskLevel: 'مخاطر التوقف',
        nextAction: 'الإجراء التالي المقترح',
        demoSteps: [
          '👀 وصول المستخدم لمنصة الابتكار',
          '🎯 اكتشاف نية المغادرة - عرض القيمة',
          '🚀 بدء التجربة - بداية التهيئة',
          '💡 تفعيل اكتشاف الميزات الذكي',
          '🏆 تفعيل احتفال بالإنجازات',
          '📈 تحسن نقاط التفاعل',
          '❤️ تحول المستخدم لداعم - نجاح!'
        ]
      }
    };
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const demoStages = [
    { stage: 'awareness', score: 25, risk: 'high', icon: Brain, color: 'text-blue-500' },
    { stage: 'consideration', score: 45, risk: 'medium', icon: Target, color: 'text-yellow-500' },
    { stage: 'decision', score: 65, risk: 'medium', icon: TrendingUp, color: 'text-orange-500' },
    { stage: 'onboarding', score: 75, risk: 'low', icon: Rocket, color: 'text-green-500' },
    { stage: 'adoption', score: 85, risk: 'low', icon: Heart, color: 'text-purple-500' },
    { stage: 'retention', score: 90, risk: 'low', icon: Users, color: 'text-green-600' },
    { stage: 'advocacy', score: 95, risk: 'low', icon: Star, color: 'text-gold' }
  ];

  const simulateAutomationEvent = (step: number) => {
    const events = [
      {
        trigger: 'page_view',
        action: 'Welcome message with personalized industry insights',
        impact: 'Increased engagement by 15%'
      },
      {
        trigger: 'exit_intent',
        action: 'Show value proposition modal with trial offer',
        impact: 'Prevented 60% of exits'
      },
      {
        trigger: 'trial_start',
        action: 'Personalized onboarding flow based on industry',
        impact: 'Improved completion rate by 40%'
      },
      {
        trigger: 'feature_discovery',
        action: 'Smart tooltips for relevant AI features',
        impact: 'Feature adoption increased by 25%'
      },
      {
        trigger: 'milestone_reached',
        action: 'Celebration animation + next challenge suggestion',
        impact: 'Session time increased by 30%'
      },
      {
        trigger: 'engagement_increase',
        action: 'Unlock advanced features + community invitation',
        impact: 'User satisfaction up 35%'
      },
      {
        trigger: 'advocacy_achieved',
        action: 'Referral program invitation + case study request',
        impact: 'Generated 3x more referrals'
      }
    ];

    if (step < events.length) {
      const event = events[step];
      const newEvent = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...event
      };

      setDemoEvents(prev => [newEvent, ...prev.slice(0, 4)]);

      // Update user profile
      if (step < demoStages.length) {
        const stageData = demoStages[step];
        setUserProfile(prev => ({
          ...prev,
          stage: stageData.stage,
          engagementScore: stageData.score,
          riskLevel: stageData.risk
        }));
      }

      // Trigger automation action if callback provided
      if (onDemoAction) {
        onDemoAction(event.action);
      }
    }
  };

  useEffect(() => {
    let interval: number;

    if (isRunning && demoStep < 7) {
      interval = window.setInterval(() => {
        simulateAutomationEvent(demoStep);
        setDemoStep(prev => prev + 1);
      }, 2000);
    } else if (demoStep >= 7) {
      setIsRunning(false);
    }

    return () => window.clearInterval(interval);
  }, [isRunning, demoStep]);

  const startDemo = () => {
    setIsRunning(true);
    if (demoStep >= 7) {
      resetDemo();
    }
  };

  const pauseDemo = () => {
    setIsRunning(false);
  };

  const resetDemo = () => {
    setIsRunning(false);
    setDemoStep(0);
    setDemoEvents([]);
    setUserProfile({
      stage: 'awareness',
      engagementScore: 45,
      riskLevel: 'medium',
      preferences: {
        language,
        industry: 'technology'
      }
    });
  };

  const getCurrentStageIcon = () => {
    const currentStageData = demoStages.find(s => s.stage === userProfile.stage);
    return currentStageData ? currentStageData.icon : Brain;
  };

  const getCurrentStageColor = () => {
    const currentStageData = demoStages.find(s => s.stage === userProfile.stage);
    return currentStageData ? currentStageData.color : 'text-blue-500';
  };

  const StageIcon = getCurrentStageIcon();

  return (
    <div className={`${styles.surface} rounded-xl border ${styles.border} p-6`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <h3 className={`text-xl font-bold ${styles.text} mb-2`}>
          {t('demoTitle')}
        </h3>
        <p className={`text-sm ${styles.textMuted} mb-4`}>
          {t('demoDescription')}
        </p>

        {/* Demo Controls */}
        <div className="flex items-center gap-3">
          {!isRunning ? (
            <button
              onClick={startDemo}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition"
            >
              <Play className="h-4 w-4" />
              {t('startDemo')}
            </button>
          ) : (
            <button
              onClick={pauseDemo}
              className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition"
            >
              <Pause className="h-4 w-4" />
              {t('pauseDemo')}
            </button>
          )}

          <button
            onClick={resetDemo}
            className={`flex items-center gap-2 border ${styles.border} px-4 py-2 rounded-lg ${styles.hover} transition`}
          >
            <RotateCcw className="h-4 w-4" />
            {t('resetDemo')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current State */}
        <div className="space-y-4">
          <h4 className={`font-semibold ${styles.text}`}>{t('currentStage')}</h4>

          <div className={`border ${styles.border} rounded-lg p-4`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900`}>
                <StageIcon className={`h-5 w-5 ${getCurrentStageColor()}`} />
              </div>
              <div>
                <div className={`font-medium ${styles.text} capitalize`}>
                  {userProfile.stage}
                </div>
                <div className={`text-xs ${styles.textMuted}`}>
                  Step {demoStep} of 7
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${styles.textMuted}`}>{t('engagementScore')}</span>
                <span className={`font-medium ${
                  userProfile.engagementScore >= 70 ? 'text-green-500' :
                  userProfile.engagementScore >= 40 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {userProfile.engagementScore}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-sm ${styles.textMuted}`}>{t('riskLevel')}</span>
                <span className={`font-medium ${
                  userProfile.riskLevel === 'high' ? 'text-red-500' :
                  userProfile.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {userProfile.riskLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Progress */}
        <div className="space-y-4">
          <h4 className={`font-semibold ${styles.text}`}>{t('automationEvents')}</h4>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(t('demoSteps') as string[]).map((step: string, index: number) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                  index <= demoStep - 1
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200 dark:from-green-900 dark:to-emerald-900 dark:border-green-700'
                    : index === demoStep && isRunning
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200 dark:from-blue-900 dark:to-purple-900 dark:border-blue-700 animate-pulse'
                    : styles.border
                } ${styles.border}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index <= demoStep - 1
                    ? 'bg-green-500 text-white'
                    : index === demoStep && isRunning
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`text-sm ${
                  index <= demoStep - 1 ? 'text-green-700 dark:text-green-300' : styles.text
                }`}>
                  {step}
                </span>
                {index === demoStep && isRunning && (
                  <Activity className="h-4 w-4 text-blue-500 animate-spin" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Events */}
      {demoEvents.length > 0 && (
        <div className="mt-6">
          <h4 className={`font-semibold ${styles.text} mb-3`}>Recent Automation Actions</h4>
          <div className="space-y-2">
            {demoEvents.map((event) => (
              <div
                key={event.id}
                className={`border ${styles.border} rounded-lg p-3 ${styles.hover} transition`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${styles.text}`}>{event.action}</div>
                    <div className={`text-xs ${styles.textMuted} mt-1`}>
                      Trigger: {event.trigger} • {event.impact}
                    </div>
                  </div>
                  <div className="text-xs text-green-500 font-medium">
                    ✓ Automated
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
