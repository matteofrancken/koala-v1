
import { User, GeneratedResponse } from '../types';
import { supabase } from './supabase';

/**
 * KOALA ROBUST BACKEND SERVICE
 * Bevat fallbacks voor database schema-mismatches om PGRST204 errors te voorkomen.
 */

export const backendService = {
  async getUser(email: string): Promise<User | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return null;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (!error && data) {
        // Plan Overrides for specific accounts
        const isUnlimitedUser = cleanEmail === 'matteo.francken@hotmail.com';
        const isProUser = cleanEmail === 'matteo.francken2@hotmail.com';
        const isStarterUser = cleanEmail === 'matteo.francken2@outlook.com';

        let plan = data.plan;
        let maxResponses = Number(data.max_responses || 10);
        let status = data.subscription_status;

        if (isUnlimitedUser) {
          plan = 'Unlimited';
          maxResponses = 999999;
          status = 'active';
        } else if (isProUser) {
          plan = 'Pro';
          maxResponses = 500;
          status = 'active';
        } else if (isStarterUser) {
          plan = 'Starter';
          maxResponses = 100;
          status = 'active';
        }

        return {
          id: data.id,
          email: data.email,
          fullName: data.username || '',
          businessName: data.business_name || '',
          businessVibeUrl: data.business_vibe_url || '',
          onboardingCompleted: Boolean(data.onboarding_completed),
          plan: plan,
          responsesUsed: Number(data.responses_used || 0),
          maxResponses: maxResponses,
          timeSaved: Number(data.time_saved || 0),
          lastResetMonth: data.last_reset_month,
          stripeCustomerId: data.stripe_customer_id,
          subscriptionStatus: status,
          createdAt: data.created_at
        } as User;
      }
    } catch (e) {
      console.error("getUser error", e);
    }
    return null;
  },

  async saveUser(user: User): Promise<void> {
    try {
      const payload = {
        id: user.id,
        email: user.email.toLowerCase().trim(),
        username: user.fullName || '', 
        business_name: user.businessName || '',
        business_vibe_url: user.businessVibeUrl || '',
        onboarding_completed: user.onboardingCompleted || false,
        plan: user.plan || 'Gratis',
        responses_used: user.responsesUsed || 0,
        max_responses: user.maxResponses || 10,
        time_saved: user.timeSaved || 0,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
    } catch (e) {
      console.error("saveUser error", e);
      throw e;
    }
  },

  async getHistory(userId: string): Promise<GeneratedResponse[]> {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        return data.map(item => ({
          id: item.id,
          userId: item.user_id,
          originalMessage: item.original_message,
          aiResponseA: item.ai_response_a,
          aiResponseB: item.ai_response_b,
          tone: item.tone,
          length: item.length,
          intent: item.intent,
          emotion: item.emotion,
          urgency: item.urgency,
          visualUrl: item.visual_url,
          createdAt: item.created_at
        }));
      }
    } catch (e) {
      console.error("getHistory error", e);
    }
    return [];
  },

  async addToHistory(item: GeneratedResponse): Promise<void> {
    const payload: any = {
      id: item.id,
      user_id: item.userId,
      original_message: item.originalMessage,
      ai_response_a: item.aiResponseA,
      ai_response_b: item.aiResponseB,
      tone: item.tone,
      length: item.length,
      intent: item.intent,
      emotion: item.emotion,
      urgency: item.urgency,
      visual_url: item.visualUrl || null,
      created_at: item.createdAt
    };

    try {
      const { error } = await supabase.from('history').insert(payload);
      
      // PGRST204 FALLBACK: Als de kolom visual_url niet bestaat, probeer het zonder.
      if (error) {
        if (error.code === 'PGRST204' || error.message.includes('visual_url')) {
          console.warn("Retrying history insert without visual_url column...");
          const { visual_url, ...cleanPayload } = payload;
          const { error: retryError } = await supabase.from('history').insert(cleanPayload);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }
    } catch (e) {
      console.error("addToHistory fatal error", e);
      throw e;
    }
  },

  async deleteFromHistory(id: string): Promise<void> {
    await supabase.from('history').delete().eq('id', id);
  }
};
