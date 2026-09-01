// admin.js - Aayaatul Quran Admin Panel (Multi-Panel + 3-App Progress + Realtime + Auto-Retry & Resilient Fetching)

document.addEventListener('DOMContentLoaded', () => {
  // ── DOM References ──
  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');
  const loginForm = document.getElementById('admin-login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const errorMsg = document.getElementById('auth-error-msg');
  const btnLogout = document.getElementById('btn-admin-logout');

  // Refresh Buttons
  const btnRefreshData = document.getElementById('btn-refresh-data');
  const btnRefreshUsers = document.getElementById('btn-refresh-users');

  // Panels
  const panelDashboard = document.getElementById('panel-dashboard');
  const panelUsers = document.getElementById('panel-users');

  // Dashboard table
  const usersTableBody = document.getElementById('users-table-body');
  const usersCountBadge = document.getElementById('users-count-badge');
  const searchInput = document.getElementById('user-search-input');

  // Full Users panel table
  const panelUsersTableBody = document.getElementById('panel-users-table-body');
  const panelUsersCountBadge = document.getElementById('panel-users-count-badge');
  const panelUsersSearch = document.getElementById('panel-users-search');

  // KPI
  const kpiTotalUsers = document.getElementById('kpi-total-users');
  const kpiActiveLearners = document.getElementById('kpi-active-learners');
  const kpiCompletedUsers = document.getElementById('kpi-completed-users');
  const kpiTotalTrend = document.getElementById('kpi-total-trend');

  // Modal
  const userModal = document.getElementById('user-details-modal');
  const btnCloseModal = document.getElementById('btn-close-user-modal');

  // ── State ──
  let isAuthenticated = sessionStorage.getItem('adminAuth') === 'true';
  let usersList = [];
  let rawProfiles = [];
  let supabaseClient = null;
  let realtimeChannel = null;
  let activePanel = 'dashboard';
  let isFetching = false;

  // ══════════════════════════════════════
  //  SUPABASE INIT WITH AUTO-RETRY
  // ══════════════════════════════════════
  function initSupabase(retryCount = 0) {
    if (supabaseClient) return supabaseClient;
    try {
      if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(
          "https://mpdpebcmdpozfsgukxww.supabase.co",
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZHBlYmNtZHBvemZzZ3VreHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MzA5NDksImV4cCI6MjEwMzMwNjk0OX0.vN4Gzpm5ritKLlL-lHKGd9fd6hwkcKR76Lb6ADduGGU"
        );
        console.log("✅ Supabase SDK ready.");
        if (isAuthenticated) {
          fetchRealUsers();
          startRealtime();
        }
        return supabaseClient;
      } else if (retryCount < 10) {
        console.warn(`⏳ Waiting for Supabase SDK CDN... Attempt ${retryCount + 1}`);
        setTimeout(() => initSupabase(retryCount + 1), 400);
      } else {
        console.error("❌ Supabase SDK CDN failed to load.");
        if (kpiTotalTrend) kpiTotalTrend.textContent = "❌ SDK Load Error";
      }
    } catch (e) {
      console.error("❌ Supabase init error:", e);
    }
    return supabaseClient;
  }

  // ══════════════════════════════════════
  //  SIDEBAR & PANEL SWITCHING
  // ══════════════════════════════════════
  const sidebarLinks = document.querySelectorAll('.sidebar-link:not(.logout-link)');

  function switchPanel(panelName) {
    activePanel = panelName;
    panelDashboard.style.display = panelName === 'dashboard' ? 'block' : 'none';
    panelUsers.style.display = panelName === 'users' ? 'block' : 'none';

    sidebarLinks.forEach(l => l.classList.remove('active'));
    if (panelName === 'dashboard') sidebarLinks[0]?.classList.add('active');
    else if (panelName === 'users') sidebarLinks[1]?.classList.add('active');
  }

  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      const label = link.querySelector('span').textContent.trim();
      if (label === 'Dashboard Overview') {
        switchPanel('dashboard');
      } else if (label === 'Registered Users') {
        switchPanel('users');
        renderFullUsersTable(usersList);
      }
    });
  });

  // ══════════════════════════════════════
  //  LOGIN (Single Admin Only)
  // ══════════════════════════════════════
  const ADMIN_EMAIL = 'characterbee@gmail.com';
  const ADMIN_PASSWORD = 'character';

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();
    errorMsg.style.display = 'none';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      isAuthenticated = true;
      sessionStorage.setItem('adminAuth', 'true');
      updateView();
    } else {
      errorMsg.textContent = 'Access Denied. Only the admin account can sign in.';
      errorMsg.style.display = 'block';
    }
  });

  // ── Logout ──
  btnLogout.addEventListener('click', () => {
    isAuthenticated = false;
    sessionStorage.removeItem('adminAuth');
    usersList = [];
    rawProfiles = [];
    stopRealtime();
    updateView();
  });

  // ── Refresh Button Listeners ──
  if (btnRefreshData) btnRefreshData.addEventListener('click', () => fetchRealUsers(true));
  if (btnRefreshUsers) btnRefreshUsers.addEventListener('click', () => fetchRealUsers(true));

  // ── View Controller ──
  function updateView() {
    if (isAuthenticated) {
      loginView.style.display = 'none';
      dashboardView.style.display = 'flex';
      switchPanel('dashboard');
      fetchRealUsers();
      startRealtime();
    } else {
      loginView.style.display = 'flex';
      dashboardView.style.display = 'none';
      emailInput.value = '';
      passwordInput.value = '';
    }
  }

  // ══════════════════════════════════════
  //  REALTIME SUBSCRIPTION
  // ══════════════════════════════════════
  function startRealtime() {
    const client = initSupabase();
    if (!client || realtimeChannel) return;
    try {
      realtimeChannel = client
        .channel('admin-profiles-watch-v2')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          (payload) => {
            console.log('🔄 Realtime payload:', payload.eventType);
            fetchRealUsers();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') console.log('🟢 Realtime active.');
        });
    } catch (e) {
      console.warn("Realtime subscription note:", e);
    }
  }

  function stopRealtime() {
    if (realtimeChannel && supabaseClient) {
      try {
        supabaseClient.removeChannel(realtimeChannel);
      } catch (e) { /* ok */ }
      realtimeChannel = null;
    }
  }

  // ══════════════════════════════════════
  //  FETCH ALL PROFILES FROM SUPABASE
  // ══════════════════════════════════════
  async function fetchRealUsers(showSpin = false) {
    if (isFetching) return;
    const client = initSupabase();
    if (!client) {
      if (kpiTotalTrend) kpiTotalTrend.textContent = '❌ Connecting SDK...';
      return;
    }

    isFetching = true;
    if (kpiTotalTrend) kpiTotalTrend.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';

    // Animate refresh icons
    const icons = document.querySelectorAll('.notification-btn i.fa-arrows-rotate');
    icons.forEach(i => i.classList.add('fa-spin'));

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("Supabase fetch error:", error);
        if (kpiTotalTrend) kpiTotalTrend.textContent = '❌ ' + error.message;
        isFetching = false;
        icons.forEach(i => i.classList.remove('fa-spin'));
        return;
      }

      rawProfiles = data || [];
      let activeCount = 0;
      let completedCount = 0;

      // Helper to safely extract completed count from any app module structure
      function extractCompleted(obj) {
        if (!obj) return 0;
        if (Array.isArray(obj.completed)) return obj.completed.length;
        if (Array.isArray(obj.completedFlowers)) return obj.completedFlowers.length;
        if (Array.isArray(obj.completedPearls)) return obj.completedPearls.length;
        if (Array.isArray(obj.completedAayaat)) return obj.completedAayaat.length;
        if (typeof obj.completed === 'number') return obj.completed;
        return 0;
      }

      function extractUnlocked(obj) {
        if (!obj) return 0;
        if (Array.isArray(obj.unlocked)) return obj.unlocked.length;
        if (Array.isArray(obj.unlockedFlowers)) return obj.unlockedFlowers.length;
        return 0;
      }

      usersList = rawProfiles.map(p => {
        // App progress extractions (supports all formats)
        const flowersCompleted = extractCompleted(p.flowers_progress);
        const pearlsCompleted = extractCompleted(p.pearls_progress);
        const aayaatCompleted = extractCompleted(p.aayaatul_progress);

        const totalCompleted = flowersCompleted + pearlsCompleted + aayaatCompleted;
        const overallProgress = Math.round((flowersCompleted / 24) * 100);

        if (totalCompleted > 0) activeCount++;
        if (flowersCompleted >= 24) completedCount++;

        let status = 'New';
        if (flowersCompleted >= 24) status = 'Graduated';
        else if (totalCompleted > 0) status = 'Active';

        // Detect login source from phone / email domain
        let loginSource = 'Phone OTP Authentication';
        const phone = p.phone || '';
        const email = p.email || '';
        if (phone) loginSource = 'Phone SMS OTP (' + phone + ')';
        else if (email.includes('@gmail.com')) loginSource = 'Google (Gmail)';
        else if (email.includes('@yahoo.')) loginSource = 'Yahoo Mail';
        else if (email.includes('@outlook.') || email.includes('@hotmail.')) loginSource = 'Microsoft (Outlook)';
        else if (email.includes('@icloud.')) loginSource = 'Apple (iCloud)';
        else if (email && email.includes('@')) loginSource = 'Email (' + email.split('@')[1] + ')';

        return {
          id: p.id || '—',
          name: p.name || '',
          phone: phone || 'N/A',
          email: email || 'N/A',
          age: p.age || '—',
          gender: p.gender || '—',
          joinedDate: p.updated_at
            ? new Date(p.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
          status,
          overallProgress,
          flowersCompleted,
          pearlsCompleted,
          aayaatCompleted,
          loginSource,
        };
      });

      // Update KPI
      if (kpiTotalUsers) kpiTotalUsers.textContent = usersList.length;
      if (kpiActiveLearners) kpiActiveLearners.textContent = activeCount;
      if (kpiCompletedUsers) kpiCompletedUsers.textContent = completedCount;
      if (kpiTotalTrend) {
        kpiTotalTrend.innerHTML = '<i class="fa-solid fa-circle-check"></i> Live — Synced';
        kpiTotalTrend.className = 'kpi-trend positive';
      }

      renderDashboardTable(usersList);
      renderFullUsersTable(usersList);
    } catch (e) {
      console.error("Fetch Exception:", e);
      if (kpiTotalTrend) kpiTotalTrend.textContent = '❌ Sync Failed';
    } finally {
      isFetching = false;
      icons.forEach(i => i.classList.remove('fa-spin'));
    }
  }

  // ══════════════════════════════════════
  //  DASHBOARD TABLE (Compact Preview)
  // ══════════════════════════════════════
  function renderDashboardTable(users) {
    if (!usersTableBody) return;
    usersTableBody.innerHTML = '';
    if (usersCountBadge) usersCountBadge.textContent = `${users.length} Users`;

    if (users.length === 0) {
      usersTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:30px 20px; color:var(--text-muted);">
            <div style="background:#FEF3C7; border:1px solid #F59E0B; border-radius:12px; padding:16px; max-width:540px; margin:0 auto; text-align:left; color:#92400E;">
              <div style="display:flex; align-items:center; gap:8px; font-weight:800; font-size:0.95rem; margin-bottom:6px;">
                <i class="fa-solid fa-lock" style="color:#D97706;"></i> Supabase Row Level Security (RLS) Active
              </div>
              <p style="font-size:0.82rem; margin:0; line-height:1.4;">
                Supabase currently hides profiles from the Admin panel unless an RLS Read Policy is enabled. To show all 11-12 users continuously:
              </p>
              <code style="display:block; background:#FFFFFF; padding:8px 12px; border-radius:6px; margin-top:8px; font-size:0.78rem; font-family:monospace; border:1px solid #FCD34D;">
                ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
              </code>
            </div>
          </td>
        </tr>`;
      return;
    }

    users.forEach((user, idx) => {
      const tr = document.createElement('tr');
      const displayName = user.name || (user.phone !== 'N/A' ? user.phone : (user.email !== 'N/A' ? user.email.split('@')[0] : 'Unknown'));
      const contactInfo = user.phone !== 'N/A' ? user.phone : user.email;
      let progressColor = user.overallProgress >= 75 ? '#10B981' : (user.overallProgress < 40 ? '#F43F5E' : '#EAB308');
      let statusClass = user.status === 'New' ? 'ready' : 'done';

      tr.innerHTML = `
        <td style="font-family:monospace; color:var(--text-muted);">${idx + 1}</td>
        <td><span class="user-name-text">${displayName}</span></td>
        <td style="color:var(--text-muted);">${contactInfo}</td>
        <td style="color:var(--text-muted);">${user.joinedDate}</td>
        <td>
          <div class="progress-cell">
            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${user.overallProgress}%; background:${progressColor};"></div></div>
            <span class="progress-text">${user.overallProgress}%</span>
          </div>
        </td>
        <td><span class="status-badge-bottom ${statusClass}">${user.status}</span></td>
      `;
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', () => openUserDetails(user));
      usersTableBody.appendChild(tr);
    });
  }

  // Dashboard search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      renderDashboardTable(usersList.filter(u =>
        (u.name || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      ));
    });
  }

  // ══════════════════════════════════════
  //  FULL USERS TABLE (Registered Users Panel)
  // ══════════════════════════════════════
  function renderFullUsersTable(users) {
    if (!panelUsersTableBody) return;
    panelUsersTableBody.innerHTML = '';
    if (panelUsersCountBadge) panelUsersCountBadge.textContent = `${users.length} Users`;

    if (users.length === 0) {
      panelUsersTableBody.innerHTML = `
        <tr>
          <td colspan="12" style="text-align:center; padding:30px 20px; color:var(--text-muted);">
            <div style="background:#FEF3C7; border:1px solid #F59E0B; border-radius:12px; padding:16px; max-width:540px; margin:0 auto; text-align:left; color:#92400E;">
              <div style="display:flex; align-items:center; gap:8px; font-weight:800; font-size:0.95rem; margin-bottom:6px;">
                <i class="fa-solid fa-lock" style="color:#D97706;"></i> Supabase Row Level Security (RLS) Active
              </div>
              <p style="font-size:0.82rem; margin:0; line-height:1.4;">
                Supabase is currently restricting profile reading. Run this 1-line command in your Supabase SQL Editor to show all 11-12 users permanently:
              </p>
              <code style="display:block; background:#FFFFFF; padding:8px 12px; border-radius:6px; margin-top:8px; font-size:0.78rem; font-family:monospace; border:1px solid #FCD34D;">
                ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
              </code>
            </div>
          </td>
        </tr>`;
      return;
    }

    users.forEach((user, idx) => {
      const tr = document.createElement('tr');
      const displayName = user.name || (user.phone !== 'N/A' ? user.phone : (user.email !== 'N/A' ? user.email.split('@')[0] : 'Unknown'));
      const contactInfo = user.phone !== 'N/A' ? user.phone : user.email;
      let statusClass = user.status === 'New' ? 'ready' : 'done';

      const flowersPct = Math.round((user.flowersCompleted / 24) * 100);
      const pearlsPct = user.pearlsCompleted > 0 ? Math.round((user.pearlsCompleted / 24) * 100) : 0;
      const aayaatPct = user.aayaatCompleted > 0 ? Math.round((user.aayaatCompleted / 24) * 100) : 0;

      tr.innerHTML = `
        <td style="font-family:monospace; color:var(--text-muted);">${idx + 1}</td>
        <td style="font-family:monospace; color:var(--text-muted); font-size:0.72rem;">${user.id.substring(0, 8)}…</td>
        <td><span class="user-name-text">${displayName}</span></td>
        <td style="color:var(--text-muted);">${contactInfo}</td>
        <td style="color:var(--text-muted); text-align:center;">${user.age}</td>
        <td style="color:var(--text-muted); text-align:center;">${user.gender}</td>
        <td style="color:var(--text-muted);">${user.joinedDate}</td>
        <td>
          <div class="progress-cell">
            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${flowersPct}%; background:#CC9933;"></div></div>
            <span class="progress-text">${flowersPct}%</span>
          </div>
        </td>
        <td>
          <div class="progress-cell">
            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pearlsPct}%; background:#2563EB;"></div></div>
            <span class="progress-text">${pearlsPct}%</span>
          </div>
        </td>
        <td>
          <div class="progress-cell">
            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${aayaatPct}%; background:#D97706;"></div></div>
            <span class="progress-text">${aayaatPct}%</span>
          </div>
        </td>
        <td><span class="status-badge-bottom ${statusClass}">${user.status}</span></td>
        <td style="text-align:right;">
          <button class="action-btn" title="View Details"><i class="fa-solid fa-eye"></i></button>
        </td>
      `;
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', () => openUserDetails(user));
      panelUsersTableBody.appendChild(tr);
    });
  }

  // Full users panel search
  if (panelUsersSearch) {
    panelUsersSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      renderFullUsersTable(usersList.filter(u =>
        (u.name || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
      ));
    });
  }

  // ══════════════════════════════════════
  //  USER DETAILS MODAL
  // ══════════════════════════════════════
  function openUserDetails(user) {
    if (!user || !userModal) return;
    const displayName = user.name || (user.phone !== 'N/A' ? user.phone : (user.email !== 'N/A' ? user.email.split('@')[0] : 'Unknown'));

    const elId = document.getElementById('modal-user-id');
    const elName = document.getElementById('modal-user-name');
    const elPhone = document.getElementById('modal-user-phone');
    const elEmail = document.getElementById('modal-user-email');
    const elDate = document.getElementById('modal-user-date');
    const elAge = document.getElementById('modal-user-age');
    const elGender = document.getElementById('modal-user-gender');
    const elSource = document.getElementById('modal-login-source');

    if (elId) elId.textContent = 'ID: ' + user.id;
    if (elName) elName.textContent = displayName;
    if (elPhone) elPhone.textContent = user.phone !== 'N/A' ? user.phone : '—';
    if (elEmail) elEmail.textContent = user.email !== 'N/A' ? user.email : '—';
    if (elDate) elDate.textContent = user.joinedDate;
    if (elAge) elAge.textContent = user.age;
    if (elGender) elGender.textContent = user.gender;
    if (elSource) elSource.textContent = user.loginSource;

    // Status
    let statusClass = user.status === 'New' ? 'ready' : 'done';
    const statusEl = document.getElementById('modal-user-status');
    if (statusEl) {
      statusEl.textContent = user.status;
      statusEl.className = 'status-badge-bottom ' + statusClass;
    }

    // Flowers progress
    const flowersPct = Math.round((user.flowersCompleted / 24) * 100);
    const elFlPct = document.getElementById('modal-flowers-pct');
    const elFlBar = document.getElementById('modal-flowers-bar');
    const elFlCnt = document.getElementById('modal-flowers-count');
    if (elFlPct) elFlPct.textContent = flowersPct + '%';
    if (elFlBar) elFlBar.style.width = flowersPct + '%';
    if (elFlCnt) elFlCnt.textContent = user.flowersCompleted;

    // Pearls progress
    const pearlsPct = user.pearlsCompleted > 0 ? Math.round((user.pearlsCompleted / 24) * 100) : 0;
    const elPePct = document.getElementById('modal-pearls-pct');
    const elPeBar = document.getElementById('modal-pearls-bar');
    const elPeCnt = document.getElementById('modal-pearls-count');
    if (elPePct) elPePct.textContent = pearlsPct + '%';
    if (elPeBar) elPeBar.style.width = pearlsPct + '%';
    if (elPeCnt) elPeCnt.textContent = user.pearlsCompleted;

    // Aayaat progress
    const aayaatPct = user.aayaatCompleted > 0 ? Math.round((user.aayaatCompleted / 24) * 100) : 0;
    const elAaPct = document.getElementById('modal-aayaat-pct');
    const elAaBar = document.getElementById('modal-aayaat-bar');
    const elAaCnt = document.getElementById('modal-aayaat-count');
    if (elAaPct) elAaPct.textContent = aayaatPct + '%';
    if (elAaBar) elAaBar.style.width = aayaatPct + '%';
    if (elAaCnt) elAaCnt.textContent = user.aayaatCompleted;

    userModal.classList.add('active');
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => userModal.classList.remove('active'));
  }
  if (userModal) {
    userModal.addEventListener('click', (e) => {
      if (e.target === userModal) userModal.classList.remove('active');
    });
  }

  // ── Boot ──
  initSupabase();
  updateView();
});
