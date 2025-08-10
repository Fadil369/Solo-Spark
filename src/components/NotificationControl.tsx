import { Settings } from 'lucide-react';

interface NotificationControlProps {
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  onDisableAutomation: () => void;
}

export default function NotificationControl({
  language,
  theme,
  onDisableAutomation
}: NotificationControlProps) {
  const isRTL = language === 'ar';

  const styles = {
    surface: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  };

  const t = (key: string) => {
    const translations = {
      en: {
        title: 'Too many notifications?',
        description: 'You can disable automation notifications temporarily',
        disable: 'Disable Notifications',
        settings: 'Automation Settings'
      },
      ar: {
        title: 'إشعارات كثيرة؟',
        description: 'يمكنك تعطيل إشعارات الأتمتة مؤقتاً',
        disable: 'تعطيل الإشعارات',
        settings: 'إعدادات الأتمتة'
      }
    };
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${styles.surface} border ${styles.border} rounded-lg p-4 shadow-lg max-w-sm`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
          <Settings className="h-4 w-4 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${styles.text} mb-1`}>
            {t('title')}
          </h4>
          <p className={`text-xs ${styles.textMuted} mb-3`}>
            {t('description')}
          </p>
          <button
            onClick={onDisableAutomation}
            className="bg-red-600 text-white text-xs px-3 py-1 rounded-full hover:bg-red-700 transition"
          >
            {t('disable')}
          </button>
        </div>
      </div>
    </div>
  );
}
