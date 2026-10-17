import {
  CreatePaymentInput,
  CreatePaymentOutput,
  PaymentProviderCode,
  RefundInput,
  RefundOutput,
  VerifyPaymentOutput,
  WebhookResult,
} from './types';

/**
 * Interface commune obligatoire pour tous les prestataires de paiement
 * (Stripe, Virement Bancaire RIB, CinetPay, Flutterwave, PayDunya).
 */
export interface PaymentProvider {
  readonly code: PaymentProviderCode;
  readonly displayName: string;

  /**
   * Indique si le prestataire dispose de ses variables d'environnement requises.
   */
  isConfigured(): boolean;

  /**
   * Initialise un paiement ou un abonnement auprès du prestataire.
   * Retourne soit un clientSecret (Stripe Payment Element), soit des coordonnées RIB,
   * soit une URL de paiement Mobile Money.
   */
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput>;

  /**
   * Vérifie l'état réel d'un paiement directement auprès du serveur du prestataire.
   */
  verifyPayment(providerPaymentId: string, orderReference?: string): Promise<VerifyPaymentOutput>;

  /**
   * Traite un événement Webhook entrant après vérification de la signature cryptographique.
   */
  handleWebhook(rawBody: string, headers: Record<string, string | null>): Promise<WebhookResult>;

  /**
   * Déclenche un remboursement total ou partiel d'une commande payée.
   */
  refund(input: RefundInput): Promise<RefundOutput>;
}
