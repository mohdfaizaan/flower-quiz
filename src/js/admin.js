// Secure Flowers of Quran administrator dashboard.
// The Supabase URL and anon key are public client configuration, not administrator credentials.

(() => {
  'use strict';

  const SUPABASE_URL = 'https://mpdpebcmdpozfsgukxww.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZHBlYmNtZHBvemZzZ3VreHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MzA5NDksImV4cCI6MjEwMzMwNjk0OX0.vN4Gzpm5ritKLlL-lHKGd9fd6hwkcKR76Lb6ADduGGU';
  const COURSE_TOTALS = Object.freeze({ flowers: 24, pearls: 36, aayaat: 50 });

  document.addEventListener('DOMContentLoaded', () => {
    const elements = {
      loginView: document.getElementById('admin-login-view'),
      dashboardView: document.getElementById('admin-dashboard-view'),
      loginForm: document.getElementById('admin-login-form'),
      emailInput: document.getElementById('login-email'),
      passwordInput: document.getElementById('login-password'),
      loginButton: document.getElementById('btn-submit-login'),
      authMessage: document.getElementById('auth-error-msg'),
      logoutButton: document.getElementById('btn-admin-logout'),
      refreshDashboard: document.getElementById('btn-refresh-data'),
      refreshUsers: document.getElementById('btn-refresh-users'),
      panelDashboard: document.getElementById('panel-dashboard'),
      panelUsers: document.getElementById('panel-users'),
      dashboardSearch: document.getElementById('user-search-input'),
      usersSearch: document.getElementById('panel-users-search'),
      dashboardTable: document.getElementById('users-table-body'),
      usersTable: document.getElementById('panel-users-table-body'),
      dashboardCount: document.getElementById('users-count-badge'),
      usersCount: document.getElementById('panel-users-count-badge'),
      totalUsers: document.getElementById('kpi-total-users'),
      activeLearners: document.getElementById('kpi-active-learners'),
      completedUsers: document.getElementById('kpi-completed-users'),
      syncStatus: document.getElementById('kpi-total-trend'),
      userModal: document.getElementById('user-details-modal'),
      closeUserModal: document.getElementById('btn-close-user-modal')
    };

    let client = null;
    let profiles = [];
    let realtimeChannel = null;
    let isAdministrator = false;
    let isFetching = false;

    function setText(id, value) {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    }

    function showAuthMessage(message) {
      if (!elements.authMessage) return;
      elements.authMessage.textContent = message;
      elements.authMessage.style.display = message ? 'block' : 'none';
    }

    function setLoginBusy(isBusy) {
      if (elements.loginButton) {
        elements.loginButton.disabled = isBusy;
        elements.loginButton.textContent = isBusy ? 'Verifying…' : 'Sign In Securely ➔';
      }
      if (elements.emailInput) elements.emailInput.disabled = isBusy;
      if (elements.passwordInput) elements.passwordInput.disabled = isBusy;
    }

    function showLogin(message = '') {
      isAdministrator = false;
      if (elements.loginView) elements.loginView.style.display = 'flex';
      if (elements.dashboardView) elements.dashboardView.style.display = 'none';
      if (elements.passwordInput) elements.passwordInput.value = '';
      showAuthMessage(message);
    }

    function showDashboard() {
      if (elements.loginView) elements.loginView.style.display = 'none';
      if (elements.dashboardView) elements.dashboardView.style.display = 'flex';
      showAuthMessage('');
      switchPanel('dashboard');
    }

    function switchPanel(panelName) {
      if (!isAdministrator) return;
      if (elements.panelDashboard) elements.panelDashboard.style.display = panelName === 'dashboard' ? 'block' : 'none';
      if (elements.panelUsers) elements.panelUsers.style.display = panelName === 'users' ? 'block' : 'none';

      const links = document.querySelectorAll('.sidebar-nav .sidebar-link');
      links.forEach((link, index) => {
        const isActive = (panelName === 'dashboard' && index === 0) || (panelName === 'users' && index === 1);
        link.classList.toggle('active', isActive);
      });
    }

    function normaliseProgress(progress) {
      if (!progress) return {};
      if (typeof progress === 'string') {
        try {
          return JSON.parse(progress);
        } catch (_) {
          return {};
        }
      }
      return typeof progress === 'object' ? progress : {};
    }

    function completedCount(progress) {
      const value = normaliseProgress(progress);
      const candidates = [value.completed, value.completedFlowers, value.completedPearls, value.completedAayaat];
      for (const candidate of candidates) {
        if (Array.isArray(candidate)) return new Set(candidate).size;
        if (Number.isFinite(candidate)) return Math.max(0, Math.floor(candidate));
      }
      return 0;
    }

    function percent(count, total) {
      return Math.min(100, Math.max(0, Math.round((count / total) * 100)));
    }

    function formatDate(value) {
      if (!value) return '—';
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function loginSource(profile) {
      const phone = String(profile.phone || '');
      const email = String(profile.email || '');
      if (phone) return `Phone (${phone})`;
      if (email) return `Email (${email.split('@')[1] || 'account'})`;
      return 'Unknown';
    }

    function mapProfile(profile) {
      const flowersCompleted = completedCount(profile.flowers_progress);
      const pearlsCompleted = completedCount(profile.pearls_progress);
      const aayaatCompleted = completedCount(profile.aayaat_progress);
      const percentages = {
        flowers: percent(flowersCompleted, COURSE_TOTALS.flowers),
        pearls: percent(pearlsCompleted, COURSE_TOTALS.pearls),
        aayaat: percent(aayaatCompleted, COURSE_TOTALS.aayaat)
      };
      const totalCompleted = flowersCompleted + pearlsCompleted + aayaatCompleted;
      const graduated = flowersCompleted >= COURSE_TOTALS.flowers
        || pearlsCompleted >= COURSE_TOTALS.pearls
        || aayaatCompleted >= COURSE_TOTALS.aayaat;

      return {
        id: String(profile.id || '—'),
        name: String(profile.name || ''),
        phone: String(profile.phone || 'N/A'),
        email: String(profile.email || 'N/A'),
        age: profile.age ?? '—',
        gender: String(profile.gender || '—'),
        joinedDate: formatDate(profile.updated_at || profile.created_at),
        status: graduated ? 'Graduated' : (totalCompleted > 0 ? 'Active' : 'New'),
        overallProgress: Math.max(percentages.flowers, percentages.pearls, percentages.aayaat),
        flowersCompleted,
        pearlsCompleted,
        aayaatCompleted,
        percentages,
        loginSource: loginSource(profile)
      };
    }

    function displayName(user) {
      if (user.name) return user.name;
      if (user.phone !== 'N/A') return user.phone;
      if (user.email !== 'N/A') return user.email.split('@')[0];
      return 'Unknown';
    }

    function appendCell(row, text, className = '') {
      const cell = document.createElement('td');
      if (className) cell.className = className;
      cell.textContent = String(text);
      row.appendChild(cell);
      return cell;
    }

    function appendProgressCell(row, value, colour) {
      const cell = document.createElement('td');
      const wrapper = document.createElement('div');
      const background = document.createElement('div');
      const fill = document.createElement('div');
      const label = document.createElement('span');

      wrapper.className = 'progress-cell';
      background.className = 'progress-bar-bg';
      fill.className = 'progress-bar-fill';
      fill.style.width = `${value}%`;
      fill.style.background = colour;
      label.className = 'progress-text';
      label.textContent = `${value}%`;

      background.appendChild(fill);
      wrapper.append(background, label);
      cell.appendChild(wrapper);
      row.appendChild(cell);
    }

    function appendStatusCell(row, status) {
      const cell = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = `status-badge-bottom ${status === 'New' ? 'ready' : 'done'}`;
      badge.textContent = status;
      cell.appendChild(badge);
      row.appendChild(cell);
    }

    function showEmptyRow(tableBody, columnCount, message) {
      if (!tableBody) return;
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = columnCount;
      cell.style.textAlign = 'center';
      cell.style.padding = '30px 20px';
      cell.style.color = 'var(--text-muted)';
      cell.textContent = message;
      row.appendChild(cell);
      tableBody.appendChild(row);
    }

    function renderDashboardTable(users) {
      if (!elements.dashboardTable) return;
      elements.dashboardTable.replaceChildren();
      if (elements.dashboardCount) elements.dashboardCount.textContent = `${users.length} Users`;

      if (!users.length) {
        showEmptyRow(elements.dashboardTable, 6, 'No matching user profiles found.');
        return;
      }

      users.forEach((user, index) => {
        const row = document.createElement('tr');
        appendCell(row, index + 1);
        appendCell(row, displayName(user), 'user-name-text');
        appendCell(row, user.phone !== 'N/A' ? user.phone : user.email);
        appendCell(row, user.joinedDate);
        const progressColour = user.overallProgress >= 75 ? '#10B981' : (user.overallProgress < 40 ? '#F43F5E' : '#EAB308');
        appendProgressCell(row, user.overallProgress, progressColour);
        appendStatusCell(row, user.status);
        row.addEventListener('click', () => openUserDetails(user));
        elements.dashboardTable.appendChild(row);
      });
    }

    function renderUsersTable(users) {
      if (!elements.usersTable) return;
      elements.usersTable.replaceChildren();
      if (elements.usersCount) elements.usersCount.textContent = `${users.length} Users`;

      if (!users.length) {
        showEmptyRow(elements.usersTable, 12, 'No matching user profiles found.');
        return;
      }

      users.forEach((user, index) => {
        const row = document.createElement('tr');
        appendCell(row, index + 1);
        appendCell(row, user.id === '—' ? '—' : `${user.id.slice(0, 8)}…`);
        appendCell(row, displayName(user), 'user-name-text');
        appendCell(row, user.phone !== 'N/A' ? user.phone : user.email);
        appendCell(row, user.age);
        appendCell(row, user.gender);
        appendCell(row, user.joinedDate);
        appendProgressCell(row, user.percentages.flowers, '#CC9933');
        appendProgressCell(row, user.percentages.pearls, '#2563EB');
        appendProgressCell(row, user.percentages.aayaat, '#D97706');
        appendStatusCell(row, user.status);

        const actionCell = document.createElement('td');
        actionCell.style.textAlign = 'right';
        const action = document.createElement('button');
        action.type = 'button';
        action.className = 'action-btn';
        action.title = 'View Details';
        action.setAttribute('aria-label', `View details for ${displayName(user)}`);
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-eye';
        action.appendChild(icon);
        actionCell.appendChild(action);
        row.appendChild(actionCell);

        row.addEventListener('click', () => openUserDetails(user));
        elements.usersTable.appendChild(row);
      });
    }

    function filteredProfiles(query) {
      const normalisedQuery = String(query || '').trim().toLowerCase();
      if (!normalisedQuery) return profiles;
      return profiles.filter((user) => [user.name, user.phone, user.email, user.id]
        .some((value) => String(value || '').toLowerCase().includes(normalisedQuery)));
    }

    function updateSummary() {
      const active = profiles.filter((user) => user.status !== 'New').length;
      const completed = profiles.filter((user) => user.status === 'Graduated').length;
      if (elements.totalUsers) elements.totalUsers.textContent = profiles.length;
      if (elements.activeLearners) elements.activeLearners.textContent = active;
      if (elements.completedUsers) elements.completedUsers.textContent = completed;
    }

    function setProgressDetails(prefix, count, percentage) {
      setText(`modal-${prefix}-count`, count);
      setText(`modal-${prefix}-pct`, `${percentage}%`);
      const bar = document.getElementById(`modal-${prefix}-bar`);
      if (bar) bar.style.width = `${percentage}%`;
    }

    function openUserDetails(user) {
      if (!elements.userModal) return;
      setText('modal-user-id', `ID: ${user.id}`);
      setText('modal-user-name', displayName(user));
      setText('modal-user-phone', user.phone === 'N/A' ? '—' : user.phone);
      setText('modal-user-email', user.email === 'N/A' ? '—' : user.email);
      setText('modal-user-date', user.joinedDate);
      setText('modal-user-age', user.age);
      setText('modal-user-gender', user.gender);
      setText('modal-login-source', user.loginSource);
      setText('modal-user-status', user.status);
      setProgressDetails('flowers', user.flowersCompleted, user.percentages.flowers);
      setProgressDetails('pearls', user.pearlsCompleted, user.percentages.pearls);
      setProgressDetails('aayaat', user.aayaatCompleted, user.percentages.aayaat);
      elements.userModal.classList.add('active');
    }

    async function isConfiguredAdministrator() {
      const { data, error } = await client.rpc('is_admin');
      if (error) {
        throw new Error('Administrator security is not configured. Run supabase_admin_setup.sql in Supabase first.');
      }
      return data === true;
    }

    async function establishAdminSession(user) {
      if (!user) {
        showLogin();
        return false;
      }

      try {
        const allowed = await isConfiguredAdministrator();
        if (!allowed) {
          await client.auth.signOut({ scope: 'local' });
          showLogin('This account is not authorised to use the administrator dashboard.');
          return false;
        }

        isAdministrator = true;
        showDashboard();
        await fetchProfiles(true);
        startRealtime();
        return true;
      } catch (error) {
        await client.auth.signOut({ scope: 'local' });
        showLogin(error.message || 'Unable to verify administrator access.');
        return false;
      }
    }

    async function fetchProfiles(showLoading = false) {
      if (!isAdministrator || isFetching) return;
      isFetching = true;
      if (showLoading && elements.syncStatus) {
        elements.syncStatus.textContent = 'Refreshing…';
        elements.syncStatus.className = 'kpi-trend neutral';
      }

      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;
        profiles = (data || []).map(mapProfile);
        updateSummary();
        renderDashboardTable(filteredProfiles(elements.dashboardSearch?.value));
        renderUsersTable(filteredProfiles(elements.usersSearch?.value));
        if (elements.syncStatus) {
          elements.syncStatus.textContent = 'Securely synced';
          elements.syncStatus.className = 'kpi-trend positive';
        }
      } catch (error) {
        profiles = [];
        updateSummary();
        renderDashboardTable([]);
        renderUsersTable([]);
        if (elements.syncStatus) {
          elements.syncStatus.textContent = error.message || 'Unable to read profiles';
          elements.syncStatus.className = 'kpi-trend neutral';
        }
      } finally {
        isFetching = false;
      }
    }

    function startRealtime() {
      if (!isAdministrator || realtimeChannel) return;
      realtimeChannel = client
        .channel('secure-admin-profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          void fetchProfiles(false);
        })
        .subscribe();
    }

    async function stopRealtime() {
      if (!realtimeChannel) return;
      await client.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }

    elements.loginForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      showAuthMessage('');
      setLoginBusy(true);

      try {
        const email = elements.emailInput.value.trim();
        const password = elements.passwordInput.value;
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await establishAdminSession(data.user);
      } catch (error) {
        showLogin(error.message || 'Sign-in failed. Please check your email and password.');
      } finally {
        setLoginBusy(false);
      }
    });

    elements.logoutButton?.addEventListener('click', async () => {
      await stopRealtime();
      await client.auth.signOut({ scope: 'local' });
      profiles = [];
      showLogin();
    });

    elements.refreshDashboard?.addEventListener('click', () => void fetchProfiles(true));
    elements.refreshUsers?.addEventListener('click', () => void fetchProfiles(true));
    elements.dashboardSearch?.addEventListener('input', (event) => renderDashboardTable(filteredProfiles(event.target.value)));
    elements.usersSearch?.addEventListener('input', (event) => renderUsersTable(filteredProfiles(event.target.value)));

    const sidebarLinks = document.querySelectorAll('.sidebar-nav .sidebar-link');
    sidebarLinks[0]?.addEventListener('click', () => switchPanel('dashboard'));
    sidebarLinks[1]?.addEventListener('click', () => switchPanel('users'));

    elements.closeUserModal?.addEventListener('click', () => elements.userModal?.classList.remove('active'));
    elements.userModal?.addEventListener('click', (event) => {
      if (event.target === elements.userModal) elements.userModal.classList.remove('active');
    });

    if (!window.supabase?.createClient) {
      showLogin('The secure login service could not load. Check your connection and refresh the page.');
      return;
    }

    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storageKey: 'flowers-secure-admin-session',
        storage: window.sessionStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });

    client.auth.onAuthStateChange((event) => {
      // Avoid clearing the authorization error when an authenticated but
      // unauthorized account is deliberately signed out.
      if (event === 'SIGNED_OUT' && isAdministrator) showLogin();
    });

    void (async () => {
      const { data, error } = await client.auth.getUser();
      if (error || !data.user) {
        showLogin();
        return;
      }
      await establishAdminSession(data.user);
    })();
  });
})();
