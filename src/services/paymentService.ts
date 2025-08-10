import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'stc_pay' | 'mada' | 'apple_pay' | 'google_pay';
  icon: string;
  available: boolean;
  fees?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  featuresAr: string[];
  popular?: boolean;
  description: string;
  descriptionAr: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  paymentMethod: string;
}

export class PaymentService {
  private stripe: any = null;

  constructor() {
    this.initializeStripe();
  }

  private async initializeStripe() {
    this.stripe = await stripePromise;
  }

  // Saudi Arabia Payment Methods
  getAvailablePaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        type: 'card',
        icon: '💳',
        available: true,
        fees: 'No additional fees'
      },
      {
        id: 'stc_pay',
        name: 'STC Pay',
        type: 'stc_pay',
        icon: '📱',
        available: true,
        fees: 'No additional fees'
      },
      {
        id: 'mada',
        name: 'Mada Card',
        type: 'mada',
        icon: '🏦',
        available: true,
        fees: 'Bank fees may apply'
      },
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        type: 'apple_pay',
        icon: '🍎',
        available: this.isApplePayAvailable(),
        fees: 'No additional fees'
      },
      {
        id: 'google_pay',
        name: 'Google Pay',
        type: 'google_pay',
        icon: '📲',
        available: this.isGooglePayAvailable(),
        fees: 'No additional fees'
      }
    ];
  }

  // Pricing Plans in SAR
  getPricingPlans(): PricingPlan[] {
    return [
      {
        id: 'starter',
        name: 'Solo-Prototype Starter',
        nameAr: 'نموذجي المبتدئ',
        price: 99,
        currency: 'SAR',
        period: 'month',
        description: 'Perfect for individual innovators starting their journey',
        descriptionAr: 'مثالي للمبتكرين الأفراد الذين يبدؤون رحلتهم',
        features: [
          '3 Innovation Projects',
          'AI-Powered Idea Generation',
          'Basic PRD Templates',
          'Email Support',
          'Mobile App Access'
        ],
        featuresAr: [
          '3 مشاريع ابتكارية',
          'توليد الأفكار بالذكاء الاصطناعي',
          'قوالب PRD أساسية',
          'دعم البريد الإلكتروني',
          'الوصول للتطبيق المحمول'
        ]
      },
      {
        id: 'professional',
        name: 'Solo-Prototype Pro',
        nameAr: 'نموذجي المحترف',
        price: 199,
        currency: 'SAR',
        period: 'month',
        description: 'Advanced features for serious innovators',
        descriptionAr: 'ميزات متقدمة للمبتكرين الجادين',
        features: [
          'Unlimited Innovation Projects',
          'Advanced AI Assistant',
          'Custom PRD Templates',
          'Priority Support',
          'Analytics Dashboard',
          'Export to Multiple Formats',
          'Team Collaboration (3 members)'
        ],
        featuresAr: [
          'مشاريع ابتكارية غير محدودة',
          'مساعد ذكي متقدم',
          'قوالب PRD مخصصة',
          'دعم ذو أولوية',
          'لوحة التحليلات',
          'التصدير لصيغ متعددة',
          'تعاون الفريق (3 أعضاء)'
        ],
        popular: true
      },
      {
        id: 'enterprise',
        name: 'Solo-UltimatePro',
        nameAr: 'نموذجي المثالي',
        price: 399,
        currency: 'SAR',
        period: 'month',
        description: 'Complete innovation ecosystem for organizations',
        descriptionAr: 'نظام ابتكاري متكامل للمؤسسات',
        features: [
          'Everything in Pro',
          'Unlimited Team Members',
          'Advanced Analytics',
          'Custom Integrations',
          'Dedicated Account Manager',
          '24/7 Phone Support',
          'Custom Training',
          'API Access',
          'White-label Options'
        ],
        featuresAr: [
          'كل ما في المحترف',
          'أعضاء فريق غير محدودين',
          'تحليلات متقدمة',
          'تكاملات مخصصة',
          'مدير حساب مخصص',
          'دعم هاتفي 24/7',
          'تدريب مخصص',
          'الوصول لواجهة برمجة التطبيقات',
          'خيارات العلامة البيضاء'
        ]
      }
    ];
  }

  // Create Payment Intent for Stripe
  async createPaymentIntent(amount: number, currency: string = 'SAR'): Promise<PaymentIntent> {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          currency: currency.toLowerCase(),
          metadata: {
            product: 'Solo-Prototype',
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return {
        id: data.id,
        amount: amount,
        currency,
        status: 'pending',
        paymentMethod: 'card'
      };
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw new Error('Unable to process payment. Please try again.');
    }
  }

  // Process STC Pay Payment
  async processSTCPayment(amount: number, phoneNumber: string): Promise<PaymentIntent> {
    try {
      // Simulate STC Pay API call
      const response = await fetch('/api/stc-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          phoneNumber,
          currency: 'SAR',
          merchantId: import.meta.env.VITE_STC_MERCHANT_ID
        }),
      });

      if (!response.ok) {
        throw new Error('STC Pay processing failed');
      }

      const data = await response.json();
      return {
        id: data.transactionId,
        amount,
        currency: 'SAR',
        status: data.status,
        paymentMethod: 'stc_pay'
      };
    } catch (error) {
      console.error('STC Pay failed:', error);
      throw new Error('STC Pay transaction failed. Please try again.');
    }
  }

  // Process Mada Payment
  async processMadaPayment(amount: number, cardDetails: any): Promise<PaymentIntent> {
    try {
      const response = await fetch('/api/mada-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          cardDetails,
          currency: 'SAR'
        }),
      });

      if (!response.ok) {
        throw new Error('Mada payment processing failed');
      }

      const data = await response.json();
      return {
        id: data.transactionId,
        amount,
        currency: 'SAR',
        status: data.status,
        paymentMethod: 'mada'
      };
    } catch (error) {
      console.error('Mada payment failed:', error);
      throw new Error('Mada payment failed. Please try again.');
    }
  }

  // Check if Apple Pay is available
  private isApplePayAvailable(): boolean {
    if (typeof window !== 'undefined' && window.ApplePaySession) {
      return ApplePaySession.canMakePayments();
    }
    return false;
  }

  // Check if Google Pay is available
  private isGooglePayAvailable(): boolean {
    if (typeof window !== 'undefined' && window.google?.payments?.api) {
      return true;
    }
    return false;
  }

  // Confirm payment with Stripe
  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<boolean> {
    try {
      if (!this.stripe) {
        await this.initializeStripe();
      }

      const { error } = await this.stripe.confirmCardPayment(paymentIntentId, {
        payment_method: paymentMethodId
      });

      if (error) {
        console.error('Payment confirmation failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return false;
    }
  }

  // Get subscription status
  async getSubscriptionStatus(userId: string): Promise<any> {
    try {
      const response = await fetch(`/api/subscription/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      return await response.json();
    } catch (error) {
      console.error('Subscription status fetch failed:', error);
      return { status: 'inactive', plan: null };
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/subscription/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Subscription cancellation failed:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
