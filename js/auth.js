// SpendSense - Authentication & Session Controller
const Auth = {
  currentSession: null,
  currentUser: null,

  /**
   * Helper to verify if user is allowed on protected pages
   * Returns user object if logged in or in Demo Mode, otherwise null
   * Real Supabase sessions ALWAYS take precedence over Demo Mode.
   */
  async getOrAuthenticateUser() {
    // 1. Check Supabase Real Session first
    try {
      if (window.supabaseClient) {
        const { data } = await supabaseClient.auth.getSession();
        if (data && data.session && data.session.user) {
          // Live user session detected -> turn off demo sandbox
          if (window.DemoManager && DemoManager.isDemoMode()) {
            localStorage.setItem(DemoManager.STORAGE_KEY_MODE, "false");
          }
          this.currentSession = data.session;
          this.currentUser = data.session.user;
          window.currentSession = data.session;
          window.currentUser = data.session.user;
          return data.session.user;
        }
      }
    } catch (e) {
      console.warn("Session check warning:", e);
    }

    // 2. Only enter/serve Demo Mode if NO real session exists
    if (window.DemoManager && DemoManager.isDemoMode()) {
      this.currentSession = null;
      this.currentUser = DemoManager.DEMO_USER;
      window.currentUser = DemoManager.DEMO_USER;
      return DemoManager.DEMO_USER;
    }

    return null;
  },

  /**
   * Initialize Auth on Landing Page (index.html)
   */
  async init() {
    this.bindLandingEvents();

    // Check if session exists on load
    const user = await this.getOrAuthenticateUser();
    if (user) {
      const path = window.location.pathname;
      if (path.endsWith("index.html") || path === "/" || path === "") {
        window.location.href = "dashboard.html";
      }
    }

    // Subscribe to auth state updates (e.g. OAuth redirect return, logout, token refresh)
    if (window.supabaseClient) {
      supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log(`[Auth Event] ${event}`);
        if (session) {
          // If real login succeeds, disable demo mode
          if (window.DemoManager) {
            localStorage.setItem(DemoManager.STORAGE_KEY_MODE, "false");
          }
          this.currentSession = session;
          this.currentUser = session.user;
          window.currentSession = session;
          window.currentUser = session.user;

          const path = window.location.pathname;
          if (path.endsWith("index.html") || path === "/" || path === "") {
            window.location.href = "dashboard.html";
          }
        }
      });
    }
  },

  bindLandingEvents() {
    const googleBtn = document.getElementById("googleLoginBtn");
    const authForm = document.getElementById("authForm");
    const authToggle = document.getElementById("authToggleLink");
    const demoModeBtn = document.getElementById("demoModeBtn");
    const heroDemoBtn = document.getElementById("heroDemoBtn");

    if (googleBtn) {
      googleBtn.addEventListener("click", () => this.signInWithGoogle());
    }

    if (authForm) {
      authForm.addEventListener("submit", (e) => this.handleEmailAuth(e));
    }

    if (authToggle) {
      authToggle.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleAuthMode();
      });
    }

    // 1-Click Demo Entry triggers
    [demoModeBtn, heroDemoBtn].forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", () => {
          if (window.DemoManager) {
            DemoManager.enterDemoMode();
          }
        });
      }
    });
  },

  /**
   * Google OAuth Sign-In via Supabase
   */
  async signInWithGoogle() {
    this.clearError();
    if (window.DemoManager) {
      localStorage.setItem(DemoManager.STORAGE_KEY_MODE, "false");
    }

    try {
      if (!window.supabaseClient) {
        throw new Error("Authentication service is initializing. Please try again.");
      }

      const redirectOrigin = window.location.origin;
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${redirectOrigin}/dashboard.html`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      let msg = err.message || "Failed to initialize Google login.";
      if (msg.toLowerCase().includes("provider") || msg.toLowerCase().includes("not enabled")) {
        msg = "Google login requires enabling the Google provider in your Supabase dashboard (Authentication > Providers > Google). You can sign in with Email or use the 1-click Live Demo!";
      }
      this.showError(msg);
      if (window.UI) UI.toast(msg, "warning", 6000);
    }
  },

  /**
   * Email/Password Auth (Sign In or Sign Up)
   */
  async handleEmailAuth(e) {
    e.preventDefault();
    this.clearError();
    if (window.DemoManager) {
      localStorage.setItem(DemoManager.STORAGE_KEY_MODE, "false");
    }

    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    const isSignUp = document.getElementById("authForm").dataset.mode === "signup";
    const submitBtn = document.getElementById("authSubmitBtn");

    if (!email || !password) {
      this.showError("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      this.showError("Password must be at least 6 characters.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";

    try {
      if (isSignUp) {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (data.session) {
          window.location.href = "dashboard.html";
        } else {
          this.showError("Account created! Please verify your email or sign in.");
          this.toggleAuthMode("signin");
        }
      } else {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        window.location.href = "dashboard.html";
      }
    } catch (err) {
      console.error("Email auth error:", err);
      this.showError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = isSignUp ? "Create Account" : "Sign In";
    }
  },

  /**
   * Toggle between Login and Signup modes
   */
  toggleAuthMode(targetMode) {
    this.clearError();
    const form = document.getElementById("authForm");
    if (!form) return;

    const isSignUp = targetMode ? targetMode === "signup" : form.dataset.mode !== "signup";
    const title = document.getElementById("authModalTitle");
    const subtitle = document.getElementById("authModalSubtitle");
    const submitBtn = document.getElementById("authSubmitBtn");
    const togglePrompt = document.getElementById("authTogglePrompt");
    const toggleLink = document.getElementById("authToggleLink");

    if (!isSignUp) {
      form.dataset.mode = "signin";
      if (title) title.textContent = "Sign in to SpendSense";
      if (subtitle) subtitle.textContent = "Manage your finances with intelligent AI receipt scanning";
      if (submitBtn) submitBtn.textContent = "Sign In";
      if (togglePrompt) togglePrompt.textContent = "Don't have an account?";
      if (toggleLink) toggleLink.textContent = "Sign up";
    } else {
      form.dataset.mode = "signup";
      if (title) title.textContent = "Create an Account";
      if (subtitle) subtitle.textContent = "Track, itemize, and budget your expenses effortlessly";
      if (submitBtn) submitBtn.textContent = "Create Account";
      if (togglePrompt) togglePrompt.textContent = "Already have an account?";
      if (toggleLink) toggleLink.textContent = "Sign in";
    }
  },

  /**
   * Helper to sync user profile info across the sidebar on any authenticated page
   */
  syncSidebarUser(user) {
    if (!user) return;

    const isDemo = window.DemoManager && DemoManager.isDemoMode();
    const meta = user.user_metadata || {};
    let capName = "User";

    if (isDemo) {
      const demoSavedName = localStorage.getItem("spendsense_demo_name");
      capName = demoSavedName || "Alex Vance";
    } else {
      const userScopedKey = user?.id ? `spendsense_name_${user.id}` : "spendsense_user_name";
      const customName = localStorage.getItem(userScopedKey) || localStorage.getItem("spendsense_user_name");
      const name = customName || meta.full_name || meta.name || user.email?.split("@")[0] || "User";
      capName = name.charAt(0).toUpperCase() + name.slice(1);
    }

    const initials = isDemo ? "AV" : (capName.slice(0, 2) || "SS").toUpperCase();

    const avatarEl = document.getElementById("sidebarAvatar");
    if (avatarEl) {
      if (!isDemo && (meta.avatar_url || meta.picture)) {
        avatarEl.innerHTML = `<img src="${meta.avatar_url || meta.picture}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      } else {
        avatarEl.textContent = initials;
      }
    }

    const userNameEl = document.getElementById("sidebarUserName");
    if (userNameEl) {
      userNameEl.textContent = capName;
    }

    // Subtitle in sidebar footer (display email or account mode)
    const statusEl = document.querySelector(".sidebar-footer .user-status");
    if (statusEl) {
      if (isDemo) {
        statusEl.textContent = "Demo Account";
      } else {
        const email = user.email || "";
        statusEl.textContent = email.length > 22 ? email.slice(0, 20) + "..." : (email || "Personal");
      }
    }

    const heroTitle = document.getElementById("heroGreetingTitle");
    if (heroTitle) {
      const hour = new Date().getHours();
      let greeting = "Good evening";
      if (hour < 12) greeting = "Good morning";
      else if (hour < 17) greeting = "Good afternoon";
      heroTitle.textContent = `${greeting}, ${capName}`;
    }
  },

  async signOut() {
    if (window.DemoManager) {
      localStorage.setItem(DemoManager.STORAGE_KEY_MODE, "false");
    }

    if (window.supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (e) {}
    }
    window.location.href = "index.html";
  },

  async confirmAndSignOut() {
    if (window.UI && typeof UI.showLogoutModal === "function") {
      const confirmed = await UI.showLogoutModal();
      if (confirmed) {
        await this.signOut();
      }
    } else {
      await this.signOut();
    }
  },

  showError(msg) {
    const errEl = document.getElementById("authErrorBanner");
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = "block";
    }
  },

  clearError() {
    const errEl = document.getElementById("authErrorBanner");
    if (errEl) {
      errEl.style.display = "none";
      errEl.textContent = "";
    }
  },
};

window.Auth = Auth;
