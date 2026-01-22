
import { loadStripe } from "@stripe/stripe-js";
import { supabaseAnonKey } from "./supabase";

/**
 * World-class Stripe Integration Service
 * LIVE PRODUCTION READY - Optimized for Supabase Edge Functions
 */

const STRIPE_PUBLIC_KEY = 'pk_live_51SniITE2L8ivtB2lKS9WXBtmNeu0AE8KOghxxyhsaOs5nMVZDCdbYARSj0153JDSYilZ95Wg5ZfevFY0yEEKWIbs00ouFzElpM'; 
const SUPABASE_FUNCTION_URL = 'https://aztmkdjjetcuqpndzclx.supabase.co/functions/v1/rapid-service';

export interface StripeSessionResponse {
  url?: string;
  sessionId?: string;
  error?: string;
}

export const stripeService = {
  async createCheckoutSession(priceId: string, email: string): Promise<StripeSessionResponse> {
    try {
      console.log(`[Stripe] Aanvraag versturen naar: ${SUPABASE_FUNCTION_URL}`);
      
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          action: 'create-checkout',
          priceId,
          email,
          origin: window.location.origin
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && data.error.includes("API key")) {
          throw new Error("STRIPE_SECRET_KEY ontbreekt in Supabase Secrets. Voeg deze toe in Project Settings -> Edge Functions.");
        }
        throw new Error(data.error || `Server fout: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error("[Stripe] Checkout Fout:", error.message);
      throw error;
    }
  },

  async createPortalSession(customerId: string): Promise<StripeSessionResponse> {
    if (!customerId) throw new Error("Geen geldig Stripe klant-ID gevonden.");

    try {
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          action: 'create-portal-session',
          customerId,
          origin: window.location.origin
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Kon portaal niet laden');
      return data;
    } catch (error: any) {
      console.error("[Stripe] Portaal Fout:", error.message);
      throw error;
    }
  },

  async redirectToCheckout(session: StripeSessionResponse) {
    if (session.url) {
      window.location.href = session.url;
    } else {
      throw new Error("Geen checkout URL ontvangen van de server.");
    }
  }
};
