
import { loadStripe } from "@stripe/stripe-js";
import { PLANS } from "../constants";

/**
 * World-class Stripe Integration Service
 */

const STRIPE_PUBLIC_KEY = 'pk_test_51SniIaCbUGYN5zBL9Swph2CRpkvLYv98q9I38XPtpcfEUONG2K5Hd3BAtE72gt8qeNjNgYuBVsBIFqiq6CEsqAre00OgtiYBp7'; 

export interface StripeSessionResponse {
  url?: string;
  sessionId: string;
}

export const stripeService = {
  async createCheckoutSession(priceId: string, email: string): Promise<StripeSessionResponse> {
    console.log(`[Stripe] Sessie aanvragen voor ${email} met priceId ${priceId}...`);

    try {
      const mockSession = {
        sessionId: `cs_test_${Math.random().toString(36).substring(7)}`,
        url: `#/stripe-checkout?plan=${priceId}&email=${encodeURIComponent(email)}`
      };

      return mockSession;
    } catch (error: any) {
      console.error("[Stripe Service Error]", error);
      throw new Error(`Betaalfout: ${error.message}`);
    }
  },

  async redirectToCheckout(session: StripeSessionResponse) {
    if (session.url) {
      if (session.url.startsWith('#')) {
        window.location.hash = session.url;
      } else {
        window.location.href = session.url;
      }
      return;
    }

    const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
    if (!stripe) {
      throw new Error("Stripe kon niet worden geladen.");
    }

    const { error } = await (stripe as any).redirectToCheckout({
      sessionId: session.sessionId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
};
