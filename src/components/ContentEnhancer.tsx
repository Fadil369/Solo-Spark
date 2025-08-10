import { AlertCircle, CheckCircle, RotateCcw, Wand2 } from 'lucide-react';
import { useState } from 'react';
import AIService, { ContextMemory } from '../services/aiService';

interface ContentEnhancerProps {
  content: string;
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  context?: ContextMemory;
  onContentUpdate: (newContent: string) => void;
}

type EnhancementType = 'clarity' | 'engagement' | 'technical' | 'persuasive';

interface Enhancement {
  type: EnhancementType;
  original: string;
  improved: string;
  explanation: string;
  confidence: number;
}

export default function ContentEnhancer({
  content,
  language,
  theme,
  context,
  onContentUpdate
}: ContentEnhancerProps) {
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedType, setSelectedType] = useState<EnhancementType>('clarity');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [aiService] = useState(() => new AIService());

  const isRTL = language === 'ar';

  const styles = {
    surface: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  };

  const enhancementTypes = {
    clarity: {
      label: language === 'ar' ? 'الوضوح' : 'Clarity',
      description: language === 'ar' ? 'جعل المحتوى أوضح وأكثر فهماً' : 'Make content clearer and easier to understand',
      color: 'blue',
      icon: '🔍'
    },
    engagement: {
      label: language === 'ar' ? 'التفاعل' : 'Engagement',
      description: language === 'ar' ? 'جعل المحتوى أكثر جاذبية وإثارة' : 'Make content more engaging and compelling',
      color: 'purple',
      icon: '✨'
    },
    technical: {
      label: language === 'ar' ? 'التقني' : 'Technical',
      description: language === 'ar' ? 'تحسين الدقة والتفاصيل التقنية' : 'Improve technical accuracy and detail',
      color: 'green',
      icon: '⚙️'
    },
    persuasive: {
      label: language === 'ar' ? 'الإقناع' : 'Persuasive',
      description: language === 'ar' ? 'جعل المحتوى أكثر إقناعاً ودعوة للعمل' : 'Make content more persuasive and action-oriented',
      color: 'orange',
      icon: '🎯'
    }
  };

  const handleEnhance = async () => {
    if (!content || content.length < 20) return;

    setIsProcessing(true);
    try {
      const response = await aiService.improveContent(content, selectedType, language);

      const enhancement: Enhancement = {
        type: selectedType,
        original: content,
        improved: response.content,
        explanation: language === 'ar'
          ? `تم تحسين المحتوى لزيادة ${enhancementTypes[selectedType].label}`
          : `Content enhanced for better ${enhancementTypes[selectedType].label.toLowerCase()}`,
        confidence: 8
      };

      setEnhancements(prev => [enhancement, ...prev.slice(0, 4)]); // Keep last 5
      setPreviewContent(response.content);
    } catch (error) {
      console.error('Enhancement error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyEnhancement = (enhancement: Enhancement) => {
    onContentUpdate(enhancement.improved);
    setPreviewContent('');
  };

  const handleRevert = () => {
    if (enhancements.length > 0) {
      onContentUpdate(enhancements[0].original);
      setPreviewContent('');
    }
  };

  return (
    <div className={`${styles.surface} rounded-xl border ${styles.border} p-4`}>
      <div className="flex items-center gap-3 mb-4">
        <Wand2 className="h-5 w-5 text-purple-500" />
        <h3 className={`font-semibold ${styles.text}`}>
          {language === 'ar' ? 'محسن المحتوى الذكي' : 'AI Content Enhancer'}
        </h3>
      </div>

      {/* Enhancement Type Selection */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {(Object.keys(enhancementTypes) as EnhancementType[]).map((type) => {
          const config = enhancementTypes[type];
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? `border-${config.color}-500 bg-${config.color}-50 dark:bg-${config.color}-900/20`
                  : `${styles.border} ${styles.hover}`
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{config.icon}</span>
                <span className={`font-medium text-sm ${styles.text}`}>
                  {config.label}
                </span>
              </div>
              <p className={`text-xs ${styles.textMuted}`} dir={isRTL ? 'rtl' : 'ltr'}>
                {config.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleEnhance}
          disabled={isProcessing || !content || content.length < 20}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {language === 'ar' ? 'جاري التحسين...' : 'Enhancing...'}
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              {language === 'ar' ? 'تحسين المحتوى' : 'Enhance Content'}
            </>
          )}
        </button>

        {enhancements.length > 0 && (
          <button
            onClick={handleRevert}
            className="flex items-center gap-2 border border-gray-300 text-gray-600 py-2 px-4 rounded-lg transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RotateCcw className="h-4 w-4" />
            {language === 'ar' ? 'تراجع' : 'Revert'}
          </button>
        )}
      </div>

      {/* Preview */}
      {previewContent && (
        <div className="mb-4">
          <h4 className={`font-medium mb-2 ${styles.text}`}>
            {language === 'ar' ? 'معاينة المحتوى المحسن' : 'Enhanced Content Preview'}
          </h4>
          <div className={`relative rounded-lg border-2 border-dashed border-green-300 p-4 ${styles.surface}`}>
            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div
              className={`prose max-w-none dark:prose-invert text-sm ${styles.text}`}
              dir={isRTL ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={{ __html: previewContent.replace(/\n/g, '<br>') }}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleApplyEnhancement({
                  type: selectedType,
                  original: content,
                  improved: previewContent,
                  explanation: '',
                  confidence: 8
                })}
                className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition"
              >
                {language === 'ar' ? 'تطبيق التحسين' : 'Apply Enhancement'}
              </button>
              <button
                onClick={() => setPreviewContent('')}
                className="border border-gray-300 text-gray-600 px-3 py-1 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhancement History */}
      {enhancements.length > 0 && (
        <div>
          <h4 className={`font-medium mb-2 ${styles.text}`}>
            {language === 'ar' ? 'سجل التحسينات' : 'Enhancement History'}
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {enhancements.map((enhancement, index) => {
              const config = enhancementTypes[enhancement.type];

              return (
                <div
                  key={index}
                  className={`rounded-lg border p-3 ${styles.border} ${styles.surface}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{config.icon}</span>
                    <span className={`font-medium text-sm ${styles.text}`}>
                      {config.label}
                    </span>
                    <span className={`text-xs ${styles.textMuted}`}>
                      {language === 'ar' ? 'ثقة' : 'Confidence'}: {enhancement.confidence}/10
                    </span>
                  </div>
                  <p className={`text-xs ${styles.textMuted} mb-2`} dir={isRTL ? 'rtl' : 'ltr'}>
                    {enhancement.explanation}
                  </p>
                  <button
                    onClick={() => handleApplyEnhancement(enhancement)}
                    className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded transition hover:scale-105"
                  >
                    {language === 'ar' ? 'تطبيق' : 'Apply'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className={`mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800`}>
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className={`font-medium text-blue-700 dark:text-blue-300 mb-1`}>
              {language === 'ar' ? 'نصائح للحصول على أفضل النتائج:' : 'Tips for best results:'}
            </p>
            <ul className={`text-blue-600 dark:text-blue-400 text-xs space-y-1`} dir={isRTL ? 'rtl' : 'ltr'}>
              <li>• {language === 'ar' ? 'قدم محتوى بطول 20 كلمة على الأقل' : 'Provide content with at least 20 words'}</li>
              <li>• {language === 'ar' ? 'اختر نوع التحسين المناسب لهدفك' : 'Choose the enhancement type that matches your goal'}</li>
              <li>• {language === 'ar' ? 'راجع المعاينة قبل التطبيق' : 'Review the preview before applying'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
