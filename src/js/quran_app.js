// Flowers of Quran - Core Application Engine with PDF Reader & Strict Quiz Progression

class FlowersOfQuranApp {
  constructor() {
    this.dataset = typeof FLOWERS_DATA !== 'undefined' ? FLOWERS_DATA : [];
    this.audio = typeof sounds !== 'undefined' ? sounds : { toggleSound: () => false, playCorrect: () => {}, playWrong: () => {}, playVictory: () => {} };
    this.cloud = typeof cloudSync !== 'undefined' ? cloudSync : { init: () => {}, fetchProgress: async () => null, saveProgress: async () => {} };

    // PDF.js State
    this.pdfDoc = null;
    this.pdfLoading = false;
    this.currentPdfFlowerId = 1;
    this.currentPdfPageNum = 1;
    this.pdfPageStart = 1;
    this.pdfPageEnd = 10;
    this.pdfRendering = false;

    // Game State
    this.state = {
      unlockedFlowers: [1],
      completedFlowers: [],
      currentFlowerId: null,
      currentQuestionIdx: 0,
      isAnswered: false,
      userAnswers: [], // stores { question, userIdx, correctIdx, isCorrect, explanation }
      authUser: null
    };

    // DOM Elements - General
    this.hamburgerBtn = document.getElementById('hamburger-btn');
    this.navMenu = document.getElementById('nav-menu');
    this.btnStartQuiz = document.getElementById('btn-start-quiz');
    this.sectionsGrid = document.getElementById('sections-grid');
    this.modSectionsCount = document.getElementById('mod-sections-count');
    this.btnSound = document.getElementById('btn-sound');

    // Navigation Links & Modals
    this.linkAbout = document.getElementById('link-about');
    this.linkContact = document.getElementById('link-contact');
    this.footerLinkAbout = document.getElementById('footer-link-about');
    this.footerLinkContact = document.getElementById('footer-link-contact');
    this.aboutModal = document.getElementById('about-modal');
    this.btnCloseAbout = document.getElementById('btn-close-about');
    this.contactModal = document.getElementById('contact-modal');
    this.btnCloseContact = document.getElementById('btn-close-contact');
    this.btnSubmitContact = document.getElementById('btn-submit-contact');
    this.contactSuccessMsg = document.getElementById('contact-success-msg');

    // Auth Elements
    this.btnLoginNav = document.getElementById('btn-login-nav');
    this.btnRegisterNav = document.getElementById('btn-register-nav');
    this.loginModal = document.getElementById('login-modal');
    this.btnCloseLogin = document.getElementById('btn-close-login');
    this.modalAuthTitle = document.getElementById('modal-auth-title');
    this.authTabs = document.querySelector('.auth-tabs');
    this.tabAuthLogin = document.getElementById('tab-auth-login');
    this.tabAuthRegister = document.getElementById('tab-auth-register');
    this.fieldAuthName = document.getElementById('field-auth-name');
    this.fieldAuthAge = document.getElementById('field-auth-age');
    this.fieldAuthGender = document.getElementById('field-auth-gender');
    this.authNameInput = document.getElementById('auth-name');
    this.authCountryCode = document.getElementById('auth-country-code');
    this.authPhoneNumInput = document.getElementById('auth-phone-num');
    this.phoneHintText = document.getElementById('phone-hint-text');
    this.btnSubmitPhoneAuth = document.getElementById('btn-submit-phone-auth');
    this.authErrorMsg = document.getElementById('auth-error-msg');
    this.authSuccessMsg = document.getElementById('auth-success-msg');
    this.authFormView = document.getElementById('auth-form-view');
    this.authLoggedInView = document.getElementById('auth-logged-in-view');
    this.loggedInUserInfo = document.getElementById('logged-in-user-info');
    this.btnLogout = document.getElementById('btn-logout');
    this.authMode = 'login'; // 'login' or 'register'

    // Navbar Logout & Confirmation Modal Elements
    this.btnLogoutNav = document.getElementById('btn-logout-nav');
    this.logoutConfirmModal = document.getElementById('logout-confirm-modal');
    this.btnCancelLogout = document.getElementById('btn-cancel-logout');
    this.btnConfirmLogout = document.getElementById('btn-confirm-logout');

    // PDF Modal Elements
    this.pdfModal = document.getElementById('pdf-modal');
    this.btnClosePdf = document.getElementById('btn-close-pdf');
    this.pdfFlowerIcon = document.getElementById('pdf-flower-icon');
    this.pdfFlowerTitle = document.getElementById('pdf-flower-title');
    this.pdfPageRangeSub = document.getElementById('pdf-page-range-sub');
    this.pdfCanvas = document.getElementById('pdf-render-canvas');
    this.pdfLoadingSpinner = document.getElementById('pdf-loading-spinner');
    this.btnPdfPrev = document.getElementById('btn-pdf-prev');
    this.btnPdfNext = document.getElementById('btn-pdf-next');
    this.pdfCurrentPageEl = document.getElementById('pdf-current-page');
    this.pdfTotalPageEl = document.getElementById('pdf-total-page');
    this.btnProceedQuiz = document.getElementById('btn-proceed-quiz');
    this.pdfReadHint = document.getElementById('pdf-read-hint');
    this.btnZoomIn = document.getElementById('btn-zoom-in');
    this.btnZoomOut = document.getElementById('btn-zoom-out');
    this.pdfZoomVal = document.getElementById('pdf-zoom-val');
    this.pdfZoomPercent = 100;

    // Quiz Modal Elements
    this.modalOverlay = document.getElementById('quiz-modal');
    this.quizView = document.getElementById('quiz-view');
    this.victoryView = document.getElementById('victory-view');
    this.failureView = document.getElementById('failure-view');
    this.failureScoreBadge = document.getElementById('failure-score-badge');
    this.errorBreakdownList = document.getElementById('error-breakdown-list');
    this.btnRetryQuiz = document.getElementById('btn-retry-quiz');
    this.btnReviewPdf = document.getElementById('btn-review-pdf');
    this.btnCloseModal = document.getElementById('btn-close-modal');
    this.modalFlowerIcon = document.getElementById('modal-flower-icon');
    this.modalFlowerTitle = document.getElementById('modal-flower-title');
    this.modalFlowerSub = document.getElementById('modal-flower-sub');
    this.questionStepper = document.getElementById('question-stepper');
    this.questionText = document.getElementById('question-text');
    this.optionsGrid = document.getElementById('options-grid');
    this.feedbackBox = document.getElementById('feedback-box');
    this.btnNextQuestion = document.getElementById('btn-next-question');
    this.btnVictoryBack = document.getElementById('btn-victory-back');
    this.btnVictoryNext = document.getElementById('btn-victory-next');
    this.btnVictoryDownloadCert = document.getElementById('btn-victory-download-cert');
    this.victoryFlowerIcon = document.getElementById('victory-flower-icon');
    this.victoryTitle = document.getElementById('victory-title');

    // Certificate Modal Elements
    this.certificateModal = document.getElementById('certificate-modal');
    this.btnCloseCertificate = document.getElementById('btn-close-certificate');
    this.btnDownloadPdfCert = document.getElementById('btn-download-pdf-cert');

    this.applyCachedAuthState();
    this.init();
  }

  applyCachedAuthState() {
    try {
      const cached = localStorage.getItem('quran_user_logged_in');
      if (cached) {
        const u = JSON.parse(cached);
        if (this.btnLoginNav) this.btnLoginNav.style.display = 'none';
        if (this.btnRegisterNav) this.btnRegisterNav.style.display = 'none';
        if (this.btnLogoutNav) {
          this.btnLogoutNav.style.display = 'inline-flex';
          this.btnLogoutNav.textContent = '🚪 Sign Out';
        }
      }
    } catch(e) {}
  }

  init() {
    this.loadState();
    this.bindEvents();
    this.initCloudAuth();
    this.initPdfLibrary();
    this.renderGardenDashboard();
  }

  loadState() {
    try {
      const isUserLoggedIn = localStorage.getItem('quran_user_logged_in');
      if (isUserLoggedIn) {
        const saved = localStorage.getItem('flowers_of_quran_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.state.unlockedFlowers = parsed.unlocked || parsed.unlockedFlowers || [1];
          this.state.completedFlowers = parsed.completed || parsed.completedFlowers || [];
          return;
        }
      }
      this.state.unlockedFlowers = [1];
      this.state.completedFlowers = [];
    } catch (e) {
      console.log('Error loading state:', e);
      this.state.unlockedFlowers = [1];
      this.state.completedFlowers = [];
    }
  }

  resetToDefaultState() {
    this.state.unlockedFlowers = [1];
    this.state.completedFlowers = [];
    localStorage.removeItem('flowers_of_quran_state');
    localStorage.removeItem('quran_user_logged_in');
    this.renderGardenDashboard();
  }

  saveState() {
    try {
      const payload = {
        unlocked: this.state.unlockedFlowers,
        completed: this.state.completedFlowers
      };
      localStorage.setItem('flowers_of_quran_state', JSON.stringify(payload));
      if (this.state.authUser && this.cloud && this.cloud.initialized) {
        const userId = this.state.authUser.id || this.state.authUser.uid;
        this.cloud.saveProgress(userId, 'flowers_progress', payload);
      }
    } catch (e) {
      console.log('Error saving state:', e);
    }
  }

  getWebpImagePath(pageNum) {
    let folderName = '';
    if (this.currentPdfFlowerId === 24) {
      folderName = '231-234';
    } else {
      let start = (this.currentPdfFlowerId - 1) * 10 + 1;
      let end = this.currentPdfFlowerId * 10;
      folderName = `${start}-${end}`;
    }

    let fileName = '';
    if (pageNum <= 10) {
      fileName = `flowers_of_quran_page_${pageNum.toString().padStart(2, '0')}.webp`;
    } else {
      fileName = `flowers_of_quran_page_${pageNum.toString().padStart(3, '0')}.webp`;
    }

    const basePath = window.location.pathname.includes('/about/') 
      ? '../assets/downloads/flowers_of_quran_pages_011-234_webp/' 
      : 'assets/downloads/flowers_of_quran_pages_011-234_webp/';
    return `${basePath}${folderName}/${fileName}`;
  }

  initPdfLibrary() {
    // PDF.js is no longer used, image viewer replaces it.
  }

  initCloudAuth() {
    if (!this.cloud) return;
    this.cloud.init(async (user) => {
      this.state.authUser = user;
      if (user) {
        const displayName = user.user_metadata?.name || user.phone || (user.email ? user.email.split('@')[0] : 'Profile');
        localStorage.setItem('quran_user_logged_in', JSON.stringify({ phone: user.phone, email: user.email, name: displayName }));
        if (this.btnLoginNav) this.btnLoginNav.style.display = 'none';
        if (this.btnRegisterNav) this.btnRegisterNav.style.display = 'none';
        if (this.btnLogoutNav) {
          this.btnLogoutNav.style.display = 'inline-flex';
          this.btnLogoutNav.textContent = '🚪 Sign Out';
        }
        if (this.loggedInUserInfo) this.loggedInUserInfo.textContent = user.phone ? `📱 ${user.phone}` : (user.email || displayName);
        if (this.authFormView) this.authFormView.style.display = 'none';
        if (this.authLoggedInView) this.authLoggedInView.style.display = 'block';

        const userId = user.id || user.uid;
        const cloudData = await this.cloud.fetchProgress(userId, 'flowers_progress');
        if (cloudData && Array.isArray(cloudData.unlocked) && cloudData.unlocked.length > 0) {
          // Exactly load this authenticated user's database progress - NEVER merge with previous user!
          this.state.unlockedFlowers = Array.from(new Set(cloudData.unlocked));
          this.state.completedFlowers = Array.isArray(cloudData.completed) ? Array.from(new Set(cloudData.completed)) : [];
          localStorage.setItem('flowers_of_quran_state', JSON.stringify({
            unlocked: this.state.unlockedFlowers,
            completed: this.state.completedFlowers
          }));
          this.renderGardenDashboard();
        } else {
          // Fresh user in cloud: If they have local progress, sync it UP. Otherwise, start at 1.
          const saved = localStorage.getItem('flowers_of_quran_state');
          let localUnlocked = [1];
          let localCompleted = [];
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed.unlocked && parsed.unlocked.length > 0) {
                localUnlocked = parsed.unlocked;
                localCompleted = parsed.completed || [];
              }
            } catch(e) {}
          }
          this.state.unlockedFlowers = localUnlocked;
          this.state.completedFlowers = localCompleted;
          this.saveState();
          this.renderGardenDashboard();
        }
      } else {
        this.resetToDefaultState();
        if (this.btnLoginNav) this.btnLoginNav.style.display = 'inline-block';
        if (this.btnRegisterNav) this.btnRegisterNav.style.display = 'inline-block';
        if (this.btnLogoutNav) this.btnLogoutNav.style.display = 'none';
        this.setAuthMode('login');
        if (this.authLoggedInView) this.authLoggedInView.style.display = 'none';
      }
    });
  }

  bindEvents() {
    // Hamburger Menu Toggle
    if (this.hamburgerBtn && this.navMenu) {
      const icon = this.hamburgerBtn.querySelector('i');
      this.hamburgerBtn.addEventListener('click', () => {
        this.navMenu.classList.toggle('open');
        if (this.navMenu.classList.contains('open')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
      // Close mobile menu on clicking any navigation link
      this.navMenu.querySelectorAll('.nav-link, .nav-btn-gold, .nav-btn-outline').forEach(item => {
        item.addEventListener('click', () => {
          this.navMenu.classList.remove('open');
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        });
      });
    }

    // Start Quiz Button
    if (this.btnStartQuiz) {
      this.btnStartQuiz.addEventListener('click', () => {
        const target = document.getElementById('garden-section');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Sound Toggle
    if (this.btnSound) {
      this.btnSound.addEventListener('click', () => {
        const enabled = this.audio.toggleSound();
        this.btnSound.textContent = enabled ? '🔊' : '🔇';
      });
    }

    // Modals - About & Contact
    const openAbout = (e) => {
      e.preventDefault();
      if (this.aboutModal) this.aboutModal.classList.add('active');
    };
    const openContact = (e) => {
      e.preventDefault();
      if (this.contactModal) this.contactModal.classList.add('active');
    };

    if (this.linkAbout) this.linkAbout.addEventListener('click', openAbout);
    if (this.footerLinkAbout) this.footerLinkAbout.addEventListener('click', openAbout);
    if (this.btnCloseAbout) this.btnCloseAbout.addEventListener('click', () => this.aboutModal.classList.remove('active'));

    if (this.linkContact) this.linkContact.addEventListener('click', openContact);
    if (this.footerLinkContact) this.footerLinkContact.addEventListener('click', openContact);
    if (this.btnCloseContact) this.btnCloseContact.addEventListener('click', () => this.contactModal.classList.remove('active'));

    if (this.btnSubmitContact) {
      this.btnSubmitContact.addEventListener('click', () => {
        if (this.contactSuccessMsg) this.contactSuccessMsg.style.display = 'block';
        setTimeout(() => {
          if (this.contactModal) this.contactModal.classList.remove('active');
          if (this.contactSuccessMsg) this.contactSuccessMsg.style.display = 'none';
        }, 1500);
      });
    }

    // Auth Mode Switch Tabs
    if (this.tabAuthLogin) {
      this.tabAuthLogin.addEventListener('click', () => this.setAuthMode('login'));
    }
    if (this.tabAuthRegister) {
      this.tabAuthRegister.addEventListener('click', () => this.setAuthMode('register'));
    }

    // Auth Modals
    if (this.btnLoginNav) {
      this.btnLoginNav.addEventListener('click', () => {
        this.setAuthMode('login');
        if (this.loginModal) this.loginModal.classList.add('active');
      });
    }

    if (this.btnRegisterNav) {
      this.btnRegisterNav.addEventListener('click', () => {
        this.setAuthMode('register');
        if (this.loginModal) this.loginModal.classList.add('active');
      });
    }

    if (this.btnCloseLogin) {
      this.btnCloseLogin.addEventListener('click', () => {
        if (this.loginModal) this.loginModal.classList.remove('active');
      });
    }


    if (this.btnCloseCertificate) {
      this.btnCloseCertificate.addEventListener('click', () => {
        if (this.certificateModal) this.certificateModal.classList.remove('active');
      });
    }

    if (this.btnDownloadPdfCert) {
      this.btnDownloadPdfCert.addEventListener('click', () => this.downloadCertificatePdf());
    }

    if (this.btnVictoryDownloadCert) {
      this.btnVictoryDownloadCert.addEventListener('click', () => {
        if (this.certificateModal) {
          const previewNameEl = document.getElementById('cert-preview-name');
          if (previewNameEl) {
            let userName = "STUDENT";
            try {
              const cached = localStorage.getItem('quran_user_logged_in');
              if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.name && parsed.name.trim() !== '') {
                  userName = parsed.name;
                } else if (parsed.phone) {
                  userName = parsed.phone;
                }
              }
            } catch(e) {}
            previewNameEl.textContent = userName;
          }
          if (this.modalOverlay) this.modalOverlay.classList.remove('active'); // Close quiz modal
          this.certificateModal.classList.add('active'); // Open cert preview
        }
      });
    }

    // Country Code Change Hint Listener
    if (this.authCountryCode) {
      this.authCountryCode.addEventListener('change', () => {
        const val = this.authCountryCode.value;
        if (this.authPhoneNumInput) {
          this.authPhoneNumInput.placeholder = "10-digit number";
          this.authPhoneNumInput.maxLength = 10;
        }
        if (this.phoneHintText) this.phoneHintText.textContent = `Enter 10-digit mobile number for ${val}`;
      });
    }

    // Direct Submit Handler
    if (this.btnSubmitPhoneAuth) {
      this.btnSubmitPhoneAuth.addEventListener('click', async () => {
        const countryCode = this.authCountryCode ? this.authCountryCode.value : '+91';
        const phoneNum = this.authPhoneNumInput ? this.authPhoneNumInput.value.trim() : '';
        const name = this.authNameInput ? this.authNameInput.value.trim() : '';
        const age = this.authAgeInput ? this.authAgeInput.value.trim() : '';
        const gender = this.authGenderInput ? this.authGenderInput.value.trim() : '';

        if (!phoneNum) {
          if (this.authErrorMsg) {
            this.authErrorMsg.textContent = "Please enter your mobile phone number.";
            this.authErrorMsg.style.display = 'block';
          }
          return;
        }

        if (this.authMode === 'register' && !name) {
          if (this.authErrorMsg) {
            this.authErrorMsg.textContent = "Please enter your full name.";
            this.authErrorMsg.style.display = 'block';
          }
          return;
        }

        this.btnSubmitPhoneAuth.disabled = true;
        this.btnSubmitPhoneAuth.textContent = "Connecting...";

        try {
          const userObj = await this.cloud.loginWithPhone(countryCode, phoneNum, { name, age, gender }, this.authMode);
          if (this.authSuccessMsg) {
            this.authSuccessMsg.textContent = `✅ Welcome ${userObj.user_metadata.name || userObj.phone}! Access granted.`;
            this.authSuccessMsg.style.display = 'block';
          }
          if (this.authErrorMsg) this.authErrorMsg.style.display = 'none';

          setTimeout(() => {
            if (this.loginModal) this.loginModal.classList.remove('active');
          }, 800);
        } catch (err) {
          if (this.authErrorMsg) {
            this.authErrorMsg.textContent = err.message || "Invalid phone number.";
            this.authErrorMsg.style.display = 'block';
          }
          if (this.authSuccessMsg) this.authSuccessMsg.style.display = 'none';
        } finally {
          if (this.btnSubmitPhoneAuth) {
            this.btnSubmitPhoneAuth.disabled = false;
            this.btnSubmitPhoneAuth.textContent = this.authMode === 'register' ? "Register & Get Access ➔" : "Sign In & Get Access ➔";
          }
        }
      });
    }

    // Sign Out Handlers
    if (this.btnLogout) {
      this.btnLogout.addEventListener('click', async () => {
        await this.cloud.logout();
        this.resetToDefaultState();
        if (this.btnLoginNav) this.btnLoginNav.style.display = 'inline-block';
        if (this.btnRegisterNav) this.btnRegisterNav.style.display = 'inline-block';
        if (this.btnLogoutNav) this.btnLogoutNav.style.display = 'none';
        if (this.loginModal) this.loginModal.classList.remove('active');
      });
    }

    if (this.btnLogoutNav) {
      this.btnLogoutNav.addEventListener('click', () => {
        if (this.logoutConfirmModal) this.logoutConfirmModal.classList.add('active');
      });
    }

    if (this.btnCancelLogout) {
      this.btnCancelLogout.addEventListener('click', () => {
        if (this.logoutConfirmModal) this.logoutConfirmModal.classList.remove('active');
      });
    }

    if (this.btnConfirmLogout) {
      this.btnConfirmLogout.addEventListener('click', async () => {
        if (this.logoutConfirmModal) this.logoutConfirmModal.classList.remove('active');
        await this.cloud.logout();
        this.resetToDefaultState();
        if (this.btnLoginNav) this.btnLoginNav.style.display = 'inline-block';
        if (this.btnRegisterNav) this.btnRegisterNav.style.display = 'inline-block';
        if (this.btnLogoutNav) this.btnLogoutNav.style.display = 'none';
      });
    }

    // PDF Reader Controls
    if (this.btnClosePdf) {
      this.btnClosePdf.addEventListener('click', () => {
        if (this.pdfModal) this.pdfModal.classList.remove('active');
      });
    }

    if (this.btnPdfPrev) {
      this.btnPdfPrev.addEventListener('click', () => {
        if (this.currentPdfPageNum > this.pdfPageStart) {
          this.currentPdfPageNum--;
          this.renderPdfPage(this.currentPdfPageNum);
        }
      });
    }

    if (this.btnPdfNext) {
      this.btnPdfNext.addEventListener('click', () => {
        if (this.currentPdfPageNum < this.pdfPageEnd) {
          this.currentPdfPageNum++;
          this.renderPdfPage(this.currentPdfPageNum);
        }
      });
    }

    if (this.btnProceedQuiz) {
      this.btnProceedQuiz.addEventListener('click', () => {
        if (this.pdfModal) this.pdfModal.classList.remove('active');
        this.openQuizModal(this.currentPdfFlowerId);
      });
    }

    // PDF Zoom Controls (+10% / -10%)
    if (this.btnZoomIn) {
      this.btnZoomIn.addEventListener('click', () => {
        if (this.pdfZoomPercent < 200) {
          this.pdfZoomPercent += 10;
          if (this.pdfZoomVal) this.pdfZoomVal.textContent = `${this.pdfZoomPercent}%`;
          this.renderPdfPage(this.currentPdfPageNum);
        }
      });
    }

    if (this.btnZoomOut) {
      this.btnZoomOut.addEventListener('click', () => {
        if (this.pdfZoomPercent > 50) {
          this.pdfZoomPercent -= 10;
          if (this.pdfZoomVal) this.pdfZoomVal.textContent = `${this.pdfZoomPercent}%`;
          this.renderPdfPage(this.currentPdfPageNum);
        }
      });
    }

    // Quiz Modal Controls
    if (this.btnCloseModal) {
      this.btnCloseModal.addEventListener('click', () => this.closeQuizModal());
    }

    if (this.btnNextQuestion) {
      this.btnNextQuestion.addEventListener('click', () => this.handleNextQuestion());
    }

    // Victory Action Buttons (Back + Study Next)
    if (this.btnVictoryBack) {
      this.btnVictoryBack.addEventListener('click', () => {
        this.closeQuizModal();
      });
    }

    if (this.btnVictoryNext) {
      this.btnVictoryNext.addEventListener('click', () => {
        this.closeQuizModal();
        const nextId = this.state.currentFlowerId + 1;
        if (nextId <= this.dataset.length && this.state.unlockedFlowers.includes(nextId)) {
          setTimeout(() => this.openPdfReader(nextId), 300);
        }
      });
    }

    // Failure Screen Action Button (Retry after reading PDF)
    if (this.btnReviewPdf) {
      this.btnReviewPdf.addEventListener('click', () => {
        this.closeQuizModal();
        this.openPdfReader(this.state.currentFlowerId);
      });
    }

    if (this.btnRetryQuiz) {
      this.btnRetryQuiz.addEventListener('click', () => {
        this.openQuizModal(this.state.currentFlowerId);
      });
    }

    // Overlay backdrop clicks
    [this.modalOverlay, this.pdfModal, this.loginModal, this.aboutModal, this.contactModal, this.logoutConfirmModal].forEach(m => {
      if (m) {
        m.addEventListener('click', (e) => {
          if (e.target === m) m.classList.remove('active');
        });
      }
    });

    // Window resize handler to keep PDF fitted without scrolling
    window.addEventListener('resize', () => {
      if (this.pdfModal && this.pdfModal.classList.contains('active')) {
        this.renderPdfPage(this.currentPdfPageNum);
      }
    });
  }

  setAuthMode(mode) {
    this.authMode = mode;
    if (this.authErrorMsg) this.authErrorMsg.style.display = 'none';
    if (this.authSuccessMsg) this.authSuccessMsg.style.display = 'none';
    if (this.authFormView) this.authFormView.style.display = 'block';

    if (mode === 'register') {
      if (this.authTabs) this.authTabs.style.display = 'flex';
      if (this.tabAuthRegister) this.tabAuthRegister.classList.add('active');
      if (this.tabAuthLogin) this.tabAuthLogin.classList.remove('active');
      if (this.fieldAuthName) this.fieldAuthName.style.display = 'block';
      if (this.fieldAuthAge) this.fieldAuthAge.style.display = 'block';
      if (this.fieldAuthGender) this.fieldAuthGender.style.display = 'block';
      if (this.modalAuthTitle) this.modalAuthTitle.textContent = "Create Account";
      if (this.btnSubmitPhoneAuth) this.btnSubmitPhoneAuth.textContent = "Register & Get Access ➔";
    } else {
      // login mode default
      if (this.authTabs) this.authTabs.style.display = 'flex';
      if (this.tabAuthLogin) this.tabAuthLogin.classList.add('active');
      if (this.tabAuthRegister) this.tabAuthRegister.classList.remove('active');
      if (this.fieldAuthName) this.fieldAuthName.style.display = 'none';
      if (this.fieldAuthAge) this.fieldAuthAge.style.display = 'none';
      if (this.fieldAuthGender) this.fieldAuthGender.style.display = 'none';
      if (this.modalAuthTitle) this.modalAuthTitle.textContent = "Sign In";
      if (this.btnSubmitPhoneAuth) this.btnSubmitPhoneAuth.textContent = "Sign In & Get Access ➔";
    }
  }

  // --- PDF STUDY READER ENGINE (10 Pages per Flower) ---
  openPdfReader(flowerId) {
    const flower = this.dataset.find(f => f.id === flowerId);
    if (!flower) return;

    this.currentPdfFlowerId = flowerId;
    this.pdfPageStart = (flowerId - 1) * 10 + 1;
    this.pdfPageEnd = (flowerId === 24) ? 234 : flowerId * 10;
    this.pdfZoomPercent = 100;
    if (this.pdfZoomVal) this.pdfZoomVal.textContent = '100%';

    if (this.pdfFlowerIcon) this.pdfFlowerIcon.textContent = flower.icon;
    if (this.pdfFlowerTitle) this.pdfFlowerTitle.textContent = `Flower ${flower.id}`;
    if (this.pdfPageRangeSub) this.pdfPageRangeSub.textContent = `Pages ${this.pdfPageStart} – ${this.pdfPageEnd}`;

    this.currentPdfPageNum = this.pdfPageStart;
    if (this.pdfModal) this.pdfModal.classList.add('active');

    this.renderPdfPage(this.currentPdfPageNum);
  }

  async renderPdfPage(pageNum) {
    if (!this.pdfCanvas) return;

    if (this.pdfCurrentPageEl) this.pdfCurrentPageEl.textContent = pageNum;
    if (this.pdfTotalPageEl) this.pdfTotalPageEl.textContent = `${this.pdfPageEnd}`;
    if (this.btnPdfPrev) this.btnPdfPrev.disabled = (pageNum <= this.pdfPageStart);
    if (this.btnPdfNext) this.btnPdfNext.disabled = (pageNum >= this.pdfPageEnd);

    // Only reveal "Proceed to Quiz" button on the last page of the section
    const isFinalPage = (pageNum >= this.pdfPageEnd);
    if (isFinalPage) {
      if (this.pdfReadHint) this.pdfReadHint.style.display = 'none';
      if (this.btnProceedQuiz) {
        this.btnProceedQuiz.classList.add('visible');
        this.btnProceedQuiz.style.display = 'inline-flex';
      }
    } else {
      if (this.pdfReadHint) this.pdfReadHint.style.display = 'inline-flex';
      if (this.btnProceedQuiz) {
        this.btnProceedQuiz.classList.remove('visible');
        this.btnProceedQuiz.style.display = 'none';
      }
    }

    if (this.pdfLoadingSpinner) {
      this.pdfLoadingSpinner.style.display = 'none';
    }

    try {
      const imgPath = this.getWebpImagePath(pageNum);
      const img = new Image();
      img.src = imgPath;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      if (this.pdfLoadingSpinner) this.pdfLoadingSpinner.style.display = 'none';
      
      const viewerBody = document.querySelector('.pdf-viewer-body');
      const maxH = viewerBody ? (viewerBody.clientHeight - 16) : (window.innerHeight * 0.62);
      const maxW = viewerBody ? (viewerBody.clientWidth - 16) : Math.min(window.innerWidth * 0.85, 720);

      // Enable scrolling only if user zoomed in > 100%
      if (viewerBody) {
        viewerBody.style.overflow = (this.pdfZoomPercent > 100) ? 'auto' : 'hidden';
      }

      const scaleHeight = maxH / img.height;
      const scaleWidth = maxW / img.width;
      const baseFitScale = Math.min(scaleHeight, scaleWidth, 1.25);
      const zoomMultiplier = (this.pdfZoomPercent || 100) / 100;
      const finalDisplayScale = baseFitScale * zoomMultiplier;

      // ULTRA-SHARP HD / RETINA RENDERING:
      const dpr = Math.max(window.devicePixelRatio || 1, 2.0);
      const drawWidth = img.width * finalDisplayScale;
      const drawHeight = img.height * finalDisplayScale;

      this.pdfCanvas.width = Math.floor(drawWidth * dpr);
      this.pdfCanvas.height = Math.floor(drawHeight * dpr);
      this.pdfCanvas.style.width = Math.floor(drawWidth) + "px";
      this.pdfCanvas.style.height = Math.floor(drawHeight) + "px";

      const context = this.pdfCanvas.getContext('2d', { alpha: false });
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      
      if (dpr !== 1) {
        context.scale(dpr, dpr);
      }
      
      // Draw a white background first, in case of transparency or sub-pixel rendering edges
      context.fillStyle = 'white';
      context.fillRect(0, 0, drawWidth, drawHeight);
      context.drawImage(img, 0, 0, drawWidth, drawHeight);
    } catch (err) {
      console.log('Error rendering image page:', err);
      if (this.pdfLoadingSpinner) {
        this.pdfLoadingSpinner.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Error loading page ${pageNum}.`;
      }
    }
  }

  renderGardenDashboard() {
    if (this.modSectionsCount) {
      this.modSectionsCount.textContent = `${this.state.completedFlowers.length} / ${this.dataset.length}`;
    }

    if (!this.sectionsGrid) return;
    this.sectionsGrid.innerHTML = '';

    this.dataset.forEach(item => {
      const isUnlocked = this.state.unlockedFlowers.includes(item.id);
      const isCompleted = this.state.completedFlowers.includes(item.id);

      const card = document.createElement('div');
      card.className = `section-card ${isCompleted ? 'completed' : (isUnlocked ? 'unlocked' : 'locked')}`;
      
      let statusIcon = '🔒';
      let statusBadge = `<span class="status-badge-bottom lock">Locked</span>`;
      if (isCompleted) {
        statusIcon = '✅';
        statusBadge = `<span class="status-badge-bottom done">Bloomed</span>`;
      } else if (isUnlocked) {
        statusIcon = '🌸';
        statusBadge = `<span class="status-badge-bottom ready">Start Reading</span>`;
      }

      card.innerHTML = `
        <span class="section-badge-num">Flower ${item.id}</span>
        <span class="status-icon">${statusIcon}</span>
        <div class="section-icon-wrapper">
          <img src="assets/images/gold_flower.svg" alt="Flower ${item.id}" class="section-icon-img" />
        </div>
        <div class="section-card-title">Flower ${item.id}</div>
        <div class="section-card-sub">Pages ${(item.id - 1) * 10 + 1} – ${item.id === 24 ? 234 : item.id * 10}</div>
        ${statusBadge}
      `;

      card.addEventListener('click', () => {
        if (isUnlocked) {
          // Open 10-page PDF study reader before quiz!
          this.openPdfReader(item.id);
        } else {
          this.audio.playWrong();
        }
      });

      this.sectionsGrid.appendChild(card);
    });

    // --- ADD CERTIFICATE MODULE ---
    const allCompleted = this.state.completedFlowers.length >= this.dataset.length;
    
    if (allCompleted) {
      const certCard = document.createElement('div');
      certCard.className = `section-card completed`;
      
      let certStatusIcon = '🏆';
      let certStatusBadge = `<span class="status-badge-bottom done" style="background:#10B981;">Claim Certificate</span>`;

      certCard.innerHTML = `
        <span class="section-badge-num">Achievement</span>
        <span class="status-icon">${certStatusIcon}</span>
        <div class="section-icon-wrapper" style="border: 2px solid #E5E7EB; padding: 12px; border-radius: 50%;">
          <span style="font-size: 2.2rem;">📜</span>
        </div>
        <div class="section-card-title">Course Certificate</div>
        <div class="section-card-sub">Complete all 24 Flowers</div>
        ${certStatusBadge}
      `;

      certCard.addEventListener('click', () => {
        if (this.certificateModal) {
          const previewNameEl = document.getElementById('cert-preview-name');
          if (previewNameEl) {
            let userName = "STUDENT";
            try {
              const cached = localStorage.getItem('quran_user_logged_in');
              if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.name && parsed.name.trim() !== '') {
                  userName = parsed.name;
                } else if (parsed.phone) {
                  userName = parsed.phone;
                }
              }
            } catch(e) {}
            previewNameEl.textContent = userName;
          }
          this.certificateModal.classList.add('active');
        }
      });

      this.sectionsGrid.appendChild(certCard);
    }
  }

  downloadCertificatePdf() {
    if (this.btnDownloadPdfCert) {
      this.btnDownloadPdfCert.textContent = "⏳ Generating PDF...";
      this.btnDownloadPdfCert.disabled = true;
    }

    try {
      const { jsPDF } = window.jspdf;

      const img = new Image();
      img.src = 'assets/downloads/FLOWERS OF QURAN CERTIFICATE.jpg.jpeg';
      img.onload = () => {
        // Use exact image dimensions to prevent any stretching
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        // PDF orientation depends on image aspect ratio
        const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
        
        const doc = new jsPDF({
          orientation: orientation,
          unit: 'px',
          format: [imgWidth, imgHeight]
        });

        doc.addImage(img, 'JPEG', 0, 0, imgWidth, imgHeight);

        let userName = "STUDENT";
        try {
          const cached = localStorage.getItem('quran_user_logged_in');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.name && parsed.name.trim() !== '') {
              userName = parsed.name;
            } else if (parsed.phone) {
              userName = parsed.phone;
            }
          }
        } catch(e) {}

        userName = userName.toUpperCase();

        doc.setFont("helvetica", "bold");
        // Scale font size based on image width, increased size by 6
        const fontSize = Math.max(42, (imgWidth * 0.045) + 6); 
        doc.setFontSize(fontSize);
        doc.setTextColor(0, 0, 0); // Black color
        
        // Use a slightly smaller percentage (45.0%) to push the text up in the PDF and create a margin above the line
        const textY = imgHeight * 0.450;
        doc.text(userName, imgWidth / 2, textY, { align: 'center' });

        doc.save(`Flowers_of_Quran_Certificate_${userName.replace(/[^A-Z0-9]/g, '')}.pdf`);

        if (this.btnDownloadPdfCert) {
          this.btnDownloadPdfCert.textContent = "✅ Downloaded!";
          setTimeout(() => {
            this.btnDownloadPdfCert.textContent = "📥 Download Certificate (PDF)";
            this.btnDownloadPdfCert.disabled = false;
          }, 3000);
        }
      };
      
      img.onerror = () => {
        alert("Failed to load certificate image.");
        if (this.btnDownloadPdfCert) {
          this.btnDownloadPdfCert.textContent = "📥 Download Certificate (PDF)";
          this.btnDownloadPdfCert.disabled = false;
        }
      };
    } catch(err) {
      console.error("jsPDF Error:", err);
      if (this.btnDownloadPdfCert) {
        this.btnDownloadPdfCert.textContent = "📥 Download Certificate (PDF)";
        this.btnDownloadPdfCert.disabled = false;
      }
    }
  }

  // --- QUIZ ENGINE WITH STRICT PROGRESSION & ERROR BREAKDOWN ---
  openQuizModal(flowerId) {
    const flower = this.dataset.find(f => f.id === flowerId);
    if (!flower) return;

    this.state.currentFlowerId = flowerId;
    this.state.currentQuestionIdx = 0;
    this.state.isAnswered = false;
    this.state.userAnswers = []; // Reset answers tracker

    if (this.quizView) this.quizView.style.display = 'block';
    if (this.victoryView) this.victoryView.style.display = 'none';
    if (this.failureView) this.failureView.style.display = 'none';

    if (this.modalFlowerIcon) this.modalFlowerIcon.textContent = flower.icon;
    if (this.modalFlowerTitle) this.modalFlowerTitle.textContent = `Flower ${flower.id}`;
    if (this.modalFlowerSub) this.modalFlowerSub.textContent = '';

    this.renderQuestionStep();
    if (this.modalOverlay) this.modalOverlay.classList.add('active');
  }

  closeQuizModal() {
    if (this.modalOverlay) this.modalOverlay.classList.remove('active');
    this.renderGardenDashboard();
  }

  renderQuestionStep() {
    const flower = this.dataset.find(f => f.id === this.state.currentFlowerId);
    const question = flower.questions[this.state.currentQuestionIdx];
    this.state.isAnswered = false;

    if (this.questionStepper) {
      this.questionStepper.innerHTML = '';
      flower.questions.forEach((q, idx) => {
        const step = document.createElement('div');
        let statusClass = (idx < this.state.currentQuestionIdx) ? 'completed' : ((idx === this.state.currentQuestionIdx) ? 'active' : '');
        step.className = `step-item ${statusClass}`;
        step.textContent = (idx < this.state.currentQuestionIdx) ? '✓' : `Q${idx + 1}`;
        this.questionStepper.appendChild(step);
      });
    }

    if (this.questionText) this.questionText.textContent = question.question;
    if (this.optionsGrid) this.optionsGrid.innerHTML = '';
    if (this.feedbackBox) this.feedbackBox.style.display = 'none';
    if (this.btnNextQuestion) {
      this.btnNextQuestion.disabled = true;
      this.btnNextQuestion.textContent = (this.state.currentQuestionIdx === 2) ? 'Finish & Check Results ➔' : 'Next Question ➔';
    }

    const letters = ['A', 'B', 'C', 'D'];
    question.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="option-letter">${letters[optIdx]}</span><span>${optText}</span>`;

      btn.addEventListener('click', () => {
        if (!this.state.isAnswered) {
          this.handleOptionSelect(optIdx, question, btn);
        }
      });

      if (this.optionsGrid) this.optionsGrid.appendChild(btn);
    });
  }

  handleOptionSelect(selectedIdx, question, selectedBtn) {
    this.state.isAnswered = true;
    const isCorrect = (selectedIdx === question.correct);

    // Record user answer
    this.state.userAnswers[this.state.currentQuestionIdx] = {
      questionText: question.question,
      userOption: question.options[selectedIdx],
      correctOption: question.options[question.correct],
      isCorrect: isCorrect,
      explanation: question.explanation
    };

    if (isCorrect) {
      this.audio.playCorrect();
      selectedBtn.classList.add('selected-correct');
      if (this.feedbackBox) {
        this.feedbackBox.className = 'feedback-box correct';
        this.feedbackBox.textContent = 'Correct';
        this.feedbackBox.style.display = 'block';
      }
      if (this.btnNextQuestion) this.btnNextQuestion.disabled = false;
    } else {
      this.audio.playWrong();
      selectedBtn.classList.add('selected-wrong');
      // DO NOT show the correct option using green theme
      if (this.feedbackBox) {
        this.feedbackBox.className = 'feedback-box wrong';
        this.feedbackBox.textContent = 'Incorrect';
        this.feedbackBox.style.display = 'block';
      }
      if (this.btnNextQuestion) this.btnNextQuestion.disabled = false;
    }
  }

  handleNextQuestion() {
    if (this.state.currentQuestionIdx < 2) {
      this.state.currentQuestionIdx++;
      this.renderQuestionStep();
    } else {
      this.evaluateQuizResults();
    }
  }

  evaluateQuizResults() {
    const flowerId = this.state.currentFlowerId;
    const correctCount = this.state.userAnswers.filter(a => a && a.isCorrect).length;

    if (this.quizView) this.quizView.style.display = 'none';

    if (correctCount === 3) {
      // 1. ALL 3 CORRECT -> PASS & UNLOCK NEXT LEVEL
      if (!this.state.completedFlowers.includes(flowerId)) {
        this.state.completedFlowers.push(flowerId);
      }

      const nextId = flowerId + 1;
      if (nextId <= this.dataset.length && !this.state.unlockedFlowers.includes(nextId)) {
        this.state.unlockedFlowers.push(nextId);
      }

      this.saveState();
      this.audio.playVictory();
      this.triggerConfetti();

      if (this.victoryView) this.victoryView.style.display = 'block';
      if (this.failureView) this.failureView.style.display = 'none';

      const flower = this.dataset.find(f => f.id === flowerId);
      if (this.victoryFlowerIcon) this.victoryFlowerIcon.textContent = flower ? flower.icon : '🌸';
      if (this.victoryTitle) this.victoryTitle.textContent = `Flower ${flowerId}`;
      if (this.btnVictoryNext) {
        if (nextId <= this.dataset.length) {
          this.btnVictoryNext.textContent = `Study Flower ${nextId} ➔`;
          if (this.btnVictoryDownloadCert) this.btnVictoryDownloadCert.style.display = 'none';
        } else {
          this.btnVictoryNext.textContent = "All 24 Flowers Bloomed! 🎉";
          if (this.btnVictoryDownloadCert) this.btnVictoryDownloadCert.style.display = 'block';
        }
      }

    } else {
      // 2. ANY WRONG -> FAIL & SHOW ERROR BREAKDOWN LIST (Without showing correct answer)
      this.audio.playWrong();

      if (this.victoryView) this.victoryView.style.display = 'none';
      if (this.failureView) this.failureView.style.display = 'block';

      if (this.failureScoreBadge) {
        this.failureScoreBadge.textContent = `Score: ${correctCount} / 3 Correct`;
      }

      if (this.errorBreakdownList) {
        this.errorBreakdownList.innerHTML = '';
        this.state.userAnswers.forEach((ans, idx) => {
          if (!ans.isCorrect) {
            const item = document.createElement('div');
            item.className = 'error-breakdown-item';
            item.innerHTML = `
              <div class="error-q-text">Q${idx + 1}: ${ans.questionText}</div>
              <div class="error-tag-wrong">❌ Your Answer: "${ans.userOption}" (Incorrect)</div>
            `;
            this.errorBreakdownList.appendChild(item);
          }
        });
      }
    }
  }

  triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#D4AF37', '#9A7B1C', '#10B981', '#3B82F6', '#F59E0B'];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: canvas.width / 2, y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.7) * 14,
        size: Math.random() * 8 + 5, color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.opacity -= 0.015;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      });
      frame++;
      if (frame < 75) requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animate();
  }
}

window.QuranHubApp = FlowersOfQuranApp;
window.FlowersApp = FlowersOfQuranApp;

document.addEventListener('DOMContentLoaded', () => {
  window.app = new FlowersOfQuranApp();
});
