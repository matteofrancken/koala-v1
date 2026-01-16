
import { User, GeneratedResponse } from '../types';
import { supabase } from './supabase';

/**
 * KOALA ROBUST BACKEND SERVICE
 * Voorkomt crashes bij volle localStorage en zorgt voor betrouwbare cloud sync.
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
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn("LocalStorage is vol, we vertrouwen nu op de Cloud.");
  }
};

export const backendService = {
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
          businessVibeUrl: data.business_vibe_url || '',
          onboardingCompleted: Boolean(data.onboarding_completed),
          plan: data.plan,
          responsesUsed: Number(data.responses_used || 0),
          maxResponses: Number(data.max_responses || 10),
          timeSaved: Number(data.time_saved || 0),
          lastResetMonth: data.last_reset_month,
          createdAt: data.created_at
        } as any;

        // Sync local naar cloud als cloud leeg is (voor de foto)
        if (localUser?.businessVibeUrl && !cloudUser.businessVibeUrl) {
           cloudUser.businessVibeUrl = localUser.businessVibeUrl;
           this.saveUser(cloudUser); 
        }

        setLocalData(DB_KEYS.USERS, [...localUsers.filter(u => u.email !== cleanEmail), cloudUser]);
        return cloudUser;
      }
    } catch (e) {
      console.warn("Supabase fetch failed, falling back to local storage");
    }

    return localUser;
  },

  async saveUser(user: User, skipCloud = false): Promise<void> {
    const cleanEmail = user.email.toLowerCase().trim();
    if (!cleanEmail) return;

    const localUsers = getLocalData<User[]>(DB_KEYS.USERS, []);
    const filtered = localUsers.filter(u => u.email.toLowerCase() !== cleanEmail);
    setLocalData(DB_KEYS.USERS, [...filtered, user]);

    if (skipCloud) return;

    try {
      const payload = {
        id: user.id,
        email: cleanEmail,
        username: user.fullName || '', 
        password: user.password || '', 
        business_name: user.businessName || '',
        business_vibe_url: user.businessVibeUrl || '',
        onboarding_completed: user.onboardingCompleted || false,
        plan: user.plan || 'Gratis',
        responses_used: user.responsesUsed || 0,
        max_responses: user.maxResponses || 10,
        time_saved: user.timeSaved || 0,
        last_reset_month: user.lastResetMonth || '',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('users').upsert(payload, { onConflict: 'email' });
      
      if (error) {
        if (error.message.includes('fetch')) {
          console.error("❌ Verbindingsfout: Controleer of je project in Supabase niet gepauzeerd is of check je internet.");
        } else {
          console.error("❌ Supabase Sync Error:", error.message);
        }
      } else {
        console.log("✅ Gegevens succesvol gesynchroniseerd met Supabase");
      }
    } catch (e) {
      console.error("Cloud connection error during saveUser:", e);
    }
  },

  async deleteAccount(userId: string, email: string): Promise<void> {
    const cleanEmail = email.toLowerCase().trim();
    try {
      await supabase.from('history').delete().eq('user_id', userId);
      await supabase.from('users').delete().eq('id', userId);
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Cloud deletion partially failed", e);
    }

    const localUsers = getLocalData<User[]>(DB_KEYS.USERS, []);
    setLocalData(DB_KEYS.USERS, localUsers.filter(u => u.email.toLowerCase() !== cleanEmail));
    localStorage.removeItem('koala_session_email');
  },

  async getHistory(userId: string): Promise<GeneratedResponse[]> {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted: GeneratedResponse[] = data.map(item => ({
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
          visualUrl: item.visual_url, // Toegevoegd voor Nano Banana
          createdAt: item.created_at
        }));
        setLocalData(DB_KEYS.HISTORY, formatted);
        return formatted;
      }
    } catch (e) {}

    const localHistory = getLocalData<GeneratedResponse[]>(DB_KEYS.HISTORY, []);
    return localHistory.filter(h => h.userId === userId);
  },

  async addToHistory(item: GeneratedResponse): Promise<void> {
    const localHistory = getLocalData<GeneratedResponse[]>(DB_KEYS.HISTORY, []);
    const filtered = localHistory.filter(h => h.id !== item.id);
    setLocalData(DB_KEYS.HISTORY, [item, ...filtered]);

    try {
      const { error } = await supabase.from('history').upsert({
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
        visual_url: item.visualUrl, // Toegevoegd voor Nano Banana
        created_at: item.createdAt
      });
      if (!error) console.log("✅ Historiek item gesynchroniseerd met Supabase");
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
