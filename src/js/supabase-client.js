// Flowers of Quran - Supabase Cloud Sync & Authentication Manager

const SUPABASE_CONFIG = {
  url: "https://mpdpebcmdpozfsgukxww.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZHBlYmNtZHBvemZzZ3VreHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MzA5NDksImV4cCI6MjEwMzMwNjk0OX0.vN4Gzpm5ritKLlL-lHKGd9fd6hwkcKR76Lb6ADduGGU"
};

class SupabaseSyncManager {
  constructor() {
    this.initialized = false;
    this.currentUser = null;
    this.client = null;
    this.onAuthChanged = null;
  }

  init(onAuthChangedCallback) {
    this.onAuthChanged = onAuthChangedCallback;
    try {
      if (typeof window.supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        this.client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
        this.initialized = true;

        // Check active session or cached phone user on startup
        this.client.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            this.currentUser = session.user;
          } else {
            const cached = localStorage.getItem('quran_user_logged_in');
            if (cached) {
              try {
                const u = JSON.parse(cached);
                if (u.phone) {
                  this.currentUser = {
                    id: 'phone_' + u.phone.replace(/\+/g, ''),
                    phone: u.phone,
                    user_metadata: { name: u.name || '' }
                  };
                }
              } catch(e){}
            }
          }
          if (this.onAuthChanged) this.onAuthChanged(this.currentUser);
        });

        // Listen for auth state changes (login, logout, token refresh, password recovery)
        this.client.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            this.currentUser = session.user;
            if (this.onAuthChanged) this.onAuthChanged(this.currentUser);
          }
        });
      } else {
        console.warn("Supabase SDK not found or config missing. Running in local mode.");
      }
    } catch (e) {
      console.error("Supabase initialization error:", e);
    }
  }

  formatPhoneNumber(phone) {
    if (!phone) return "";
    let cleaned = String(phone).trim().replace(/[\s\-\(\)]/g, '');
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      if (/^\d{10}$/.test(cleaned)) {
        cleaned = '+91' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }
    return cleaned;
  }

  // Direct Phone Access with Real Supabase Auth & Database Syncing
  async loginWithPhone(countryCode, phoneNumber, metadata = {}, authMode = 'login') {
    const rawNum = String(phoneNumber || '').trim().replace(/\D/g, '');
    const code = String(countryCode || '+91').trim();

    if (!rawNum) {
      throw new Error("Please enter your phone number.");
    }

    if (code === '+91' && rawNum.length !== 10) {
      throw new Error("For +91 (India), please enter a valid 10-digit mobile number.");
    } else if (rawNum.length < 6 || rawNum.length > 12) {
      throw new Error("Please enter a valid mobile number (6 to 12 digits).");
    }

    const fullPhone = code + rawNum;
    const cleanDigits = fullPhone.replace(/\+/g, '');
    const authEmail = `${cleanDigits}@phone.quran`;
    const authPass = `PhoneUser@${cleanDigits}`;

    let authUser = null;

    if (this.initialized && this.client) {
      if (authMode === 'login') {
        const { data: signInData, error: signInErr } = await this.client.auth.signInWithPassword({
          email: authEmail,
          password: authPass
        });
        if (signInErr || !signInData?.user) {
          throw new Error("Incorrect number or please register now.");
        }
        authUser = signInData.user;
      } else {
        const { data: signUpData, error: signUpErr } = await this.client.auth.signUp({
          email: authEmail,
          password: authPass,
          options: {
            data: {
              name: metadata.name || '',
              phone: fullPhone,
              age: metadata.age ? parseInt(metadata.age, 10) : null,
              gender: metadata.gender || ''
            }
          }
        });
        if (signUpErr) {
          throw new Error(signUpErr.message || "Number already registered. Please sign in.");
        }
        authUser = signUpData.user;
      }

      // 3. Upsert profile metadata in Supabase public.profiles table
      if (authUser) {
        try {
          const profilePayload = {
            id: authUser.id,
            // Removed email field as requested
            phone: fullPhone,
            name: metadata.name || authUser.user_metadata?.name || '',
            age: metadata.age ? parseInt(metadata.age, 10) : (authUser.user_metadata?.age || null),
            gender: metadata.gender || authUser.user_metadata?.gender || '',
            updated_at: new Date().toISOString()
          };

          const { error: upsertErr } = await this.client.from('profiles').upsert(profilePayload, { onConflict: 'id' });
          if (upsertErr) {
            // If phone column doesn't exist yet in Supabase table, fallback safely
            delete profilePayload.phone;
            await this.client.from('profiles').upsert(profilePayload, { onConflict: 'id' });
          }
        } catch (upsertErr) {
          console.log("Supabase profile sync note:", upsertErr);
        }
      }
    }

    if (!authUser) {
      authUser = {
        id: 'phone_' + cleanDigits,
        email: authEmail,
        phone: fullPhone,
        user_metadata: {
          name: metadata.name || '',
          phone: fullPhone,
          age: metadata.age || null,
          gender: metadata.gender || ''
        }
      };
    } else {
      authUser.phone = fullPhone;
    }

    this.currentUser = authUser;
    localStorage.setItem('quran_user_logged_in', JSON.stringify({
      phone: fullPhone,
      email: authEmail,
      name: metadata.name || authUser.user_metadata?.name || ''
    }));

    if (this.onAuthChanged) this.onAuthChanged(this.currentUser);
    return authUser;
  }

  // Send Direct Supabase SMS OTP to Phone Number
  async sendPhoneOtp(phone, metadata = {}) {
    if (!this.initialized || !this.client) throw new Error("Supabase is not initialized.");
    const formattedPhone = this.formatPhoneNumber(phone);
    if (!formattedPhone || formattedPhone.length < 8) {
      throw new Error("Please enter a valid phone number with country code (e.g. +91 98765 43210).");
    }

    const { data, error } = await this.client.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        data: {
          name: metadata.name || '',
          age: metadata.age ? parseInt(metadata.age, 10) : null,
          gender: metadata.gender || ''
        }
      }
    });

    if (error) throw error;
    return { data, formattedPhone };
  }

  // Verify Supabase Phone OTP Code & Authenticate
  async verifyPhoneOtp(phone, token, metadata = {}) {
    if (!this.initialized || !this.client) throw new Error("Supabase is not initialized.");
    const formattedPhone = this.formatPhoneNumber(phone);
    if (!token || !token.trim()) {
      throw new Error("Please enter the 6-digit OTP code sent to your phone.");
    }

    const { data, error } = await this.client.auth.verifyOtp({
      phone: formattedPhone,
      token: token.trim(),
      type: 'sms'
    });

    if (error) throw error;
    this.currentUser = data.user;

    // Resilient profile upsert upon successful OTP verification
    if (data.user) {
      try {
        const profilePayload = {
          id: data.user.id,
          phone: formattedPhone,
          name: metadata.name || data.user.user_metadata?.name || '',
          age: metadata.age ? parseInt(metadata.age, 10) : (data.user.user_metadata?.age ? parseInt(data.user.user_metadata.age, 10) : null),
          gender: metadata.gender || data.user.user_metadata?.gender || '',
          updated_at: new Date().toISOString()
        };

        if (data.user.email) profilePayload.email = data.user.email;

        await this.client.from('profiles').upsert(profilePayload, { onConflict: 'id' });
      } catch (upsertErr) {
        console.log("Profile auto-upsert note after OTP verify:", upsertErr);
      }
    }

    return data;
  }

  async logout() {
    if (!this.initialized || !this.client) return;
    const { error } = await this.client.auth.signOut();
    if (error) console.error("Sign out error:", error);
    this.currentUser = null;
  }

  // Fetch only this module's progress without touching other apps
  async fetchProgress(userId, moduleKey = 'flowers_progress') {
    if (!this.initialized || !this.client || !userId) return null;
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select(moduleKey)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching ${moduleKey}:`, error);
        return null;
      }

      return data ? data[moduleKey] : null;
    } catch (e) {
      console.error("fetchProgress error:", e);
      return null;
    }
  }

  // Save only this module's progress without overwriting other apps
  async saveProgress(userId, moduleKey = 'flowers_progress', progressData) {
    if (!this.initialized || !this.client || !userId) return;
    try {
      const payload = {
        id: userId,
        [moduleKey]: progressData,
        updated_at: new Date().toISOString()
      };

      if (this.currentUser?.phone) {
        payload.phone = this.currentUser.phone;
      }

      const { error } = await this.client
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error(`Error saving ${moduleKey}:`, error);
      }
    } catch (e) {
      console.error("saveProgress error:", e);
    }
  }
}

window.cloudSync = new SupabaseSyncManager();
