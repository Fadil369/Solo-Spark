import { Brain, Lightbulb, Loader2, Send, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import AIService, { ContextMemory } from '../services/aiService';

interface AIAssistantProps {
  currentStage: number;
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  context: ContextMemory;
  onSuggestionApply: (suggestion: string, type: 'idea' | 'story' | 'prd' | 'prototype') => void;
  onContextUpdate: (context: ContextMemory) => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  type?: 'suggestion' | 'question' | 'improvement';
}

const stageNames = {
  1: { en: 'Idea Spark', ar: 'شرارة الفكرة' },
  2: { en: 'Story Builder', ar: 'بناء القصة' },
  3: { en: 'PRD Creator', ar: 'إنشاء المواصفات' },
  4: { en: 'Prototype Ship', ar: 'إطلاق النموذج' }
};

const suggestions = {
  1: {
    en: [
      'Try combining two unrelated industries for breakthrough innovations',
      'Look for pain points in your daily routine - they\'re goldmines for ideas',
      'What if you applied AI/ML to a traditional business model?',
      'Consider the opposite approach to existing solutions'
    ],
    ar: [
      'جرب دمج صناعتين غير مترابطتين للحصول على ابتكارات رائدة',
      'ابحث عن نقاط الألم في روتينك اليومي - إنها منجم ذهب للأفكار',
      'ماذا لو طبقت الذكاء الاصطناعي على نموذج عمل تقليدي؟',
      'فكر في النهج المعاكس للحلول الموجودة'
    ]
  },
  2: {
    en: [
      'Start with the user\'s emotional journey, not just functional needs',
      'Use the "before and after" narrative structure for impact',
      'Include specific metrics and outcomes in your story',
      'Make the stakeholder the hero of your story'
    ],
    ar: [
      'ابدأ بالرحلة العاطفية للمستخدم، وليس فقط الاحتياجات الوظيفية',
      'استخدم هيكل السرد "قبل وبعد" للتأثير',
      'قم بتضمين مقاييس ونتائج محددة في قصتك',
      'اجعل صاحب المصلحة هو البطل في قصتك'
    ]
  },
  3: {
    en: [
      'Use the MoSCoW method for feature prioritization',
      'Include both leading and lagging indicators in your metrics',
      'Don\'t forget non-functional requirements (performance, security)',
      'Define clear acceptance criteria for each feature'
    ],
    ar: [
      'استخدم طريقة MoSCoW لترتيب أولوية الميزات',
      'قم بتضمين المؤشرات الرائدة والمتأخرة في مقاييسك',
      'لا تنسَ المتطلبات غير الوظيفية (الأداء، الأمان)',
      'حدد معايير قبول واضحة لكل ميزة'
    ]
  },
  4: {
    en: [
      'Focus on core user flow first, advanced features later',
      'Make it mobile-responsive from the start',
      'Include clear call-to-action buttons',
      'Use consistent design patterns throughout'
    ],
    ar: [
      'ركز على تدفق المستخدم الأساسي أولاً، والميزات المتقدمة لاحقاً',
      'اجعله متجاوباً مع الهواتف المحمولة من البداية',
      'قم بتضمين أزرار دعوة واضحة للعمل',
      'استخدم أنماط تصميم متسقة في جميع أنحاء التطبيق'
    ]
  }
};

export default function AIAssistant({
  currentStage,
  language,
  theme,
  context,
  onSuggestionApply,
  onContextUpdate
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiService] = useState(() => new AIService());

  const isRTL = language === 'ar';
  const stageName = stageNames[currentStage as keyof typeof stageNames][language];
  const stageSuggestions = suggestions[currentStage as keyof typeof suggestions][language];

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: language === 'ar'
        ? `مرحباً! أنا مساعدك الذكي في رحلة الابتكار. أنت الآن في مرحلة "${stageName}". كيف يمكنني مساعدتك؟`
        : `Hi! I'm your AI innovation assistant. You're currently in the "${stageName}" stage. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      type: 'question'
    };

    setMessages([welcomeMessage]);
  }, [currentStage, language, stageName]);

  const styles = {
    surface: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Determine the type of assistance needed
      const systemPrompt = `You are an expert innovation assistant helping with stage ${currentStage} (${stageName}).
      Provide specific, actionable advice that helps users progress in their innovation journey.
      Be encouraging, practical, and focus on next steps.
      ${language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.'}`;

      const response = await aiService.callClaude(
        inputMessage,
        systemPrompt,
        context
      );

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response.content,
        sender: 'ai',
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update context with this conversation
      const updatedContext = {
        ...context,
        conversationHistory: [
          ...context.conversationHistory,
          {
            stage: stageName,
            input: inputMessage,
            output: response.content,
            timestamp: response.timestamp
          }
        ].slice(-10) // Keep last 10 conversations
      };

      onContextUpdate(updatedContext);

    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: language === 'ar'
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'Sorry, something went wrong. Please try again.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    const message: Message = {
      id: `suggestion-${Date.now()}`,
      content: suggestion,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      type: 'suggestion'
    };

    setMessages(prev => [...prev, message]);
  };

  const handleApplySuggestion = (content: string) => {
    const stageTypes = ['idea', 'story', 'prd', 'prototype'] as const;
    const type = stageTypes[currentStage - 1] || 'idea';
    onSuggestionApply(content, type);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          aria-label={language === 'ar' ? 'فتح المساعد الذكي' : 'Open AI Assistant'}
        >
          <Brain className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-full bg-green-500"></div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[90vw]">
      <div className={`${styles.surface} rounded-2xl border ${styles.border} shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`font-semibold ${styles.text}`}>
                {language === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}
              </h3>
              <p className={`text-xs ${styles.textMuted}`}>
                {stageName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className={`rounded-lg p-2 ${styles.hover}`}
            aria-label={language === 'ar' ? 'إغلاق المساعد' : 'Close assistant'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="border-b p-4">
          <h4 className={`mb-2 text-sm font-medium ${styles.text}`}>
            {language === 'ar' ? 'اقتراحات سريعة' : 'Quick Tips'}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {stageSuggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleQuickSuggestion(suggestion)}
                className={`rounded-lg border p-2 text-left text-xs transition ${styles.border} ${styles.hover}`}
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="mt-0.5 h-3 w-3 text-yellow-500 flex-shrink-0" />
                  <span className="line-clamp-2">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="max-h-80 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : message.type === 'suggestion'
                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
                    : `${styles.surface} border ${styles.border} ${styles.text}`
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.sender === 'ai' && message.type === 'suggestion' && (
                  <button
                    onClick={() => handleApplySuggestion(message.content)}
                    className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Zap className="h-3 w-3" />
                    {language === 'ar' ? 'تطبيق' : 'Apply'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`rounded-lg border px-3 py-2 ${styles.border}`}>
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 ${styles.border} ${styles.surface}`}
              disabled={isLoading}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              aria-label={language === 'ar' ? 'إرسال الرسالة' : 'Send message'}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
