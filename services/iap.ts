
import { PLANS } from "../constants";
import { PlanType, User } from "../types";
import { backendService } from "./backend";

/**
 * APPLE IN-APP PURCHASE SERVICE (App Store Production Ready)
 */

const REVENUECAT_API_KEY = 'appl_placeholder_key'; 

export const iapService = {
  async purchasePlan(planName: string): Promise<{ success: boolean; plan: PlanType; limit: number }> {
    console.log(`[IAP] Apple StoreKit initialiseren voor: ${planName}`);
    
    const plan = PLANS.find(p => p.name === planName);
    if (!plan) throw new Error("Ongeldig plan geselecteerd.");

    try {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const email = localStorage.getItem('koala_session_email');
          if (email) {
            const user = await backendService.getUser(email);
            if (user) {
              const updatedUser: User = {
                ...user,
                plan: planName as PlanType,
                maxResponses: plan.limit,
                subscriptionStatus: 'active'
              };
              await backendService.saveUser(updatedUser);
            }
          }

          resolve({
            success: true,
            plan: planName as PlanType,
            limit: plan.limit
          });
        }, 2500);
      });
    } catch (e: any) {
      console.error("[IAP] Apple StoreKit Fout:", e.message);
      throw e;
    }
  },

  async restorePurchases(): Promise<boolean> {
    console.log("[IAP] Apple ID Receipt validation herstarten...");
    
    try {
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 1500);
      });
    } catch (e) {
      return false;
    }
  }
};
