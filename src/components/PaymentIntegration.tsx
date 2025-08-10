import { AlertCircle, CheckCircle, CreditCard, Loader } from 'lucide-react';
import React, { useState } from 'react';

interface PaymentIntegrationProps {
  amount: number;
  currency: string;
  planName: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}

const translations = {
  en: {
    selectPayment: 'Select Payment Method',
    securePayment: 'Secure Payment Processing',
    processingPayment: 'Processing Payment...',
    paymentSuccess: 'Payment Successful!',
    paymentError: 'Payment Failed',
    retry: 'Retry Payment',
    backToPlans: 'Back to Plans',
    orderSummary: 'Order Summary',
    plan: 'Plan',
    amount: 'Amount',
    currency: 'SAR',
    total: 'Total',
    proceedPayment: 'Proceed to Payment',

    // Payment methods
    stripe: 'International Cards',
    stripeDesc: 'Visa, Mastercard, American Express',
    paypal: 'PayPal',
    paypalDesc: 'Pay with your PayPal account',
    bankTransfer: 'Bank Transfer',
    bankTransferDesc: 'SABB, SNB, Rajhi Bank',
    stcPay: 'STC Pay',
    stcPayDesc: 'Saudi Telecom Company payment',
    mada: 'Mada Card',
    madaDesc: 'Saudi local debit cards',

    // Form fields
    cardNumber: 'Card Number',
    expiryDate: 'MM/YY',
    cvv: 'CVV',
    cardholderName: 'Cardholder Name',
    billingAddress: 'Billing Address',
    payNow: 'Pay Now',

    // Bank transfer info
    bankInfo: 'Bank Transfer Information',
    accountNumber: 'Account Number',
    iban: 'IBAN',
    swiftCode: 'SWIFT Code',
    bankName: 'Bank Name',
    referenceNumber: 'Reference Number',

    // Status messages
    redirecting: 'Redirecting to payment gateway...',
    validating: 'Validating payment...',
    confirmed: 'Payment confirmed successfully!',
    declined: 'Payment was declined. Please try again.',

    // Security
    secureConnection: 'Secure SSL Connection',
    encryptedData: 'Your data is encrypted and secure',
    pciCompliant: 'PCI DSS Compliant'
  },
  ar: {
    selectPayment: 'اختر طريقة الدفع',
    securePayment: 'معالجة دفع آمنة',
    processingPayment: 'جاري معالجة الدفع...',
    paymentSuccess: 'تم الدفع بنجاح!',
    paymentError: 'فشل في الدفع',
    retry: 'إعادة المحاولة',
    backToPlans: 'العودة للخطط',
    orderSummary: 'ملخص الطلب',
    plan: 'الخطة',
    amount: 'المبلغ',
    currency: 'ريال',
    total: 'الإجمالي',
    proceedPayment: 'متابعة الدفع',

    // Payment methods
    stripe: 'البطاقات الدولية',
    stripeDesc: 'فيزا، ماستركارد، أمريكان إكسبرس',
    paypal: 'باي بال',
    paypalDesc: 'ادفع باستخدام حساب PayPal',
    bankTransfer: 'حوالة بنكية',
    bankTransferDesc: 'ساب، الأهلي، الراجحي',
    stcPay: 'STC Pay',
    stcPayDesc: 'دفع شركة الاتصالات السعودية',
    mada: 'بطاقة مدى',
    madaDesc: 'بطاقات الخصم المحلية السعودية',

    // Form fields
    cardNumber: 'رقم البطاقة',
    expiryDate: 'ش/س',
    cvv: 'رمز الأمان',
    cardholderName: 'اسم حامل البطاقة',
    billingAddress: 'عنوان الفوترة',
    payNow: 'ادفع الآن',

    // Bank transfer info
    bankInfo: 'معلومات الحوالة البنكية',
    accountNumber: 'رقم الحساب',
    iban: 'رقم الآيبان',
    swiftCode: 'رمز السويفت',
    bankName: 'اسم البنك',
    referenceNumber: 'الرقم المرجعي',

    // Status messages
    redirecting: 'جاري التوجيه لبوابة الدفع...',
    validating: 'جاري التحقق من الدفع...',
    confirmed: 'تم تأكيد الدفع بنجاح!',
    declined: 'تم رفض الدفع. يرجى المحاولة مرة أخرى.',

    // Security
    secureConnection: 'اتصال SSL آمن',
    encryptedData: 'بياناتك مشفرة وآمنة',
    pciCompliant: 'متوافق مع PCI DSS'
  }
};

const PaymentIntegration: React.FC<PaymentIntegrationProps> = ({
  amount,
  currency,
  planName,
  onSuccess,
  onError,
  language,
  theme
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    phone: ''
  });

  const isRTL = language === 'ar';
  const t = (key: string) => translations[language][key as keyof typeof translations['en']] || key;

  const styles = {
    bg: theme === 'dark' ? 'bg-gray-900' : 'bg-white',
    surface: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    input: theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: t('stripe'),
      icon: '💳',
      description: t('stripeDesc'),
      available: true
    },
    {
      id: 'paypal',
      name: t('paypal'),
      icon: '🅿️',
      description: t('paypalDesc'),
      available: true
    },
    {
      id: 'mada',
      name: t('mada'),
      icon: '🏧',
      description: t('madaDesc'),
      available: true
    },
    {
      id: 'stc-pay',
      name: t('stcPay'),
      icon: '📱',
      description: t('stcPayDesc'),
      available: true
    },
    {
      id: 'bank-transfer',
      name: t('bankTransfer'),
      icon: '🏦',
      description: t('bankTransferDesc'),
      available: true
    }
  ];

  const handlePayment = async () => {
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate different payment methods
      switch (selectedMethod) {
        case 'stripe':
          await processStripePayment();
          break;
        case 'paypal':
          await processPayPalPayment();
          break;
        case 'mada':
          await processMadaPayment();
          break;
        case 'stc-pay':
          await processSTCPayment();
          break;
        case 'bank-transfer':
          await processBankTransfer();
          break;
        default:
          throw new Error('Payment method not selected');
      }

      setPaymentStatus('success');
      onSuccess(`payment_${Date.now()}`);
    } catch (error) {
      setPaymentStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Payment failed';
      setErrorMessage(errorMsg);
      onError(errorMsg);
    }
  };

  const processStripePayment = async () => {
    // Simulate Stripe payment processing
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
      throw new Error('Please fill in all card details');
    }
    // In real implementation, integrate with Stripe API
    console.log('Processing Stripe payment...');
  };

  const processPayPalPayment = async () => {
    // Simulate PayPal redirect
    console.log('Redirecting to PayPal...');
    // In real implementation, redirect to PayPal
  };

  const processMadaPayment = async () => {
    // Simulate Mada payment processing
    console.log('Processing Mada payment...');
    // In real implementation, integrate with Saudi payment gateway
  };

  const processSTCPayment = async () => {
    // Simulate STC Pay processing
    console.log('Processing STC Pay...');
    // In real implementation, integrate with STC Pay API
  };

  const processBankTransfer = async () => {
    // Simulate bank transfer instructions
    console.log('Generating bank transfer instructions...');
    // In real implementation, generate transfer details
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  if (paymentStatus === 'success') {
    return (
      <div className={`p-8 rounded-2xl ${styles.surface} border ${styles.border} text-center`} dir={isRTL ? 'rtl' : 'ltr'}>
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h3 className="text-2xl font-bold mb-4 text-green-600">{t('paymentSuccess')}</h3>
        <p className={`${styles.textMuted} mb-6`}>
          Your payment for {planName} has been processed successfully.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg hover:scale-105 transition font-medium"
        >
          Continue to Dashboard
        </button>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className={`p-8 rounded-2xl ${styles.surface} border ${styles.border} text-center`} dir={isRTL ? 'rtl' : 'ltr'}>
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h3 className="text-2xl font-bold mb-4 text-red-600">{t('paymentError')}</h3>
        <p className={`${styles.textMuted} mb-6`}>{errorMessage}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setPaymentStatus('idle')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition font-medium"
          >
            {t('retry')}
          </button>
          <button
            onClick={() => window.history.back()}
            className={`border-2 ${styles.border} px-6 py-3 rounded-lg ${styles.hover} transition font-medium`}
          >
            {t('backToPlans')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className={`${styles.surface} p-6 rounded-2xl border ${styles.border} h-fit`}>
          <h3 className="text-xl font-semibold mb-6">{t('orderSummary')}</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={styles.textMuted}>{t('plan')}</span>
              <span className="font-medium">{planName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className={styles.textMuted}>{t('amount')}</span>
              <span className="font-medium">{formatAmount(amount)}</span>
            </div>

            <hr className={`border-t ${styles.border}`} />

            <div className="flex justify-between items-center text-lg font-semibold">
              <span>{t('total')}</span>
              <span>{formatAmount(amount)}</span>
            </div>
          </div>

          {/* Security badges */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t('secureConnection')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t('encryptedData')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{t('pciCompliant')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Form */}
        <div className="lg:col-span-2">
          <div className={`${styles.surface} p-6 rounded-2xl border ${styles.border}`}>
            <h3 className="text-xl font-semibold mb-6">{t('selectPayment')}</h3>

            {/* Payment Method Selection */}
            <div className="space-y-3 mb-8">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  disabled={!method.available}
                  className={`w-full p-4 rounded-xl border-2 transition text-left ${
                    selectedMethod === method.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : `${styles.border} ${styles.hover}`
                  } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{method.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{method.name}</div>
                      <div className={`text-sm ${styles.textMuted}`}>{method.description}</div>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Payment Form */}
            {selectedMethod && (selectedMethod === 'stripe' || selectedMethod === 'mada') && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('cardNumber')}</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                    className={`w-full p-3 rounded-lg border ${styles.input} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('expiryDate')}</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className={`w-full p-3 rounded-lg border ${styles.input} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('cvv')}</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                      className={`w-full p-3 rounded-lg border ${styles.input} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('cardholderName')}</label>
                  <input
                    type="text"
                    placeholder="Ahmed Mohammed"
                    value={formData.cardholderName}
                    onChange={(e) => setFormData({...formData, cardholderName: e.target.value})}
                    className={`w-full p-3 rounded-lg border ${styles.input} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>
              </div>
            )}

            {/* Bank Transfer Instructions */}
            {selectedMethod === 'bank-transfer' && (
              <div className={`p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-6`}>
                <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-200">{t('bankInfo')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600 dark:text-blue-300">{t('bankName')}:</span>
                    <span>Saudi National Bank (SNB)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 dark:text-blue-300">{t('accountNumber')}:</span>
                    <span>1234567890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 dark:text-blue-300">{t('iban')}:</span>
                    <span>SA1234567890123456789012</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 dark:text-blue-300">{t('referenceNumber')}:</span>
                    <span>SPARK-{Date.now()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={!selectedMethod || paymentStatus === 'processing'}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition ${
                !selectedMethod || paymentStatus === 'processing'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105'
              }`}
            >
              {paymentStatus === 'processing' ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  {t('processingPayment')}
                </div>
              ) : (
                <>
                  <CreditCard className="inline h-5 w-5 mr-2" />
                  {t('payNow')} {formatAmount(amount)}
                </>
              )}
            </button>

            <p className={`text-xs ${styles.textMuted} text-center mt-4`}>
              {t('securePayment')} • {t('encryptedData')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentIntegration;
