import {
    BarChart3,
    CheckCircle,
    PlayCircle,
    Settings,
    Target,
    Users,
    Zap
} from 'lucide-react';
import { useState } from 'react';
import AutomationDemo from './AutomationDemo';

interface SettingsPageProps {
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  onLanguageChange: (lang: 'en' | 'ar') => void;
  onThemeToggle: () => void;
  userProgress: any;
}

export default function SettingsPage({
  language,
  theme,
  onLanguageChange,
  onThemeToggle,
  userProgress
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('automation');
  const [automationSettings, setAutomationSettings] = useState({
    enableExitIntent: true,
    enableSmartSuggestions: true,
    enableMilestoneCelebrations: true,
    enablePersonalization: true,
    notificationFrequency: 'balanced',
    aiAssistanceLevel: 'adaptive'
  });

  const isRTL = language === 'ar';

  const styles = {
    surface: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  };

  const t = (key: string): string => {
    const translations = {
      en: {
        settingsTitle: '⚙️ Innovation Platform Settings',
        automationTab: 'Journey Automation',
        analyticsTab: 'User Analytics',
        preferencesTab: 'Preferences',
        demoTab: 'Live Demo',

        // Automation Settings
        automationTitle: 'Smart Journey Automation',
        automationDesc: 'Customize how AI assists users throughout their innovation journey',
        exitIntentTitle: 'Exit Intent Prevention',
        exitIntentDesc: 'Show personalized value propositions when users try to leave',
        smartSuggestionsTitle: 'AI-Powered Suggestions',
        smartSuggestionsDesc: 'Contextual recommendations based on user behavior',
        milestonesTitle: 'Milestone Celebrations',
        milestonesDesc: 'Celebrate achievements to boost engagement',
        personalizationTitle: 'Content Personalization',
        personalizationDesc: 'Adapt content based on industry and preferences',

        notificationFreq: 'Notification Frequency',
        aiAssistance: 'AI Assistance Level',

        'freqOptions.minimal': 'Minimal - Only critical notifications',
        'freqOptions.balanced': 'Balanced - Smart timing',
        'freqOptions.frequent': 'Frequent - Maximum engagement',

        'aiLevels.basic': 'Basic - Simple suggestions',
        'aiLevels.adaptive': 'Adaptive - Learns from behavior',
        'aiLevels.proactive': 'Proactive - Anticipates needs',

        // Analytics
        analyticsTitle: 'User Journey Analytics',
        analyticsDesc: 'Insights into how automation impacts user success',
        conversionRate: 'Conversion Rate',
        engagementBoost: 'Engagement Boost',
        completionRate: 'Journey Completion',
        retentionRate: 'User Retention',

        // Preferences
        preferencesTitle: 'Personal Preferences',
        preferencesDesc: 'Customize your innovation platform experience',
        languageLabel: 'Language / اللغة',
        themeLabel: 'Theme',
        industryLabel: 'Industry Focus',
        complexityLabel: 'Content Complexity',

        save: 'Save Changes',
        reset: 'Reset to Defaults'
      },
      ar: {
        settingsTitle: '⚙️ إعدادات منصة الابتكار',
        automationTab: 'أتمتة الرحلة',
        analyticsTab: 'تحليلات المستخدم',
        preferencesTab: 'التفضيلات',
        demoTab: 'عرض توضيحي',

        // Automation Settings
        automationTitle: 'أتمتة الرحلة الذكية',
        automationDesc: 'تخصيص كيفية مساعدة الذكاء الاصطناعي للمستخدمين عبر رحلة الابتكار',
        exitIntentTitle: 'منع نية المغادرة',
        exitIntentDesc: 'عرض قيم مخصصة عندما يحاول المستخدمون المغادرة',
        smartSuggestionsTitle: 'اقتراحات ذكية مدعومة بالذكاء الاصطناعي',
        smartSuggestionsDesc: 'توصيات سياقية بناءً على سلوك المستخدم',
        milestonesTitle: 'احتفال بالإنجازات',
        milestonesDesc: 'الاحتفال بالإنجازات لتعزيز التفاعل',
        personalizationTitle: 'تخصيص المحتوى',
        personalizationDesc: 'تكييف المحتوى بناءً على الصناعة والتفضيلات',

        notificationFreq: 'تكرار الإشعارات',
        aiAssistance: 'مستوى المساعدة الذكية',

        'freqOptions.minimal': 'الحد الأدنى - الإشعارات الحرجة فقط',
        'freqOptions.balanced': 'متوازن - توقيت ذكي',
        'freqOptions.frequent': 'متكرر - أقصى تفاعل',

        'aiLevels.basic': 'أساسي - اقتراحات بسيطة',
        'aiLevels.adaptive': 'تكيفي - يتعلم من السلوك',
        'aiLevels.proactive': 'استباقي - يتوقع الاحتياجات',

        // Analytics
        analyticsTitle: 'تحليلات رحلة المستخدم',
        analyticsDesc: 'رؤى حول كيفية تأثير الأتمتة على نجاح المستخدم',
        conversionRate: 'معدل التحويل',
        engagementBoost: 'تعزيز التفاعل',
        completionRate: 'إتمام الرحلة',
        retentionRate: 'الاحتفاظ بالمستخدمين',

        // Preferences
        preferencesTitle: 'التفضيلات الشخصية',
        preferencesDesc: 'تخصيص تجربة منصة الابتكار الخاصة بك',
        languageLabel: 'Language / اللغة',
        themeLabel: 'النمط',
        industryLabel: 'تركيز الصناعة',
        complexityLabel: 'تعقيد المحتوى',

        save: 'حفظ التغييرات',
        reset: 'إعادة تعيين للافتراضي'
      }
    };
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const tabs = [
    { id: 'automation', label: t('automationTab'), icon: Zap },
    { id: 'analytics', label: t('analyticsTab'), icon: BarChart3 },
    { id: 'preferences', label: t('preferencesTab'), icon: Settings },
    { id: 'demo', label: t('demoTab'), icon: PlayCircle }
  ];

  const analyticsData = {
    conversionRate: 78, // +23% from automation
    engagementBoost: 45, // +45% from baseline
    completionRate: 67, // +31% journey completion
    retentionRate: 82 // +28% user retention
  };

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Media', 'Government', 'Non-profit', 'Other'
  ];

  const handleAutomationChange = (setting: string, value: any) => {
    setAutomationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const renderAutomationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold ${styles.text} mb-2`}>
          {t('automationTitle')}
        </h3>
        <p className={`text-sm ${styles.textMuted} mb-6`}>
          {t('automationDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toggle Settings */}
        {[
          { key: 'enableExitIntent', title: t('exitIntentTitle'), desc: t('exitIntentDesc') },
          { key: 'enableSmartSuggestions', title: t('smartSuggestionsTitle'), desc: t('smartSuggestionsDesc') },
          { key: 'enableMilestoneCelebrations', title: t('milestonesTitle'), desc: t('milestonesDesc') },
          { key: 'enablePersonalization', title: t('personalizationTitle'), desc: t('personalizationDesc') }
        ].map((setting) => (
          <div key={setting.key} className={`border ${styles.border} rounded-lg p-4`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-medium ${styles.text} mb-1`}>{setting.title}</h4>
                <p className={`text-xs ${styles.textMuted}`}>{setting.desc}</p>
              </div>
              <button
                onClick={() => handleAutomationChange(setting.key, !automationSettings[setting.key as keyof typeof automationSettings])}
                className={`ml-3 relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  automationSettings[setting.key as keyof typeof automationSettings]
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    automationSettings[setting.key as keyof typeof automationSettings]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dropdown Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${styles.text} mb-2`}>
            {t('notificationFreq')}
          </label>
          <select
            value={automationSettings.notificationFrequency}
            onChange={(e) => handleAutomationChange('notificationFrequency', e.target.value)}
            className={`w-full p-3 border ${styles.border} rounded-lg ${styles.surface} ${styles.text}`}
            aria-label={t('notificationFreq')}
          >
            <option value="minimal">{t('freqOptions.minimal')}</option>
            <option value="balanced">{t('freqOptions.balanced')}</option>
            <option value="frequent">{t('freqOptions.frequent')}</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.text} mb-2`}>
            {t('aiAssistance')}
          </label>
          <select
            value={automationSettings.aiAssistanceLevel}
            onChange={(e) => handleAutomationChange('aiAssistanceLevel', e.target.value)}
            className={`w-full p-3 border ${styles.border} rounded-lg ${styles.surface} ${styles.text}`}
            aria-label={t('aiAssistance')}
          >
            <option value="basic">{t('aiLevels.basic')}</option>
            <option value="adaptive">{t('aiLevels.adaptive')}</option>
            <option value="proactive">{t('aiLevels.proactive')}</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold ${styles.text} mb-2`}>
          {t('analyticsTitle')}
        </h3>
        <p className={`text-sm ${styles.textMuted} mb-6`}>
          {t('analyticsDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'conversionRate', label: t('conversionRate'), value: analyticsData.conversionRate, icon: Target, change: '+23%' },
          { key: 'engagementBoost', label: t('engagementBoost'), value: analyticsData.engagementBoost, icon: Zap, change: '+45%' },
          { key: 'completionRate', label: t('completionRate'), value: analyticsData.completionRate, icon: CheckCircle, change: '+31%' },
          { key: 'retentionRate', label: t('retentionRate'), value: analyticsData.retentionRate, icon: Users, change: '+28%' }
        ].map((metric) => {
          const IconComponent = metric.icon;
          return (
            <div key={metric.key} className={`${styles.surface} border ${styles.border} rounded-lg p-4`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
                  <IconComponent className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className={`text-2xl font-bold ${styles.text}`}>
                    {metric.value}%
                  </div>
                  <div className="text-xs text-green-500 font-medium">
                    {metric.change}
                  </div>
                </div>
              </div>
              <div className={`text-sm ${styles.textMuted}`}>{metric.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold ${styles.text} mb-2`}>
          {t('preferencesTitle')}
        </h3>
        <p className={`text-sm ${styles.textMuted} mb-6`}>
          {t('preferencesDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${styles.text} mb-2`}>
            {t('languageLabel')}
          </label>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as 'en' | 'ar')}
            className={`w-full p-3 border ${styles.border} rounded-lg ${styles.surface} ${styles.text}`}
            aria-label={t('languageLabel')}
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.text} mb-2`}>
            {t('themeLabel')}
          </label>
          <button
            onClick={onThemeToggle}
            className={`w-full p-3 border ${styles.border} rounded-lg ${styles.surface} ${styles.text} text-left ${styles.hover} transition`}
          >
            {theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.text} mb-2`}>
            {t('industryLabel')}
          </label>
          <select
            className={`w-full p-3 border ${styles.border} rounded-lg ${styles.surface} ${styles.text}`}
            aria-label={t('industryLabel')}
          >
            {industries.map(industry => (
              <option key={industry} value={industry.toLowerCase()}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${styles.text} mb-2`}>
            {t('complexityLabel')}
          </label>
          <select
            className={`w-full p-3 border ${styles.border} rounded-lg ${styles.surface} ${styles.text}`}
            aria-label={t('complexityLabel')}
          >
            <option value="simple">Simple</option>
            <option value="moderate">Moderate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${styles.surface} min-h-screen`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${styles.text} mb-2`}>
            {t('settingsTitle')}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : `${styles.hover} ${styles.text}`
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className={`${styles.surface} border ${styles.border} rounded-xl p-6`}>
          {activeTab === 'automation' && renderAutomationSettings()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'preferences' && renderPreferences()}
          {activeTab === 'demo' && (
            <AutomationDemo
              language={language}
              theme={theme}
              onDemoAction={(action) => {
                console.log('Demo action:', action);
              }}
            />
          )}
        </div>

        {/* Action Buttons */}
        {activeTab !== 'demo' && (
          <div className="flex items-center gap-4 mt-6">
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition">
              {t('save')}
            </button>
            <button className={`border ${styles.border} px-6 py-3 rounded-lg ${styles.hover} transition`}>
              {t('reset')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
