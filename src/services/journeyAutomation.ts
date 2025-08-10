// User Journey Automation System for BrainSAIT Innovation Platform
// Inspired by the comprehensive user flow automation document

export interface UserJourneyStage {
  stage: 'awareness' | 'consideration' | 'decision' | 'onboarding' | 'adoption' | 'retention' | 'expansion' | 'advocacy';
  substage?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserBehavior {
  pageViews: Array<{ page: string; timestamp: string; duration: number }>;
  interactions: Array<{ action: string; element: string; timestamp: string }>;
  engagementScore: number;
  lastActivity: string;
  preferences: {
    language: 'en' | 'ar';
    industry?: string;
    companySize?: string;
    useCase?: string;
  };
}

export interface AutomationTrigger {
  id: string;
  name: string;
  conditions: Array<{
    type: 'behavioral' | 'temporal' | 'milestone';
    condition: string;
    value: any;
  }>;
  actions: Array<{
    type: 'notification' | 'email' | 'whatsapp' | 'ui_change' | 'ai_assistance';
    payload: any;
  }>;
}

class JourneyAutomationService {
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private userStages: Map<string, UserJourneyStage> = new Map();
  private triggers: AutomationTrigger[] = [];
  private eventListeners: Array<(event: any) => void> = [];
  private triggeredEvents: Map<string, Set<string>> = new Map(); // userId -> Set of triggered trigger IDs
  private lastTriggerTime: Map<string, number> = new Map(); // throttling per trigger

  constructor() {
    this.initializeDefaultTriggers();
  }

  private initializeDefaultTriggers() {
    // Stage 1: Awareness Triggers
    this.triggers.push({
      id: 'exit_intent_popup',
      name: 'Exit Intent Lead Magnet',
      conditions: [
        { type: 'behavioral', condition: 'mouse_leave_viewport', value: true },
        { type: 'behavioral', condition: 'time_on_page', value: 30 }
      ],
      actions: [
        {
          type: 'ui_change',
          payload: {
            component: 'exit_intent_modal',
            content: {
              en: 'Wait! Get our free PRD template guide',
              ar: 'انتظر! احصل على دليل نماذج المواصفات مجاناً'
            }
          }
        }
      ]
    });

    // Stage 2: Consideration Triggers
    this.triggers.push({
      id: 'pricing_page_engagement',
      name: 'Pricing Page ROI Calculator',
      conditions: [
        { type: 'behavioral', condition: 'page_visit', value: '/pricing' },
        { type: 'behavioral', condition: 'scroll_depth', value: 50 }
      ],
      actions: [
        {
          type: 'ui_change',
          payload: {
            component: 'roi_calculator_widget',
            trigger: 'show_comparison'
          }
        },
        {
          type: 'ai_assistance',
          payload: {
            message: 'I see you\'re exploring our pricing. Would you like me to calculate the ROI for your specific use case?'
          }
        }
      ]
    });

    // Stage 3: Decision Triggers
    this.triggers.push({
      id: 'trial_activation_flow',
      name: 'Immediate Trial Onboarding',
      conditions: [
        { type: 'milestone', condition: 'trial_started', value: true }
      ],
      actions: [
        {
          type: 'notification',
          payload: {
            title: '🎉 Welcome to your innovation journey!',
            content: 'Let\'s create your first idea in under 5 minutes',
            priority: 'high'
          }
        },
        {
          type: 'ai_assistance',
          payload: {
            message: 'I\'m here to guide you through your first innovation project. Shall we start with idea generation?',
            suggestedActions: ['start_idea_spark', 'watch_tutorial', 'explore_templates']
          }
        }
      ]
    });

    // Stage 4: Onboarding Triggers
    this.triggers.push({
      id: 'first_success_milestone',
      name: 'First PRD Created Celebration',
      conditions: [
        { type: 'milestone', condition: 'first_prd_created', value: true }
      ],
      actions: [
        {
          type: 'notification',
          payload: {
            title: '🚀 Congratulations! Your first PRD is ready!',
            content: 'You\'re now ready to move to the prototype stage',
            celebratory: true
          }
        },
        {
          type: 'ai_assistance',
          payload: {
            message: 'Fantastic work! Your PRD looks professional. Ready to create a working prototype?',
            achievement: 'first_architect'
          }
        }
      ]
    });

    // Stage 5: Adoption Triggers
    this.triggers.push({
      id: 'feature_discovery',
      name: 'Progressive Feature Introduction',
      conditions: [
        { type: 'temporal', condition: 'days_since_signup', value: 3 },
        { type: 'behavioral', condition: 'core_feature_usage', value: 'high' }
      ],
      actions: [
        {
          type: 'ai_assistance',
          payload: {
            message: 'You\'re doing great with the core features! Let me show you some advanced capabilities that could save you even more time.',
            features: ['ai_content_enhancement', 'smart_suggestions', 'collaboration_tools']
          }
        }
      ]
    });

    // Stage 6: Retention Triggers
    this.triggers.push({
      id: 'engagement_drop_intervention',
      name: 'Re-engagement Campaign',
      conditions: [
        { type: 'behavioral', condition: 'days_since_last_login', value: 7 },
        { type: 'behavioral', condition: 'previous_engagement', value: 'high' }
      ],
      actions: [
        {
          type: 'email',
          payload: {
            template: 'we_miss_you',
            personalization: {
              lastProject: '{{last_project_name}}',
              completionRate: '{{completion_percentage}}'
            }
          }
        },
        {
          type: 'whatsapp',
          payload: {
            message: 'سلام! لاحظنا أنك لم تدخل للمنصة مؤخراً. هل تحتاج مساعدة لإكمال مشروعك؟',
            cta: 'Continue Project'
          }
        }
      ]
    });

    // Stage 7: Expansion Triggers
    this.triggers.push({
      id: 'usage_limit_upsell',
      name: 'Smart Upgrade Suggestion',
      conditions: [
        { type: 'behavioral', condition: 'monthly_usage_percentage', value: 85 }
      ],
      actions: [
        {
          type: 'ai_assistance',
          payload: {
            message: 'I notice you\'re being very productive! You\'ve used 85% of your monthly limit. Would you like to upgrade to continue without interruption?',
            upgrade_benefits: ['unlimited_projects', 'advanced_ai_features', 'priority_support']
          }
        }
      ]
    });

    // Stage 8: Advocacy Triggers
    this.triggers.push({
      id: 'nps_survey_automation',
      name: 'Smart NPS Collection',
      conditions: [
        { type: 'milestone', condition: 'projects_completed', value: 5 },
        { type: 'temporal', condition: 'days_since_signup', value: 30 }
      ],
      actions: [
        {
          type: 'notification',
          payload: {
            title: 'Quick question: How likely are you to recommend Spark to a colleague?',
            type: 'nps_survey',
            scale: 10
          }
        }
      ]
    });
  }

  // Track user behavior and stage progression
  trackUserBehavior(userId: string, behavior: Partial<UserBehavior>) {
    const existingBehavior = this.userBehaviors.get(userId) || {
      pageViews: [],
      interactions: [],
      engagementScore: 0,
      lastActivity: new Date().toISOString(),
      preferences: { language: 'en' }
    };

    const updatedBehavior = {
      ...existingBehavior,
      ...behavior,
      lastActivity: new Date().toISOString()
    };

    this.userBehaviors.set(userId, updatedBehavior);
    this.evaluateTriggers(userId);
  }

  // Update user journey stage
  updateUserStage(userId: string, stage: UserJourneyStage) {
    // Add userId to metadata for milestone evaluation
    const stageWithUserId = {
      ...stage,
      metadata: {
        ...stage.metadata,
        userId
      }
    };

    this.userStages.set(userId, stageWithUserId);
    this.evaluateTriggers(userId);
  }

  // Evaluate triggers based on current user state
  private evaluateTriggers(userId: string) {
    const userBehavior = this.userBehaviors.get(userId);
    const userStage = this.userStages.get(userId);

    if (!userBehavior) return;

    this.triggers.forEach(trigger => {
      if (this.shouldTrigger(trigger, userBehavior, userStage)) {
        this.executeTrigger(trigger, userId, userBehavior);
      }
    });
  }

  private shouldTrigger(
    trigger: AutomationTrigger,
    userBehavior: UserBehavior,
    userStage?: UserJourneyStage
  ): boolean {
    return trigger.conditions.every(condition => {
      switch (condition.type) {
        case 'behavioral':
          return this.evaluateBehavioralCondition(condition, userBehavior);
        case 'temporal':
          return this.evaluateTemporalCondition(condition, userStage);
        case 'milestone':
          return this.evaluateMilestoneCondition(condition, userBehavior, userStage);
        default:
          return false;
      }
    });
  }

  private evaluateBehavioralCondition(condition: any, userBehavior: UserBehavior): boolean {
    switch (condition.condition) {
      case 'time_on_page':
        const lastPageView = userBehavior.pageViews[userBehavior.pageViews.length - 1];
        return lastPageView ? lastPageView.duration >= condition.value : false;

      case 'engagement_score':
        return userBehavior.engagementScore >= condition.value;

      case 'page_visit':
        return userBehavior.pageViews.some(pv => pv.page === condition.value);

      case 'days_since_last_login':
        const daysSince = (Date.now() - new Date(userBehavior.lastActivity).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince >= condition.value;

      default:
        return false;
    }
  }

  private evaluateTemporalCondition(condition: any, userStage?: UserJourneyStage): boolean {
    if (!userStage) return false;

    switch (condition.condition) {
      case 'days_since_signup':
        const daysSince = (Date.now() - new Date(userStage.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince >= condition.value;

      default:
        return false;
    }
  }

  private evaluateMilestoneCondition(condition: any, userBehavior: UserBehavior, userStage?: UserJourneyStage): boolean {
    // Check if this milestone-based trigger has already been fired for this user
    const userId = userStage?.metadata?.userId || 'default_user';
    const userTriggeredEvents = this.triggeredEvents.get(userId) || new Set();

    // For milestone conditions, only trigger once per user
    switch (condition.condition) {
      case 'trial_started':
        // Check if user has actually started trial (this should be passed from app state)
        return userStage?.stage === 'onboarding' && !userTriggeredEvents.has('trial_started');

      case 'first_prd_created':
        // Check if user has completed PRD stage and hasn't been notified yet
        return userStage?.stage === 'adoption' &&
               userStage?.metadata?.completedStages?.includes('prd') &&
               !userTriggeredEvents.has('first_prd_created');

      case 'first_prototype_shipped':
        return userStage?.stage === 'retention' &&
               userStage?.metadata?.completedStages?.includes('prototype') &&
               !userTriggeredEvents.has('first_prototype_shipped');

      default:
        // For unknown milestones, check if already triggered
        const milestoneKey = `milestone_${condition.condition}`;
        return condition.value === true && !userTriggeredEvents.has(milestoneKey);
    }
  }

  private executeTrigger(trigger: AutomationTrigger, userId: string, userBehavior: UserBehavior) {
    // Check throttling to prevent spam (max once per minute per trigger)
    const throttleKey = `${userId}_${trigger.id}`;
    const lastTriggerTime = this.lastTriggerTime.get(throttleKey) || 0;
    const now = Date.now();

    if (now - lastTriggerTime < 60000) { // 1 minute throttle
      return;
    }

    // Mark trigger as executed
    if (!this.triggeredEvents.has(userId)) {
      this.triggeredEvents.set(userId, new Set());
    }
    this.triggeredEvents.get(userId)!.add(trigger.id);
    this.lastTriggerTime.set(throttleKey, now);

    trigger.actions.forEach(action => {
      this.eventListeners.forEach(listener => {
        listener({
          type: 'automation_trigger',
          triggerId: trigger.id,
          userId,
          action,
          userBehavior,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  // Subscribe to automation events
  onAutomationEvent(listener: (event: any) => void) {
    this.eventListeners.push(listener);
  }

  // Remove event listener
  removeAutomationListener(listener: (event: any) => void) {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // Get personalized recommendations based on user stage and behavior
  getPersonalizedRecommendations(userId: string): Array<{
    type: 'feature' | 'content' | 'action';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    cta: string;
  }> {
    const userBehavior = this.userBehaviors.get(userId);
    const userStage = this.userStages.get(userId);

    if (!userBehavior || !userStage) return [];

    const recommendations = [];

    // Stage-based recommendations
    switch (userStage.stage) {
      case 'awareness':
        recommendations.push({
          type: 'content' as const,
          title: userBehavior.preferences.language === 'ar' ? 'دليل البداية السريعة' : 'Quick Start Guide',
          description: userBehavior.preferences.language === 'ar'
            ? 'تعلم كيفية إنشاء أول فكرة مبتكرة في 5 دقائق'
            : 'Learn how to create your first innovative idea in 5 minutes',
          priority: 'high' as const,
          cta: userBehavior.preferences.language === 'ar' ? 'ابدأ الآن' : 'Start Now'
        });
        break;

      case 'consideration':
        recommendations.push({
          type: 'action' as const,
          title: userBehavior.preferences.language === 'ar' ? 'جرب التجربة المجانية' : 'Try Free Demo',
          description: userBehavior.preferences.language === 'ar'
            ? 'اختبر جميع الميزات لمدة 14 يوم مجاناً'
            : 'Test all features for 14 days free',
          priority: 'high' as const,
          cta: userBehavior.preferences.language === 'ar' ? 'ابدأ التجربة' : 'Start Trial'
        });
        break;

      case 'onboarding':
        if (userBehavior.engagementScore < 50) {
          recommendations.push({
            type: 'feature' as const,
            title: userBehavior.preferences.language === 'ar' ? 'المساعد الذكي' : 'AI Assistant',
            description: userBehavior.preferences.language === 'ar'
              ? 'دع الذكاء الاصطناعي يساعدك في رحلة الابتكار'
              : 'Let AI guide you through your innovation journey',
            priority: 'medium' as const,
            cta: userBehavior.preferences.language === 'ar' ? 'تفعيل المساعد' : 'Enable Assistant'
          });
        }
        break;

      case 'adoption':
        recommendations.push({
          type: 'feature' as const,
          title: userBehavior.preferences.language === 'ar' ? 'الاقتراحات الذكية' : 'Smart Suggestions',
          description: userBehavior.preferences.language === 'ar'
            ? 'احصل على اقتراحات مخصصة لتحسين مشاريعك'
            : 'Get personalized suggestions to improve your projects',
          priority: 'medium' as const,
          cta: userBehavior.preferences.language === 'ar' ? 'استكشف الآن' : 'Explore Now'
        });
        break;
    }

    return recommendations;
  }

  // Calculate engagement score based on behavior
  calculateEngagementScore(userBehavior: UserBehavior): number {
    let score = 0;

    // Page views contribute to engagement
    score += Math.min(userBehavior.pageViews.length * 5, 30);

    // Interactions contribute more
    score += Math.min(userBehavior.interactions.length * 10, 50);

    // Recent activity boosts score
    const daysSinceLastActivity = (Date.now() - new Date(userBehavior.lastActivity).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastActivity < 1) score += 20;
    else if (daysSinceLastActivity < 7) score += 10;

    return Math.min(score, 100);
  }

  // Get user insights for admin dashboard
  getUserInsights(userId: string) {
    const userBehavior = this.userBehaviors.get(userId);
    const userStage = this.userStages.get(userId);

    if (!userBehavior || !userStage) return null;

    return {
      stage: userStage.stage,
      engagementScore: userBehavior.engagementScore,
      riskLevel: this.getRiskLevel(userBehavior),
      nextBestAction: this.getNextBestAction(userBehavior, userStage)
    };
  }

  // Reset automation state for a user (useful for testing or user request)
  resetUserAutomationState(userId: string) {
    this.triggeredEvents.delete(userId);

    // Clear throttling for this user
    const keysToDelete = Array.from(this.lastTriggerTime.keys()).filter(key => key.startsWith(`${userId}_`));
    keysToDelete.forEach(key => this.lastTriggerTime.delete(key));
  }

  // Check if a specific trigger has been fired for a user
  hasTriggeredEvent(userId: string, triggerId: string): boolean {
    const userEvents = this.triggeredEvents.get(userId);
    return userEvents ? userEvents.has(triggerId) : false;
  }

  private getRiskLevel(userBehavior: UserBehavior): 'low' | 'medium' | 'high' {
    const score = userBehavior.engagementScore;
    if (score >= 70) return 'low';
    if (score >= 40) return 'medium';
    return 'high';
  }  private calculateChurnRisk(userBehavior: UserBehavior): 'low' | 'medium' | 'high' {
    const engagementScore = this.calculateEngagementScore(userBehavior);
    const daysSinceLastActivity = (Date.now() - new Date(userBehavior.lastActivity).getTime()) / (1000 * 60 * 60 * 24);

    if (engagementScore > 70 && daysSinceLastActivity < 3) return 'low';
    if (engagementScore > 40 && daysSinceLastActivity < 7) return 'medium';
    return 'high';
  }

  private getNextBestAction(userBehavior: UserBehavior, userStage: UserJourneyStage): string {
    const engagementScore = this.calculateEngagementScore(userBehavior);

    if (engagementScore < 30) {
      return userBehavior.preferences.language === 'ar'
        ? 'إرسال رسالة ترحيب شخصية'
        : 'Send personalized welcome message';
    }

    if (userStage.stage === 'consideration') {
      return userBehavior.preferences.language === 'ar'
        ? 'عرض تجربة مجانية مخصصة'
        : 'Offer personalized trial';
    }

    return userBehavior.preferences.language === 'ar'
      ? 'مشاركة محتوى قيم'
      : 'Share valuable content';
  }
}

export default JourneyAutomationService;
