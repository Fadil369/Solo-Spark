// Enhanced AI service for innovation journey assistance
export interface AIConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  model?: string;
  timestamp: string;
  confidence?: number;
  creativity?: number;
  marketViability?: number;
}

export interface ContextMemory {
  ideas: string[];
  stories: string[];
  prds: string[];
  prototypes: string[];
  userPreferences: {
    language: 'en' | 'ar';
    industries: string[];
    complexity: 'simple' | 'moderate' | 'advanced';
    tone: string;
    innovationStyle: 'disruptive' | 'incremental' | 'radical' | 'sustainable';
    riskTolerance: 'low' | 'medium' | 'high';
    marketFocus: 'local' | 'regional' | 'global';
  };
  conversationHistory: Array<{
    stage: string;
    input: string;
    output: string;
    timestamp: string;
    satisfaction?: number;
  }>;
  insights: {
    strengthAreas: string[];
    improvementAreas: string[];
    successPatterns: string[];
    marketOpportunities: string[];
  };
}

class AIService {
  private config: AIConfig;
  private baseURL = 'https://api.anthropic.com/v1/messages';
  private creativityPrompts = {
    ideaGeneration: {
      en: [
        "Think like a visionary entrepreneur who sees opportunities where others see problems.",
        "Channel the innovation mindset of Steve Jobs, Elon Musk, and Mohammed bin Rashid Al Maktoum.",
        "Imagine you're solving this for Saudi Arabia's Vision 2030 transformation.",
        "Consider both traditional wisdom and cutting-edge technology.",
        "Think about how this could impact millions of lives positively."
      ],
      ar: [
        "فكر كرائد أعمال بصري يرى الفرص حيث يرى الآخرون المشاكل",
        "استلهم من عقلية الابتكار لستيف جوبز وإيلون ماسك والشيخ محمد بن راشد",
        "تخيل أنك تحل هذا لتحول رؤية السعودية 2030",
        "فكر في كل من الحكمة التقليدية والتكنولوجيا المتطورة",
        "فكر في كيف يمكن لهذا أن يؤثر إيجابياً على ملايين الأرواح"
      ]
    },
    marketValidation: {
      en: [
        "Validate with Saudi market dynamics and cultural preferences.",
        "Consider the unique opportunities in the Middle East region.",
        "Think about Vision 2030 initiatives and government support.",
        "Analyze competitive landscape in both local and global markets.",
        "Consider cultural sensitivity and Islamic values alignment."
      ],
      ar: [
        "تحقق من ديناميكيات السوق السعودية والتفضيلات الثقافية",
        "فكر في الفرص الفريدة في منطقة الشرق الأوسط",
        "فكر في مبادرات رؤية 2030 والدعم الحكومي",
        "حلل المشهد التنافسي في الأسواق المحلية والعالمية",
        "فكر في الحساسية الثقافية والتوافق مع القيم الإسلامية"
      ]
    }
  };

  constructor(config: AIConfig = {}) {
    this.config = {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 6000,
      temperature: 0.8,
      ...config
    };
  }

  async callClaude(
    prompt: string,
    systemPrompt?: string,
    context?: ContextMemory
  ): Promise<AIResponse> {
    try {
      const apiKey = this.config.apiKey ||
                    (import.meta as any).env?.VITE_ANTHROPIC_API_KEY ||
                    (window as any).ANTHROPIC_API_KEY;

      if (!apiKey) {
        return this.generateFallbackContent(prompt);
      }

      const enhancedPrompt = this.enhancePromptWithContext(prompt, context);

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          system: systemPrompt,
          messages: [{ role: 'user', content: enhancedPrompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data?.content?.[0]?.text || '';

      return {
        content,
        usage: data.usage,
        model: this.config.model,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.generateFallbackContent(prompt);
    }
  }

  private enhancePromptWithContext(prompt: string, context?: ContextMemory): string {
    if (!context) return prompt;

    let enhancedPrompt = prompt;

    // Add conversation history for continuity
    if (context.conversationHistory.length > 0) {
      const recentHistory = context.conversationHistory.slice(-3);
      enhancedPrompt += '\n\n### Previous Context:\n';
      recentHistory.forEach(item => {
        enhancedPrompt += `Stage: ${item.stage}\nInput: ${item.input}\nOutput: ${item.output}\n\n`;
      });
    }

    // Add user preferences
    if (context.userPreferences) {
      enhancedPrompt += '\n\n### User Preferences:\n';
      enhancedPrompt += `Language: ${context.userPreferences.language}\n`;
      enhancedPrompt += `Industries: ${context.userPreferences.industries.join(', ')}\n`;
      enhancedPrompt += `Complexity: ${context.userPreferences.complexity}\n`;
      enhancedPrompt += `Tone: ${context.userPreferences.tone}\n`;
    }

    return enhancedPrompt;
  }

  private generateFallbackContent(prompt: string): AIResponse {
    const p = prompt.toLowerCase();

    if (p.includes('idea') || p.includes('innovate')) {
      return {
        content: this.getFallbackIdeas(),
        timestamp: new Date().toISOString()
      };
    }

    if (p.includes('story') || p.includes('narrative')) {
      return {
        content: this.getFallbackStory(),
        timestamp: new Date().toISOString()
      };
    }

    if (p.includes('prd') || p.includes('requirements')) {
      return {
        content: this.getFallbackPRD(),
        timestamp: new Date().toISOString()
      };
    }

    if (p.includes('prototype') || p.includes('html')) {
      return {
        content: this.getFallbackPrototype(),
        timestamp: new Date().toISOString()
      };
    }

    // Smart suggestions based on stage
    if (p.includes('suggest') || p.includes('help')) {
      return {
        content: this.getSmartSuggestions(p),
        timestamp: new Date().toISOString()
      };
    }

    return {
      content: '## AI Service Unavailable\n\nPlease set up your Anthropic API key to enable AI-powered assistance.',
      timestamp: new Date().toISOString()
    };
  }

  private getFallbackIdeas(): string {
    const ideas = [
      '**Smart Urban Garden** — IoT-powered vertical farming system for apartments with AI-optimized growing conditions',
      '**EcoCommute Tracker** — Gamified app that rewards sustainable transportation choices with local business discounts',
      '**Memory Palace VR** — Virtual reality study tool that uses spatial memory techniques for enhanced learning',
      '**Community Skill Exchange** — Hyperlocal platform where neighbors teach and learn from each other',
      '**Wellness Companion AI** — Personalized mental health support using voice analysis and contextual recommendations',
      '**Sustainable Shopping Scout** — Browser extension that shows environmental impact scores for online purchases',
      '**Virtual Study Buddy** — AI tutor that adapts to individual learning styles and provides real-time feedback',
      '**Local Impact Tracker** — App that visualizes how personal choices affect local community and environment'
    ];

    const randomIdeas = ideas.sort(() => 0.5 - Math.random()).slice(0, 5);
    return '## 💡 Innovative Ideas\n\n' + randomIdeas.map((idea, i) => `${i + 1}. ${idea}`).join('\n\n');
  }

  private getFallbackStory(): string {
    return `## 📖 Innovation Story

In today's rapidly evolving digital landscape, a team of visionary innovators identified a crucial gap in how people interact with technology. They observed that while tools exist, the human connection and intuitive experience were often missing.

Drawing inspiration from successful products that prioritized user experience over complexity, they embarked on a journey to create something that would not just solve problems, but inspire and empower users to achieve more than they thought possible.

Their approach was methodical yet creative: understanding user pain points through empathy, rapid prototyping to test assumptions, and iterative design based on real feedback. What emerged was not just a product, but a platform for human potential.

The story demonstrates how innovation succeeds when it combines technical excellence with deep human understanding, creating solutions that feel natural and empowering rather than complicated and overwhelming.`;
  }

  private getFallbackPRD(): string {
    return `## 📋 Product Requirements Document

### Executive Summary
A comprehensive solution designed to address key user needs through intuitive technology and exceptional user experience.

### Problem Statement
Users face challenges with existing solutions that are either too complex, lack integration, or fail to address their core workflow needs effectively.

### Target Users
- Primary: Tech-savvy professionals seeking efficiency
- Secondary: Teams requiring collaborative solutions
- Tertiary: Organizations looking for scalable platforms

### Goals & Success Metrics
**Primary Objectives:**
- User activation rate > 70% within first week
- Monthly retention rate > 85%
- NPS score > 50

**Key Results:**
- Time to first value < 5 minutes
- Feature adoption rate > 60%
- Support ticket reduction by 40%

### Core Features (MoSCoW)

**Must Have:**
- Intuitive onboarding flow
- Core functionality with mobile responsiveness
- Basic analytics and reporting

**Should Have:**
- Advanced customization options
- Integration with popular tools
- Enhanced collaboration features

**Could Have:**
- AI-powered recommendations
- Advanced analytics dashboard
- White-label options

**Won't Have (This Release):**
- Complex automation workflows
- Enterprise-level security features
- Multi-tenant architecture

### Technical Requirements
- Web-based application with mobile responsiveness
- RESTful API architecture
- Cloud-hosted with 99.9% uptime SLA
- GDPR compliant data handling

### Risks & Mitigations
**Technical Risks:**
- Scalability concerns → Implement auto-scaling infrastructure
- Integration complexity → Start with core integrations, expand gradually

**Market Risks:**
- Competition → Focus on unique value proposition and user experience
- User adoption → Comprehensive onboarding and support

### Launch Plan
**Phase 1 (Weeks 1-4):** MVP development and internal testing
**Phase 2 (Weeks 5-6):** Beta testing with select users
**Phase 3 (Weeks 7-8):** Public launch with marketing campaign
**Phase 4 (Ongoing):** Iterate based on user feedback and analytics`;
  }

  private getFallbackPrototype(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Innovation Prototype</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            margin: 20px 0;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        .hero { text-align: center; padding: 60px 0; }
        .hero h1 {
            font-size: clamp(2rem, 5vw, 4rem);
            margin-bottom: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin: 40px 0;
        }
        .feature {
            padding: 30px;
            border-radius: 15px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            text-align: center;
            transition: transform 0.3s ease;
        }
        .feature:hover { transform: translateY(-10px); }
        .feature h3 { margin-bottom: 15px; font-size: 1.5rem; }
        .cta {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 15px 40px;
            border: none;
            border-radius: 50px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            margin: 20px 10px;
        }
        .cta:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            text-align: center;
        }
        .stat { padding: 20px; }
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .card { padding: 20px; margin: 10px 0; }
            .features { grid-template-columns: 1fr; gap: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card hero">
            <h1>🚀 Innovation Platform</h1>
            <p style="font-size: 1.2rem; margin-bottom: 30px; color: #666;">
                Transform your ideas into reality with our AI-powered innovation journey
            </p>
            <button class="cta" onclick="alert('Welcome to your innovation journey!')">
                Start Your Journey
            </button>
            <button class="cta" onclick="alert('Learn more about our features!')">
                Learn More
            </button>
        </div>

        <div class="card">
            <h2 style="text-align: center; margin-bottom: 40px; color: #333;">Key Features</h2>
            <div class="features">
                <div class="feature">
                    <h3>💡 Idea Generation</h3>
                    <p>AI-powered brainstorming tools that help you discover innovative solutions to complex problems.</p>
                </div>
                <div class="feature">
                    <h3>📖 Story Building</h3>
                    <p>Transform raw ideas into compelling narratives that resonate with your target audience.</p>
                </div>
                <div class="feature">
                    <h3>📋 PRD Creation</h3>
                    <p>Generate comprehensive product requirements documents with industry best practices.</p>
                </div>
                <div class="feature">
                    <h3>🎨 Rapid Prototyping</h3>
                    <p>Create functional prototypes quickly to validate your concepts and gather feedback.</p>
                </div>
            </div>
        </div>

        <div class="card">
            <h2 style="text-align: center; margin-bottom: 40px; color: #333;">Platform Statistics</h2>
            <div class="stats">
                <div class="stat">
                    <div class="stat-number">10K+</div>
                    <div>Ideas Generated</div>
                </div>
                <div class="stat">
                    <div class="stat-number">5K+</div>
                    <div>Stories Created</div>
                </div>
                <div class="stat">
                    <div class="stat-number">2K+</div>
                    <div>PRDs Built</div>
                </div>
                <div class="stat">
                    <div class="stat-number">98%</div>
                    <div>Success Rate</div>
                </div>
            </div>
        </div>

        <div class="card" style="text-align: center;">
            <h2 style="margin-bottom: 20px; color: #333;">Ready to Innovate?</h2>
            <p style="margin-bottom: 30px; color: #666;">
                Join thousands of innovators who are already transforming their ideas into successful products.
            </p>
            <button class="cta" onclick="alert('Starting your innovation journey...')">
                Get Started Now
            </button>
        </div>
    </div>

    <script>
        // Add some interactive functionality
        document.querySelectorAll('.feature').forEach(feature => {
            feature.addEventListener('click', () => {
                feature.style.animation = 'pulse 0.5s ease-in-out';
                setTimeout(() => {
                    feature.style.animation = '';
                }, 500);
            });
        });

        // Add CSS for pulse animation
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        \`;
        document.head.appendChild(style);
    </script>
</body>
</html>`;
  }

  private getSmartSuggestions(prompt: string): string {
    const suggestions = [
      '💡 **Try combining trending technologies** with traditional industries for disruptive innovations',
      '🎯 **Focus on underserved markets** - often the biggest opportunities lie in neglected user segments',
      '🔄 **Apply the "reverse thinking" method** - what if you did the opposite of current solutions?',
      '🌍 **Consider global challenges** - sustainability, accessibility, and social impact drive innovation',
      '⚡ **Start with the simplest possible version** - complexity can always be added later',
      '👥 **Talk to real users early and often** - assumptions are the enemy of good products',
      '📊 **Measure everything that matters** - data-driven decisions lead to better outcomes',
      '🔧 **Prototype before you plan** - hands-on experimentation reveals insights faster than theory'
    ];

    const randomSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 4);
    return '## 🎯 Smart Innovation Tips\n\n' + randomSuggestions.join('\n\n');
  }

  // Enhanced methods for specific innovation stages
  async generateIdeas(
    words: string[],
    category: string,
    language: 'en' | 'ar' = 'en',
    context?: ContextMemory
  ): Promise<AIResponse> {
    const systemPrompt = `You are an expert innovation facilitator and creative thinking partner. Generate innovative, practical ideas that combine the given concepts in unexpected ways. Focus on feasibility, market potential, and user value.`;

    const prompt = language === 'ar'
      ? `قم بإنشاء 5 أفكار مبتكرة عملية لفئة "${category}" باستخدام هذه الكلمات: ${words.join(', ')}.

اجعل كل فكرة:
- مبتكرة ولكن قابلة للتطبيق
- تحل مشكلة حقيقية
- لها إمكانية تجارية واضحة
- تستفيد من التقنيات الحديثة

اكتب بالعربية وقدم كل فكرة مع عنوان جذاب ووصف من جملة واحدة.`
      : `Generate 5 innovative, practical ideas for the "${category}" category using these words: ${words.join(', ')}.

Make each idea:
- Creative yet feasible
- Solving a real problem
- Having clear market potential
- Leveraging modern technologies

Provide each idea with a compelling title and a one-sentence description that captures the value proposition.`;

    return this.callClaude(prompt, systemPrompt, context);
  }

  async buildStory(
    concept: string,
    context: {
      tone?: string;
      audience?: string;
      length?: string;
      other?: string;
    },
    language: 'en' | 'ar' = 'en',
    memory?: ContextMemory
  ): Promise<AIResponse> {
    const systemPrompt = `You are a master storyteller who specializes in transforming technical concepts into compelling narratives that resonate with specific audiences. Focus on emotional connection, clear value proposition, and memorable messaging.`;

    const contextStr = Object.entries(context)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const prompt = language === 'ar'
      ? `أنشئ قصة مقنعة حول: "${concept}"

السياق: ${contextStr}

اجعل القصة:
- تثير المشاعر وتلهم العمل
- تركز على قيمة المستخدم
- تتضمن تحديات وحلول
- تنتهي برؤية واضحة للمستقبل

اكتب بالعربية واستخدم تقنيات السرد المؤثرة.`
      : `Create a compelling story about: "${concept}"

Context: ${contextStr}

Make the story:
- Emotionally engaging and action-inspiring
- Focused on user value and impact
- Include challenges and solutions
- End with a clear vision of the future

Use powerful storytelling techniques and narrative structure.`;

    return this.callClaude(prompt, systemPrompt, memory);
  }

  async createPRD(
    answers: {
      product: string;
      users: string;
      features: string;
    },
    language: 'en' | 'ar' = 'en',
    context?: ContextMemory
  ): Promise<AIResponse> {
    const systemPrompt = `You are a senior product manager with expertise in writing comprehensive PRDs. Create detailed, actionable product requirements that follow industry best practices and include measurable success criteria.`;

    const prompt = language === 'ar'
      ? `أنشئ وثيقة متطلبات منتج شاملة بناءً على:

المنتج/الميزة: ${answers.product}
المستخدمون والمشكلة: ${answers.users}
الميزات والمقاييس: ${answers.features}

يجب أن تتضمن الوثيقة:
- ملخص تنفيذي واضح
- تعريف المشكلة والفرصة
- أهداف قابلة للقياس ومؤشرات نجاح
- ميزات مُرتبة بالأولوية (MoSCoW)
- متطلبات تقنية أساسية
- مخاطر وخطط التخفيف
- خطة إطلاق مرحلية

اكتب بالعربية واستخدم تنسيق احترافي.`
      : `Create a comprehensive Product Requirements Document based on:

Product/Feature: ${answers.product}
Users & Problem: ${answers.users}
Features & Metrics: ${answers.features}

Include:
- Clear executive summary
- Problem statement and opportunity
- Measurable goals and success metrics
- Prioritized features (MoSCoW method)
- Core technical requirements
- Risks and mitigation strategies
- Phased launch plan

Use professional formatting and industry best practices.`;

    return this.callClaude(prompt, systemPrompt, context);
  }

  async generatePrototype(
    prdContent: string,
    requirements?: {
      framework?: string;
      style?: string;
      complexity?: 'simple' | 'moderate' | 'advanced';
    },
    context?: ContextMemory
  ): Promise<AIResponse> {
    const systemPrompt = `You are an expert frontend developer and UX designer. Create production-ready, responsive HTML prototypes with modern design principles, accessibility features, and interactive functionality.`;

    const prompt = `Create a complete, responsive HTML prototype based on this PRD:

${prdContent}

Requirements:
- Framework: ${requirements?.framework || 'Vanilla HTML/CSS/JS'}
- Style: ${requirements?.style || 'Modern, professional'}
- Complexity: ${requirements?.complexity || 'moderate'}

The prototype should:
- Be fully self-contained (single HTML file)
- Include responsive design (mobile-first)
- Have interactive functionality with JavaScript
- Follow modern design principles and accessibility standards
- Include proper semantic HTML structure
- Use CSS Grid/Flexbox for layout
- Have smooth animations and transitions
- Include placeholder content that demonstrates the core features

Generate clean, well-commented code that could serve as a starting point for development.`;

    return this.callClaude(prompt, systemPrompt, context);
  }

  // Smart assistance methods
  async getNextStepSuggestions(currentStage: string, context?: ContextMemory): Promise<AIResponse> {
    const systemPrompt = `You are an innovation mentor providing strategic guidance. Analyze the current progress and suggest specific, actionable next steps that will maximize success.`;

    const prompt = `Based on the current stage "${currentStage}" and previous work, suggest 3-4 specific next steps that would be most valuable to focus on next.

Consider:
- What typically comes next in successful innovation projects
- Common pitfalls to avoid at this stage
- Opportunities to validate assumptions
- Ways to build momentum and maintain progress

Provide actionable, specific recommendations with brief explanations of why each step is important.`;

    return this.callClaude(prompt, systemPrompt, context);
  }

  async improveContent(
    content: string,
    improvementType: 'clarity' | 'engagement' | 'technical' | 'persuasive',
    language: 'en' | 'ar' = 'en'
  ): Promise<AIResponse> {
    const systemPrompt = `You are an expert editor and content strategist. Improve the given content while maintaining its core message and intent.`;

    const improvements = {
      clarity: 'Make this content clearer, more concise, and easier to understand',
      engagement: 'Make this content more engaging, compelling, and memorable',
      technical: 'Enhance the technical accuracy and detail of this content',
      persuasive: 'Make this content more persuasive and action-oriented'
    };

    const prompt = `${improvements[improvementType]} while preserving its core message:

${content}

${language === 'ar' ? 'اكتب بالعربية' : 'Respond in English'} and maintain the same general structure and tone.`;

    return this.callClaude(prompt, systemPrompt);
  }
}

export default AIService;
