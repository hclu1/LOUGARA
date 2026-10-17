import { CurrencyCode } from '@/locales/currencies';

export type PaymentProviderCode =
  | 'STRIPE'
  | 'BANK_TRANSFER'
  | 'CINETPAY'
  | 'FLUTTERWAVE'
  | 'PAYDUNYA';

export type PaymentOrderStatusType =
  | 'PENDING'
  | 'WAITING_TRANSFER'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export type PaymentBillingCycleType = 'MONTHLY' | 'ANNUAL' | 'ONE_TIME';

export type PaymentChannelType =
  | 'card'
  | 'apple_pay'
  | 'google_pay'
  | 'link'
  | 'sepa_debit'
  | 'bank_transfer'
  | 'orange_money'
  | 'wave'
  | 'mtn_momo'
  | 'moov_money';

export interface BankTransferDetails {
  holderName: string;
  iban: string;
  bic: string;
  partnerSwift: string;
  bankName: string;
  ownerAddress: string;
  reference: string;
  exactAmountFormatted: string;
  amount: number;
  currency: CurrencyCode;
}

export interface CreatePaymentInput {
  orderId: string;
  reference: string;
  planCode: string;
  planName: string;
  billingCycle: PaymentBillingCycleType;
  amount: number;
  currency: CurrencyCode;
  customerEmail: string;
  customerName?: string;
  companyId?: string;
  companyName?: string;
  countryCode: string;
  paymentMethodType?: PaymentChannelType;
  returnUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentOutput {
  success: boolean;
  provider: PaymentProviderCode;
  orderReference: string;
  status: PaymentOrderStatusType;
  providerPaymentId?: string;
  /** Secret pour le Stripe Payment Element intégré */
  clientSecret?: string;
  /** URL de redirection éventuelle (Checkout ou Mobile Money) */
  redirectUrl?: string;
  /** Coordonnées RIB si virement bancaire manuel */
  bankTransferDetails?: BankTransferDetails;
  /** Message d'erreur ou d'information */
  message?: string;
  /** Indique si le mode est un mode simulation / test sans clé externe */
  isTestSimulation?: boolean;
}

export interface VerifyPaymentOutput {
  verified: boolean;
  status: PaymentOrderStatusType;
  providerPaymentId?: string;
  amount?: number;
  currency?: string;
  paidAt?: Date;
  rawStatus?: string;
}

export interface WebhookResult {
  handled: boolean;
  alreadyProcessed?: boolean;
  eventId: string;
  eventType: string;
  orderReference?: string;
  providerPaymentId?: string;
  newStatus?: PaymentOrderStatusType;
  message?: string;
}

export interface RefundInput {
  orderId: string;
  orderReference: string;
  providerPaymentId?: string;
  amount?: number;
  currency?: CurrencyCode;
  reason?: string;
}

export interface RefundOutput {
  success: boolean;
  refundId?: string;
  status: 'REFUNDED' | 'FAILED';
  message?: string;
}
