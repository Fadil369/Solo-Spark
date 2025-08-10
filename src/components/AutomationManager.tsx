import {
    AlertTriangle,
    Brain,
    CheckCircle,
    Heart,
    Info,
    Rocket,
    Star,
    Target,
    TrendingUp,
    Users,
    X,
    Zap
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import JourneyAutomationService, { UserBehavior, UserJourneyStage } from '../services/journeyAutomation';

interface AutomationManagerProps {
  userId: string;
  currentStage: number;
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  userProgress: any;
  onStageChange?: (stage: number) => void;
  onNotification?: (notification: any) => void;
}

interface AutomationNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'celebration';
  title: string;
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
  duration?: number;
  timestamp: string;
}

export default function AutomationManager({
  userId,
  currentStage,
  language,
  theme,
  userProgress,
  onStageChange,
  onNotification
}: AutomationManagerProps) {
  const [automationService] = useState(() => new JourneyAutomationService());
  const [notifications, setNotifications] = useState<AutomationNotification[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [userInsights, setUserInsights] = useState<any>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [lastProcessedStage, setLastProcessedStage] = useState<number>(-1);
  const [processedEvents, setProcessedEvents] = useState<Set<string>>(new Set());

  const isRTL = language === 'ar';

  const styles = {
    surface: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  };

  // Map app stages to journey stages
  const mapToJourneyStage = useCallback((stage: number): UserJourneyStage['stage'] => {
    const stageMap = {
      0: 'awareness',
      1: 'consideration',
      2: 'decision',
      3: 'onboarding',
      4: 'adoption'
    } as const;

    return stageMap[stage as keyof typeof stageMap] || 'adoption';
  }, []);

  // Calculate engagement score based on user progress
  const calculateEngagementScore = useCallback(() => {
    let score = 0;

    // Points contribute to engagement
    score += Math.min(userProgress?.points || 0, 50) / 50 * 40;

    // Completed stages
    score += (userProgress?.completedStages?.length || 0) * 15;

    // Achievements
    score += (userProgress?.achievements?.length || 0) * 5;

    return Math.min(score, 100);
  }, [userProgress]);

  // Initialize automation service and tracking - only when stage actually changes
  useEffect(() => {
    // Only process if stage actually changed
    if (currentStage === lastProcessedStage) return;

    const journeyStage: UserJourneyStage = {
      stage: mapToJourneyStage(currentStage),
      timestamp: new Date().toISOString(),
      metadata: { appStage: currentStage }
    };

    const userBehavior: Partial<UserBehavior> = {
      preferences: {
        language,
        industry: userProgress?.metadata?.industry,
        companySize: userProgress?.metadata?.companySize
      },
      engagementScore: calculateEngagementScore(),
      lastActivity: new Date().toISOString()
    };

    automationService.updateUserStage(userId, journeyStage);
    automationService.trackUserBehavior(userId, userBehavior);

    // Get recommendations
    const recs = automationService.getPersonalizedRecommendations(userId);
    setRecommendations(recs);

    // Get user insights
    const insights = automationService.getUserInsights(userId);
    setUserInsights(insights);

    // Update processed stage
    setLastProcessedStage(currentStage);
  }, [currentStage, userId, automationService, mapToJourneyStage, lastProcessedStage, calculateEngagementScore, language, userProgress]);

  // Setup automation event listener with deduplication
  useEffect(() => {
    const handleAutomationEvent = (event: any) => {
      // Create unique event identifier
      const eventId = `${event.trigger}_${event.action.type}_${event.action.payload.title || ''}_${Math.floor(Date.now() / 10000)}`;

      // Skip if we've already processed this event recently (within 10 seconds)
      if (processedEvents.has(eventId)) {
        return;
      }

      // Add to processed events and clean up old ones
      setProcessedEvents(prev => {
        const newSet = new Set(prev);
        newSet.add(eventId);

        // Keep only recent events (last 50)
        if (newSet.size > 50) {
          const sorted = Array.from(newSet).sort();
          return new Set(sorted.slice(-50));
        }

        return newSet;
      });

      switch (event.action.type) {
        case 'notification':
          const notification: AutomationNotification = {
            id: `auto-${Date.now()}`,
            type: event.action.payload.celebratory ? 'celebration' : 'info',
            title: event.action.payload.title,
            message: event.action.payload.content,
            timestamp: event.timestamp,
            duration: 5000
          };

          setNotifications(prev => [notification, ...prev.slice(0, 4)]);
          if (onNotification) onNotification(notification);
          break;

        case 'ai_assistance':
          // Trigger AI assistant with specific message
          if (onNotification) {
            onNotification({
              type: 'ai_assistance',
              message: event.action.payload.message,
              suggestedActions: event.action.payload.suggestedActions
            });
          }
          break;

        case 'ui_change':
          // Handle UI changes like showing modals, widgets, etc.
          if (event.action.payload.component === 'exit_intent_modal') {
            // Show exit intent modal
            setShowRecommendations(true);
          }
          break;
      }
    };

    automationService.onAutomationEvent(handleAutomationEvent);

    return () => {
      automationService.removeAutomationListener(handleAutomationEvent);
    };
  }, [automationService, onNotification, processedEvents]);

  // Track page interactions
  useEffect(() => {
    const trackInteraction = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const action = target.tagName.toLowerCase();
      const element = target.className || target.id || target.tagName;

      automationService.trackUserBehavior(userId, {
        interactions: [{
          action,
          element,
          timestamp: new Date().toISOString()
        }]
      });
    };

    const trackPageView = () => {
      automationService.trackUserBehavior(userId, {
        pageViews: [{
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
          duration: 0 // Will be updated on page leave
        }]
      });
    };

    document.addEventListener('click', trackInteraction);
    window.addEventListener('load', trackPageView);

    return () => {
      document.removeEventListener('click', trackInteraction);
      window.removeEventListener('load', trackPageView);
    };
  }, [userId, automationService]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: AutomationNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'celebration':
        return <Star className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStageIcon = (stage: string) => {
    const icons = {
      awareness: Brain,
      consideration: TrendingUp,
      decision: Target,
      onboarding: Rocket,
      adoption: Heart,
      retention: Users,
      expansion: Zap,
      advocacy: Star
    };

    const IconComponent = icons[stage as keyof typeof icons] || Info;
    return <IconComponent className="h-4 w-4" />;
  };

  const getEngagementColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleRecommendationAction = (recommendation: any) => {
    switch (recommendation.type) {
      case 'action':
        if (recommendation.cta.includes('Start Trial') || recommendation.cta.includes('ابدأ التجربة')) {
          if (onStageChange) onStageChange(1);
        }
        break;
      case 'feature':
        // Enable specific features or show feature highlights
        break;
      case 'content':
        // Show relevant content or tutorials
        break;
    }

    // Track the action
    automationService.trackUserBehavior(userId, {
      interactions: [{
        action: 'recommendation_clicked',
        element: recommendation.type,
        timestamp: new Date().toISOString()
      }]
    });
  };

  return (
    <>
      {/* Floating Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              ${styles.surface} border ${styles.border} rounded-lg p-4 shadow-lg max-w-sm
              transform transition-all duration-300 ease-in-out
              ${notification.type === 'celebration' ? 'animate-pulse' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              {getNotificationIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm ${styles.text}`}>
                  {notification.title}
                </h4>
                <p className={`text-xs mt-1 ${styles.textMuted}`}>
                  {notification.message}
                </p>
                {notification.action && (
                  <button
                    onClick={notification.action.handler}
                    className="mt-2 text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full hover:scale-105 transition"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className={`p-1 rounded ${styles.hover}`}
                title={language === 'ar' ? 'إغلاق' : 'Close'}
                aria-label={language === 'ar' ? 'إغلاق الإشعار' : 'Close notification'}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations Panel */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${styles.surface} rounded-xl border ${styles.border} p-6 max-w-md w-full`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${styles.text}`}>
                {language === 'ar' ? '🎯 اقتراحات مخصصة لك' : '🎯 Personalized for You'}
              </h3>
              <button
                onClick={() => setShowRecommendations(false)}
                className={`p-1 rounded ${styles.hover}`}
                title={language === 'ar' ? 'إغلاق' : 'Close'}
                aria-label={language === 'ar' ? 'إغلاق التوصيات' : 'Close recommendations'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-all ${styles.border} ${styles.hover}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900`}>
                      {rec.type === 'feature' && <Zap className="h-4 w-4 text-purple-600" />}
                      {rec.type === 'content' && <Brain className="h-4 w-4 text-blue-600" />}
                      {rec.type === 'action' && <Rocket className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium text-sm ${styles.text}`}>{rec.title}</h4>
                      <p className={`text-xs mt-1 ${styles.textMuted}`}>{rec.description}</p>
                      <button
                        onClick={() => handleRecommendationAction(rec)}
                        className="mt-2 text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full hover:scale-105 transition"
                      >
                        {rec.cta}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Journey Insights (Admin/Debug View) */}
      {userInsights && import.meta.env?.DEV && (
        <div className="fixed bottom-4 left-4 z-40">
          <div className={`${styles.surface} border ${styles.border} rounded-lg p-3 text-xs`}>
            <div className="flex items-center gap-2 mb-2">
              {getStageIcon(userInsights.stage)}
              <span className={`font-medium ${styles.text}`}>
                Stage: {userInsights.stage}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className={styles.textMuted}>Engagement:</span>
                <span className={getEngagementColor(userInsights.engagementScore)}>
                  {userInsights.engagementScore}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className={styles.textMuted}>Risk:</span>
                <span className={
                  userInsights.riskLevel === 'high' ? 'text-red-500' :
                  userInsights.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }>
                  {userInsights.riskLevel}
                </span>
              </div>
              <div className={`mt-2 p-2 rounded text-xs ${styles.hover}`}>
                <strong>Next:</strong> {userInsights.nextBestAction}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
