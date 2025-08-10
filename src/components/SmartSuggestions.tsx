import { CheckCircle, Lightbulb, RefreshCw, Target, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import AIService, { ContextMemory } from '../services/aiService';

interface SmartSuggestionsProps {
  currentStage: number;
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  context: ContextMemory;
  currentContent?: string;
  onApplySuggestion: (suggestion: string, type: 'replace' | 'append' | 'improve') => void;
}

interface Suggestion {
  id: string;
  content: string;
  type: 'improvement' | 'enhancement' | 'alternative' | 'nextStep';
  confidence: number;
  reasoning: string;
}

export default function SmartSuggestions({
  currentStage,
  language,
  theme,
  context,
  currentContent,
  onApplySuggestion
}: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);
  const [aiService] = useState(() => new AIService());

  const isRTL = language === 'ar';

  const styles = {
    surface: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  };

  const suggestionTypes = {
    improvement: {
      icon: TrendingUp,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      label: language === 'ar' ? 'تحسين' : 'Improvement'
    },
    enhancement: {
      icon: Zap,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      label: language === 'ar' ? 'تعزيز' : 'Enhancement'
    },
    alternative: {
      icon: RefreshCw,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      label: language === 'ar' ? 'بديل' : 'Alternative'
    },
    nextStep: {
      icon: Target,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      label: language === 'ar' ? 'الخطوة التالية' : 'Next Step'
    }
  };

  // Generate intelligent suggestions based on current stage and content
  useEffect(() => {
    if (currentContent && currentContent.length > 50) {
      generateSuggestions();
    }
  }, [currentContent, currentStage]);

  const generateSuggestions = async () => {
    if (!currentContent || isLoading) return;

    setIsLoading(true);
    try {
      const stageNames = ['Idea Generation', 'Story Building', 'PRD Creation', 'Prototype Development'];
      const stageName = stageNames[currentStage - 1];

      const prompt = language === 'ar'
        ? `قم بتحليل المحتوى التالي وقدم 3-4 اقتراحات ذكية لتحسينه في مرحلة "${stageName}":

${currentContent}

قدم اقتراحات في الفئات التالية:
1. تحسينات للوضوح والتأثير
2. تعزيزات للمحتوى
3. بدائل إبداعية
4. خطوات تالية مقترحة

لكل اقتراح، قدم:
- نوع الاقتراح (improvement/enhancement/alternative/nextStep)
- المحتوى المقترح
- درجة الثقة (1-10)
- السبب في جملة واحدة

استجب بتنسيق JSON مع هذا الهيكل:
{
  "suggestions": [
    {
      "type": "improvement",
      "content": "المحتوى المقترح",
      "confidence": 8,
      "reasoning": "السبب"
    }
  ]
}`
        : `Analyze the following content and provide 3-4 intelligent suggestions for improving it in the "${stageName}" stage:

${currentContent}

Provide suggestions in these categories:
1. Improvements for clarity and impact
2. Content enhancements
3. Creative alternatives
4. Suggested next steps

For each suggestion, provide:
- Suggestion type (improvement/enhancement/alternative/nextStep)
- The suggested content
- Confidence score (1-10)
- Reasoning in one sentence

Respond in JSON format with this structure:
{
  "suggestions": [
    {
      "type": "improvement",
      "content": "Suggested content",
      "confidence": 8,
      "reasoning": "Reason"
    }
  ]
}`;

      const response = await aiService.callClaude(prompt,
        'You are an expert innovation consultant providing specific, actionable suggestions.',
        context
      );

      try {
        const parsed = JSON.parse(response.content);
        const processedSuggestions: Suggestion[] = parsed.suggestions.map((s: any, index: number) => ({
          id: `suggestion-${Date.now()}-${index}`,
          content: s.content,
          type: s.type,
          confidence: s.confidence,
          reasoning: s.reasoning
        }));

        setSuggestions(processedSuggestions);
      } catch (parseError) {
        // Fallback to manual suggestions if JSON parsing fails
        generateFallbackSuggestions();
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      generateFallbackSuggestions();
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackSuggestions = () => {
    const fallbackSuggestions: Suggestion[] = [
      {
        id: 'fallback-1',
        content: language === 'ar'
          ? 'أضف المزيد من التفاصيل المحددة والأمثلة الملموسة'
          : 'Add more specific details and concrete examples',
        type: 'improvement',
        confidence: 8,
        reasoning: language === 'ar'
          ? 'التفاصيل المحددة تجعل المحتوى أكثر إقناعاً'
          : 'Specific details make content more compelling'
      },
      {
        id: 'fallback-2',
        content: language === 'ar'
          ? 'فكر في استخدام تقنيات السرد لجعل المحتوى أكثر جاذبية'
          : 'Consider using storytelling techniques to make content more engaging',
        type: 'enhancement',
        confidence: 7,
        reasoning: language === 'ar'
          ? 'القصص تزيد من التفاعل والتذكر'
          : 'Stories increase engagement and memorability'
      },
      {
        id: 'fallback-3',
        content: language === 'ar'
          ? 'اختبر هذا المحتوى مع المستخدمين المستهدفين'
          : 'Test this content with target users for feedback',
        type: 'nextStep',
        confidence: 9,
        reasoning: language === 'ar'
          ? 'ردود فعل المستخدمين ضرورية للتحسين'
          : 'User feedback is essential for improvement'
      }
    ];

    setSuggestions(fallbackSuggestions);
  };

  const handleApplySuggestion = (suggestion: Suggestion, applicationType: 'replace' | 'append' | 'improve') => {
    onApplySuggestion(suggestion.content, applicationType);
    setAppliedSuggestions(prev => [...prev, suggestion.id]);
  };

  if (!currentContent || currentContent.length < 50) {
    return null;
  }

  return (
    <div className={`${styles.surface} rounded-xl border ${styles.border} p-4 mt-4`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className={`font-semibold ${styles.text}`}>
            {language === 'ar' ? 'اقتراحات ذكية' : 'Smart Suggestions'}
          </h3>
        </div>
        <button
          onClick={generateSuggestions}
          disabled={isLoading}
          className={`rounded-lg p-2 ${styles.hover} ${isLoading ? 'animate-spin' : ''}`}
          aria-label={language === 'ar' ? 'تحديث الاقتراحات' : 'Refresh suggestions'}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className={`ml-3 ${styles.textMuted}`}>
            {language === 'ar' ? 'جاري إنشاء الاقتراحات...' : 'Generating suggestions...'}
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => {
            const typeConfig = suggestionTypes[suggestion.type];
            const IconComponent = typeConfig.icon;
            const isApplied = appliedSuggestions.includes(suggestion.id);

            return (
              <div
                key={suggestion.id}
                className={`rounded-lg border p-4 transition-all ${
                  isApplied
                    ? 'opacity-60 bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                    : `${typeConfig.bg} ${typeConfig.border}`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 ${typeConfig.color}`}>
                    {isApplied ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeConfig.bg} ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                      <span className={`text-xs ${styles.textMuted}`}>
                        {language === 'ar' ? 'ثقة' : 'Confidence'}: {suggestion.confidence}/10
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${styles.text}`} dir={isRTL ? 'rtl' : 'ltr'}>
                      {suggestion.content}
                    </p>
                    <p className={`text-xs ${styles.textMuted} mb-3`} dir={isRTL ? 'rtl' : 'ltr'}>
                      {suggestion.reasoning}
                    </p>
                    {!isApplied && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApplySuggestion(suggestion, 'replace')}
                          className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full hover:scale-105 transition"
                        >
                          {language === 'ar' ? 'استبدال' : 'Replace'}
                        </button>
                        <button
                          onClick={() => handleApplySuggestion(suggestion, 'append')}
                          className="text-xs border border-purple-300 text-purple-600 px-3 py-1 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                        >
                          {language === 'ar' ? 'إضافة' : 'Append'}
                        </button>
                        <button
                          onClick={() => handleApplySuggestion(suggestion, 'improve')}
                          className="text-xs border border-gray-300 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                          {language === 'ar' ? 'تحسين' : 'Improve'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {suggestions.length === 0 && !isLoading && (
            <div className={`text-center py-8 ${styles.textMuted}`}>
              <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>
                {language === 'ar'
                  ? 'لا توجد اقتراحات متاحة حالياً. جرب إضافة المزيد من المحتوى.'
                  : 'No suggestions available. Try adding more content.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
