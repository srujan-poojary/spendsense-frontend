// SpendSense - Application Bootstrapper
const App = {
  async init() {
    console.log("🚀 Initializing SpendSense...");

    // 1. Initialize Navigation
    Navigation.init();

    // 2. Initialize Receipt Scanner
    ReceiptScanner.init();

    // 3. Initialize Transactions
    Transactions.init();

    // 4. Initialize Settings handlers
    this.bindSettingsEvents();

    // 5. Initialize Authentication (will show authScreen or trigger onAuthenticated)
    await Auth.init();
  },

  /**
   * Called once user session is verified
   */
  async onAuthenticated(user) {
    console.log("✅ Authenticated user:", user.email);

    // Load user settings
    this.loadSettings();

    // Load dashboard metrics and transactions
    await Dashboard.load();
    await Transactions.load();

    // Set default active view
    Navigation.navigateTo("overview");
  },

  bindSettingsEvents() {
    const saveBtn = document.getElementById("saveSettingsBtn");
    if (!saveBtn) return;

    saveBtn.addEventListener("click", async () => {
      const budgetInput = document.getElementById("budgetInput");
      const currencySelect = document.getElementById("currencySelect");

      const budget = Number(budgetInput?.value) || CONFIG.DEFAULT_MONTHLY_BUDGET;
      const currency = currencySelect?.value || "INR";

      if (window.Dashboard && typeof Dashboard.setMonthlyBudget === "function") {
        Dashboard.setMonthlyBudget(budget);
      } else {
        localStorage.setItem("spendsense_monthly_budget", budget);
      }
      localStorage.setItem("spendsense_currency", currency);

      UI.toast("Settings saved successfully.", "success");

      // Reload dashboard so Budget Left and usage percentages update immediately
      await Dashboard.refresh();
    });
  },

  loadSettings() {
    const budget = window.Dashboard && typeof Dashboard.getMonthlyBudget === "function"
      ? Dashboard.getMonthlyBudget()
      : (localStorage.getItem("spendsense_monthly_budget") || CONFIG.DEFAULT_MONTHLY_BUDGET);
    const currency = localStorage.getItem("spendsense_currency") || "INR";

    const budgetInput = document.getElementById("budgetInput");
    const currencySelect = document.getElementById("currencySelect");

    if (budgetInput) budgetInput.value = budget;
    if (currencySelect) currencySelect.value = currency;
  },
};

window.App = App;

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
