import { PaymentProvider } from '../provider.interface';
import { PaymentProviderCode } from '../types';
import { BankTransferPaymentProvider } from './bank-transfer.provider';
import { CinetPayPaymentProvider } from './cinetpay.provider';
import { FlutterwavePaymentProvider } from './flutterwave.provider';
import { PayDunyaPaymentProvider } from './paydunya.provider';
import { StripePaymentProvider } from './stripe.provider';

const providersRegistry: Record<PaymentProviderCode, PaymentProvider> = {
  STRIPE: new StripePaymentProvider(),
  BANK_TRANSFER: new BankTransferPaymentProvider(),
  CINETPAY: new CinetPayPaymentProvider(),
  FLUTTERWAVE: new FlutterwavePaymentProvider(),
  PAYDUNYA: new PayDunyaPaymentProvider(),
};

export function getPaymentProvider(code: PaymentProviderCode): PaymentProvider {
  const provider = providersRegistry[code];
  if (!provider) {
    throw new Error(`Prestataire de paiement inconnu : ${code}`);
  }
  return provider;
}

export function getAllPaymentProviders(): PaymentProvider[] {
  return Object.values(providersRegistry);
}
