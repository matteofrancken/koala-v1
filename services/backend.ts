
import { User, GeneratedResponse } from '../types';
import { supabase } from './supabase';

/**
 * KOALA SILENT BACKEND SERVICE
 * Werkt 100% lokaal als de cloud (Supabase) onbereikbaar is.
 * Geen storende foutmeldingen bij netwerkproblemen.
 */

const DB_KEYS = {
  USERS: 'koala_users_db',
  HISTORY: 'koala_history_db',
  CURRENT_USER: 'koala_session_email'
};

const getLocalData = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    return fallback;
  }
};

const setLocalData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const backendService = {
  /**
   * Haalt gebruiker op. Probeert cloud, maar valt direct en geruisloos terug op local.
   */
  async getUser(email: string): Promise<User | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return null;
    
    const localUsers = getLocalData<User[]>(DB_KEYS.USERS, []);
    const localUser = localUsers.find(u => u.email.toLowerCase() === cleanEmail) || null;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (!error && data) {
        const cloudUser: User = {
          id: data.id,
          email: data.email,
          fullName: data.username || '',
          password: data.password || '',
          businessName: data.business_name || '',
          onboardingCompleted: Boolean(data.onboarding_completed),
          plan: data.plan,
          responsesUsed: Number(data.responses_used || 0),
          maxResponses: Number(data.max_responses || 10),
          timeSaved: Number(data.time_saved || 0),
          lastResetMonth: data.last_reset_month,
          createdAt: data.created_at
        };
        this.saveUser(cloudUser, true); 
        return cloudUser;
      }
    } catch (e) {
      // Stilzwijgend negeren van netwerkfouten
    }

    return localUser;
  },

  /**
   * Slaat gebruiker op. Eerst lokaal, dan cloud op de achtergrond.
   */
  async saveUser(user: User, skipCloud = false): Promise<void> {
    const cleanEmail = user.email.toLowerCase().trim();
    if (!cleanEmail) return;

    // ALTIJD LOKAAL EERST
    const localUsers = getLocalData<User[]>(DB_KEYS.USERS, []);
    const filtered = localUsers.filter(u => u.email.toLowerCase() !== cleanEmail);
    setLocalData(DB_KEYS.USERS, [...filtered, { ...user, email: cleanEmail }]);

    if (skipCloud) return;

    // CLOUD SYNC (STIL)
    try {
      const payload = {
        id: user.id,
        email: cleanEmail,
        password: user.password,
        username: user.fullName, 
        business_name: user.businessName,
        onboarding_completed: user.onboardingCompleted,
        plan: user.plan,
        responses_used: user.responsesUsed,
        max_responses: user.maxResponses,
        time_saved: user.timeSaved,
        // Fix: Use camelCase lastResetMonth as defined in User interface
        last_reset_month: user.lastResetMonth,
        updated_at: new Date().toISOString()
      };

      await supabase.from('users').upsert(payload, { onConflict: 'email' });
    } catch (e) {
      // Geen meldingen tonen, de data staat lokaal veilig.
    }
  },

  /**
   * Verwijdert het volledige account en alle bijbehorende data uit Supabase en LocalStorage.
   */
  async deleteAccount(userId: string, email: string): Promise<void> {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Cloud verwijderen
    try {
      // Verwijder eerst de data in de publieke tabellen
      await supabase.from('history').delete().eq('user_id', userId);
      await supabase.from('users').delete().eq('id', userId);

      /**
       * BELANGRIJK: Om de gebruiker ook uit 'auth.users' te verwijderen vanaf de client,
       * moet je deze SQL functie aanmaken in je Supabase Dashboard SQL Editor:
       * 
       * create or replace function delete_own_user()
       * returns void
       * language plpgsql
       * security definer
       * set search_path = public
       * as $$
       * begin
       *   delete from auth.users where id = auth.uid();
       * end;
       * $$;
       */
      await supabase.rpc('delete_own_user');
      
      // Log de gebruiker ook uit bij Supabase Auth
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Cloud deletion partially failed, continuing with local cleanup:", e);
    }

    // 2. Lokaal opschonen
    const localUsers = getLocalData<User[]>(DB_KEYS.USERS, []);
    setLocalData(DB_KEYS.USERS, localUsers.filter(u => u.email.toLowerCase() !== cleanEmail));
    
    const localHistory = getLocalData<GeneratedResponse[]>(DB_KEYS.HISTORY, []);
    setLocalData(DB_KEYS.HISTORY, localHistory.filter(h => h.userId !== userId));
    
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
    localStorage.removeItem('koala_session_email');
  },

  async getHistory(userId: string): Promise<GeneratedResponse[]> {
    if (!userId) return [];
    
    const localHistory = getLocalData<GeneratedResponse[]>(DB_KEYS.HISTORY, []);
    const userLocalHistory = localHistory.filter(h => h.userId === userId);

    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
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
          createdAt: item.created_at
        }));
      }
    } catch (e) {}

    return userLocalHistory.sort((a,b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async addToHistory(item: GeneratedResponse): Promise<void> {
    const localHistory = getLocalData<GeneratedResponse[]>(DB_KEYS.HISTORY, []);
    setLocalData(DB_KEYS.HISTORY, [item, ...localHistory]);

    try {
      await supabase.from('history').insert({
        id: item.id,
        user_id: item.userId,
        original_message: item.originalMessage,
        // Fix: accessing property using camelCase to match GeneratedResponse type
        ai_response_a: item.aiResponseA,
        // Fix: accessing property using camelCase to match GeneratedResponse type
        ai_response_b: item.aiResponseB,
        tone: item.tone,
        length: item.length,
        intent: item.intent,
        emotion: item.emotion,
        urgency: item.urgency,
        created_at: item.createdAt
      });
    } catch (e) {}
  },

  async deleteFromHistory(id: string): Promise<void> {
    const localHistory = getLocalData<GeneratedResponse[]>(DB_KEYS.HISTORY, []);
    setLocalData(DB_KEYS.HISTORY, localHistory.filter(h => h.id !== id));
    try {
      await supabase.from('history').delete().eq('id', id);
    } catch (e) {}
  }
};
