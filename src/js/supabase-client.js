// Shared Supabase authentication; keep this file consistent across the three sites.
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
    this.authInProgress = false;
  }

  init(callback) {
    this.onAuthChanged = callback;
    if (!window.supabase?.createClient) {
      console.error('The sign-in service could not load. Refresh the page to try again.');
      this.publishUser(null);
      return;
    }
    this.client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    this.initialized = true;
    // Defer app callbacks so progress queries do not run inside the Auth lock.
    this.client.auth.onAuthStateChange((event, session) => {
      setTimeout(() => {
        if (!this.authInProgress) this.publishUser(session?.user || null);
      }, 0);
    });
  }

  publishUser(user) {
    const previousId = this.currentUser?.id;
    this.currentUser = user ? { ...user, phone: user.phone || user.user_metadata?.phone || '' } : null;
    try {
      if (!user) localStorage.removeItem('quran_user_logged_in');
      else localStorage.setItem('quran_user_logged_in', JSON.stringify({
        id: user.id,
        phone: this.currentUser.phone,
        name: user.user_metadata?.name || '',
        email: this.contactEmail(user)
      }));
    } catch (_) { /* Browser storage is optional, authentication is not. */ }
    if (!this.hasPublished || previousId !== this.currentUser?.id) {
      this.hasPublished = true;
      Promise.resolve(this.onAuthChanged?.(this.currentUser)).catch(error => console.error('Profile loading failed:', error));
    }
  }

  formatPhoneNumber(phone) {
    const cleaned = String(phone || '').trim().replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    const digits = cleaned.replace(/^0/, '');
    return digits ? (/^\d{10}$/.test(digits) ? '+91' : '+') + digits : '';
  }

  contactEmail(user) {
    return [user?.user_metadata?.contact_email, user?.user_metadata?.email, user?.email]
      .find(value => typeof value === 'string' && value.trim() && !value.toLowerCase().endsWith('@phone.quran')) || '';
  }

  async syncProfile(user, registration = null) {
    const { data: existing, error: readError } = await this.client.from('profiles')
      .select('id,name,phone,email,age,gender').eq('id', user.id).maybeSingle();
    if (readError) throw new Error('Unable to load your profile. Please try signing in again.');
    const meta = user.user_metadata || {};
    const realEmail = this.contactEmail(user);
    const existingEmail = existing?.email && !existing.email.toLowerCase().endsWith('@phone.quran') ? existing.email : null;
    const payload = {
      id: user.id,
      name: registration?.name ?? (existing?.name || meta.name || ''),
      phone: registration?.phone ?? (existing?.phone || user.phone || meta.phone || ''),
      email: registration ? registration.email : (existingEmail || realEmail || null),
      age: registration?.age ?? existing?.age ?? meta.age ?? null,
      gender: registration?.gender ?? (existing?.gender || meta.gender || ''),
      updated_at: new Date().toISOString()
    };
    const { error } = await this.client.from('profiles').upsert(payload, { onConflict: 'id' });
    if (error) throw new Error('Your account exists, but your profile could not be saved. Please try signing in again.');
    return { ...user, phone: payload.phone, user_metadata: { ...meta, ...payload, contact_email: payload.email } };
  }

  async loginWithPhone(countryCode, phoneNumber, metadata = {}, authMode = 'login') {
    if (!this.initialized || !this.client) throw new Error('The sign-in service is unavailable. Refresh the page and try again.');
    const rawNum = String(phoneNumber || '').trim().replace(/\D/g, '');
    const code = '+' + String(countryCode || '91').replace(/\D/g, '');
    if (!/^\+[1-9]\d{0,3}$/.test(code) || !rawNum || rawNum.length < 6 || rawNum.length > 12 || (code + rawNum).length > 16)
      throw new Error('Please enter a valid country code and mobile number.');
    if (code === '+91' && rawNum.length !== 10) throw new Error('For +91 (India), please enter a valid 10-digit mobile number.');
    const fullPhone = code + rawNum;
    const cleanDigits = fullPhone.slice(1);
    // Existing phone-only login retained by the owner's request. This is not phone verification.
    const credentials = { email: `${cleanDigits}@phone.quran`, password: `PhoneUser@${cleanDigits}` };
    let registration = null;
    if (authMode === 'register') {
      const age = metadata.age === '' || metadata.age == null ? null : Number(metadata.age);
      registration = { name: String(metadata.name || '').trim().toUpperCase(), phone: fullPhone,
        email: String(metadata.email || '').trim().toLowerCase() || null, age, gender: metadata.gender || '' };
      if (registration.name.length < 2) throw new Error('Please enter your full name.');
      if (registration.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email)) throw new Error('Please enter a valid email address or leave it empty.');
      if (age !== null && (!Number.isInteger(age) || age < 3 || age > 100)) throw new Error('Please enter an age between 3 and 100.');
      if (registration.gender && !['Male', 'Female'].includes(registration.gender)) throw new Error('Please select a valid gender.');
    }
    this.authInProgress = true;
    try {
      const { data, error } = registration
        ? await this.client.auth.signUp({ ...credentials, options: { data: { ...registration, contact_email: registration.email } } })
        : await this.client.auth.signInWithPassword(credentials);
      if (error) throw new Error(error.message || 'Sign-in failed. Please try again.');
      if (!data?.session || !data.user || (registration && data.user.identities?.length === 0))
        throw new Error(registration ? 'Registration could not sign you in. If this number is already registered, use Sign In.' : 'Please register this number first.');
      const user = await this.syncProfile(data.user, registration);
      this.publishUser(user);
      return user;
    } catch (error) {
      await this.client.auth.signOut({ scope: 'local' }).catch(() => {});
      this.publishUser(null);
      throw error;
    } finally {
      this.authInProgress = false;
    }
  }

  async sendPhoneOtp(phone, metadata = {}) {
    if (!this.client) throw new Error('The sign-in service is unavailable.');
    const formattedPhone = this.formatPhoneNumber(phone);
    const { data, error } = await this.client.auth.signInWithOtp({ phone: formattedPhone, options: { data: metadata } });
    if (error) throw error;
    return { data, formattedPhone };
  }

  async verifyPhoneOtp(phone, token) {
    if (!this.client) throw new Error('The sign-in service is unavailable.');
    const { data, error } = await this.client.auth.verifyOtp({ phone: this.formatPhoneNumber(phone), token: String(token || '').trim(), type: 'sms' });
    if (error) throw error;
    const user = await this.syncProfile(data.user);
    this.publishUser(user);
    return { ...data, user };
  }

  async logout() {
    if (this.client) {
      const { error } = await this.client.auth.signOut({ scope: 'local' });
      if (error) throw new Error('Unable to sign out. Please try again.');
    }
    this.publishUser(null);
  }

  async fetchProgress(userId, moduleKey = 'flowers_progress') {
    if (!this.client || !userId) return null;
    const { data, error } = await this.client.from('profiles').select(moduleKey).eq('id', userId).maybeSingle();
    if (error) { console.error(`Unable to load ${moduleKey}:`, error); return null; }
    return data?.[moduleKey] || null;
  }

  async generateCertificateNumber(userId, courseCode) {
    if (!this.client || !userId || this.currentUser?.id !== userId)
      throw new Error('Please sign in again to download your certificate.');
    if (!['FQ', 'PQ', 'AQ'].includes(courseCode)) throw new Error('Unknown certificate course.');
    const { data, error } = await this.client.rpc('generate_certificate_number', { user_id: userId, course_code: courseCode });
    if (error) {
      console.error('Unable to generate certificate number:', error);
      if (error.code === 'P0001') throw new Error('Complete all course sections and sync your progress before downloading a certificate.');
      if (error.code === '42501' || error.code === 'P0002') throw new Error('Please sign in again to download your certificate.');
      throw new Error('Your certificate number could not be saved. Please try again.');
    }
    if (this.currentUser?.id !== userId) throw new Error('Your sign-in changed. Please try again.');
    if (typeof data !== 'string' || !new RegExp('^' + courseCode + '-[0-9]{3,}$').test(data))
      throw new Error('A valid certificate number was not returned. Please try again.');
    return data;
  }

  async saveProgress(userId, moduleKey = 'flowers_progress', progressData) {
    if (!this.client || !userId || this.currentUser?.id !== userId) return false;
    const { error } = await this.client.from('profiles').upsert({ id: userId, [moduleKey]: progressData,
      updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) console.error(`Unable to save ${moduleKey}:`, error);
    return !error;
  }
}

window.cloudSync = new SupabaseSyncManager();
